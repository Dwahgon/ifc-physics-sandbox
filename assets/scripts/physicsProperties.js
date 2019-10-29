var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./document/propertyEditor", "./genericCalulator", "./vector2"], function (require, exports, propertyEditor_1, genericCalulator_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading physicsProperties");
    class PhysicsProperty {
        constructor(kind, changeable, object, iValue, oValue, genericCalculator, simulationPriority = 0) {
            this.kind = kind;
            this.changeable = changeable;
            this.object = object;
            this.iValue = iValue;
            this.oValue = oValue;
            this.genericCalculator = genericCalculator;
            this.simulationPriority = simulationPriority;
            this.propertyEditorInput = null;
            this.active = true;
            this.doDrawGizmos = false;
        }
        get initialValue() {
            return this.iValue;
        }
        set initialValue(value) {
            this.iValue = value;
            this.updateInputValue(this.value);
        }
        get value() {
            return this.genericCalculator.sum(this.iValue, this.oValue);
        }
        set value(value) {
            this.oValue = this.genericCalculator.sub(value, this.iValue);
            this.updateInputValue(this.value);
        }
        onUserInput(formData) {
            this.initialValue = formData[0];
        }
        drawGizmos(canvasRenderer) {
        }
        simulate(step) {
        }
        reset() {
            this.value = this.initialValue;
        }
        toJSON() {
            return Object.assign({}, {
                kind: this.kind,
                iValue: this.iValue
            });
        }
        updateInputValue(value) {
            if (this.propertyEditorInput)
                this.propertyEditorInput.getInput().updateValue(value);
        }
    }
    PhysicsProperty.DEFAULT_VECTOR_STYLE = {
        style: "lightblue",
        strokeStyle: "black",
        strokeWidth: 2,
        lineWidth: 3,
        headAngle: Math.PI / 6,
        headLength: 10,
        rectDashOffset: [5, 5],
        rectStyle: "grey",
        rectThickness: 2
    };
    exports.default = PhysicsProperty;
    class ObjectPosition extends PhysicsProperty {
        constructor(initialPosition, object) {
            super("position", true, object, initialPosition, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "pos<sub>(x, y)</sub>", "Localização", 0, true, false, "Posição", 0);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("position", "m", initialPosition, true, false));
            this.updateSpritePosition();
        }
        updateSpritePosition() {
            this.object.sprite.drawPosition = this.value;
        }
        set initialValue(value) {
            super.initialValue = value;
            this.updateSpritePosition();
        }
        get initialValue() {
            return super.initialValue;
        }
        get value() {
            return super.value;
        }
        set value(value) {
            super.value = value;
            this.updateSpritePosition();
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos)
                canvasRenderer.drawingTools.drawVector(vector2_1.default.zero, this.value, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }
    exports.ObjectPosition = ObjectPosition;
    class ObjectSize extends PhysicsProperty {
        constructor(initialSize, object) {
            super("size", true, object, initialSize, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "tam<sub>(x, y)</sub>", "Dimensões", 1, true, false, "Tamanho", 1);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("size", "m", initialSize, true, false));
            this.objectPosition = this.object.getProperty("position");
            this.updateSpriteSize();
        }
        updateSpriteSize() {
            this.object.sprite.drawSize = this.value;
        }
        set initialValue(value) {
            super.initialValue = value;
            this.updateSpriteSize();
            // Change area
            const objArea = this.object.getProperty("area");
            if (objArea)
                objArea.initialValue = this.value.x * this.value.y;
        }
        get initialValue() {
            return super.initialValue;
        }
        get value() {
            return super.value;
        }
        set value(value) {
            super.value = value;
            this.updateSpriteSize();
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value.sub(this.value.div(2)); //from = objectPosition - objectSize / 2
                const to = this.objectPosition.value.add(this.value.div(2)); //to = objectPosition + objectSize / 2
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
    }
    exports.ObjectSize = ObjectSize;
    class ObjectArea extends PhysicsProperty {
        constructor(object) {
            super("area", false, object, 0, 0, genericCalulator_1.NumberCalculator.instance);
            const objectSize = object.getProperty("size");
            const sizeVector2 = (objectSize) ? objectSize.initialValue : vector2_1.default.zero;
            this.initialValue = sizeVector2.x * sizeVector2.y;
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "área", "Dimensões", 2, false, false, "Área", 2);
            this.propertyEditorInput.addInput(new propertyEditor_1.NumberInputListRow("area", "m", this.initialValue, false, false));
        }
    }
    exports.ObjectArea = ObjectArea;
    class ObjectVelocity extends PhysicsProperty {
        constructor(object) {
            super("velocity", true, object, vector2_1.default.zero, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance, 1);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "vel", "Cinemática", 2, true, false, "Vetor velocidade", 3);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("velocity", "<sup>m</sup>&frasl;<sub>s</sub>", this.initialValue, true, false, "m/s"));
            this.objectPosition = this.object.getProperty("position");
            this.objectAcceleration = this.object.getProperty("acceleration");
        }
        simulate(step) {
            const posn = this.objectPosition ? this.objectPosition.value : null;
            const vn = this.value;
            const an = this.objectAcceleration ? this.objectAcceleration.value : null;
            if (this.objectPosition && this.objectAcceleration)
                //objectPosition = posn + vn * step + (an * step ^ 2 / 2)
                this.objectPosition.value = posn.add(vn.mult(step).add(an.mult(step * step).div(2)));
            if (this.objectAcceleration) {
                this.objectAcceleration.simulate();
                const anplus1 = this.objectAcceleration.value;
                const avgA = an.add(anplus1).div(2); //avgA = (an + anplus1) / 2
                //objectVelocity = vn + avgA * step
                this.value = vn.add(avgA.mult(step));
            }
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value;
                const to = from.add(this.value);
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
    }
    exports.ObjectVelocity = ObjectVelocity;
    class ObjectDisplacement extends PhysicsProperty {
        constructor(object) {
            super("displacement", false, object, vector2_1.default.zero, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "des", "Cinemática", 5, false, false, "Vetor deslocamento", 4);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("displacement", "m", this.initialValue, false, false, "m"));
            this.objectPosition = this.object.getProperty("position");
        }
        simulate(step) {
            if (this.objectPosition)
                this.value = this.objectPosition.value.sub(this.objectPosition.initialValue);
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.initialValue;
                const to = from.add(this.value);
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
    }
    exports.ObjectDisplacement = ObjectDisplacement;
    class ObjectAcceleration extends PhysicsProperty {
        constructor(object) {
            super("acceleration", true, object, vector2_1.default.zero, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance, 2);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "acel", "Cinemática", 3, true, false, "Vetor aceleração", 5);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("acceleration", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue, true, false, "m/s²"));
            this.objectCentripitalAcceleration = this.object.getProperty("centripetalAcceleration");
            this.objectPosition = this.object.getProperty("position");
        }
        simulate() {
            if (this.objectCentripitalAcceleration && this.objectPosition)
                this.value = this.initialValue.add(this.objectCentripitalAcceleration.getAccelerationVectorOnPoint(this.objectPosition.value));
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value;
                const to = from.add(this.value);
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
    }
    exports.ObjectAcceleration = ObjectAcceleration;
    class ObjectCentripetalAcceleration extends PhysicsProperty {
        constructor(object) {
            super("centripetalAcceleration", true, object, { vector: vector2_1.default.zero, modulus: 0 }, { vector: vector2_1.default.zero, modulus: 0 }, genericCalulator_1.VectorModulusCalculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "acel<sub>c</sub>", "Cinemática", 4, true, false, "Vetor aceleração centrípeta", 6);
            this.propertyEditorInput.addInput(new propertyEditor_1.NumberInputListRow("módulo", "m", 0, true, true));
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("ponto", "m", vector2_1.default.zero, true, true));
            this.objectPosition = this.object.getProperty("position");
        }
        getAccelerationVectorOnPoint(p) {
            const VP = this.value.vector.sub(p);
            const dir = vector2_1.default.equals(VP, vector2_1.default.zero) ? vector2_1.default.zero : VP.unit();
            return dir.mult(this.value.modulus);
        }
        onUserInput(formData) {
            this.initialValue = {
                modulus: formData[0],
                vector: formData[1]
            };
        }
        onUserToggle(v) {
            this.active = v;
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value;
                const to = from.add(this.getAccelerationVectorOnPoint(from));
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
        updateInputValue(value) {
            if (this.propertyEditorInput) {
                this.propertyEditorInput.getInput("módulo").updateValue(value.modulus);
                this.propertyEditorInput.getInput("ponto").updateValue(value.vector);
            }
        }
    }
    exports.ObjectCentripetalAcceleration = ObjectCentripetalAcceleration;
    class ObjectMass extends PhysicsProperty {
        constructor(object) {
            super("mass", true, object, 0, 0, genericCalulator_1.NumberCalculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "massa", "Geral", 3, true, false, "Massa");
            this.propertyEditorInput.addInput(new propertyEditor_1.NumberInputListRow("mass", "g", 0, true, false));
        }
    }
    exports.ObjectMass = ObjectMass;
});
// export class NetForce extends PhysicsProperty<Vector2>{
//     constructor(object: PhysicsObject){
//         super("netForce", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
//         this.propertyEditorInput = new PropertyEditorInputList(this, "força<sub>t</sub>", "Cinemática", 4, true, false, "Vetor aceleração centrípeta", 6);
//         this.propertyEditorInput.addInput(new NumberInputListRow("módulo", "m", 0, true, true));
//     }
// }
