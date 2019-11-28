var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./document/propertyEditor", "./genericCalulator", "./types", "./vector2", "./document/buttons"], function (require, exports, propertyEditor_1, genericCalulator_1, types_1, vector2_1, buttons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading physicsProperties");
    class PhysicsProperty {
        constructor(kind, changeable, object, genericCalculator, simulationPriority = 0) {
            this.kind = kind;
            this.changeable = changeable;
            this.object = object;
            this.genericCalculator = genericCalculator;
            this.simulationPriority = simulationPriority;
            this.propertyEditorInput = null;
            this.active = true;
            this.iValue = genericCalculator.zero;
            this.oValue = genericCalculator.zero;
            this.doDrawGizmos = false;
            this.iValueChangedListeners = [];
        }
        get initialValue() {
            return this.iValue;
        }
        set initialValue(value) {
            this.iValue = value;
            this.updateInputValue(this.value);
            this.fireIValueChanged();
        }
        get value() {
            return this.genericCalculator.sum(this.iValue, this.oValue);
        }
        set value(value) {
            this.oValue = this.genericCalculator.sub(value, this.iValue);
            this.updateInputValue(this.value);
        }
        onUserInput(formData) {
            this.initialValue = formData.values().next().value;
        }
        drawGizmos(canvasRenderer) { }
        simulate(step) { }
        reset() {
            this.value = this.initialValue;
        }
        toJSON() {
            return Object.assign({}, {
                kind: this.kind,
                iValue: this.iValue
            });
        }
        valueFromJSON(json) {
            this.initialValue = this.genericCalculator.fromJSON(json);
        }
        onIValueChanged(f) {
            this.iValueChangedListeners.push(f);
            return f;
        }
        updateInputValue(value) {
            if (this.propertyEditorInput)
                this.propertyEditorInput.getInput().updateValue(value);
        }
        fireIValueChanged() {
            this.iValueChangedListeners.forEach(f => f(this));
        }
    }
    PhysicsProperty.DEFAULT_VECTOR_STYLE = {
        style: "lightblue",
        strokeStyle: "black",
        strokeWidth: 1,
        lineWidth: 3,
        headAngle: Math.PI / 6,
        headLength: 10,
        rectDashOffset: [5, 5],
        rectStyle: "grey",
        rectThickness: 2,
        circleRadius: 3
    };
    PhysicsProperty.SUB_VECTOR_STYLE = {
        style: "orange",
        strokeStyle: "black",
        strokeWidth: 1,
        lineWidth: 2,
        headAngle: Math.PI / 6,
        headLength: 10,
        rectDashOffset: [5, 5],
        rectStyle: "lightgrey",
        rectThickness: 0,
        circleRadius: 3
    };
    exports.default = PhysicsProperty;
    class ObjectPosition extends PhysicsProperty {
        constructor(object, initialPosition) {
            super("position", true, object, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "<b><i>r</b></i>", "Localização", 0, true, false, "Posição", 0);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("position", "m", initialPosition, true, false));
            this.initialValue = initialPosition;
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
        updateSpritePosition() {
            this.object.sprite.drawPosition = this.value;
        }
        drawGizmos(canvasRenderer) {
            canvasRenderer.drawingTools.drawVector(vector2_1.default.zero, this.value, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }
    exports.ObjectPosition = ObjectPosition;
    class ObjectSize extends PhysicsProperty {
        constructor(object, initialSize) {
            super("size", true, object, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "l, h", "Dimensões", 1, true, false, "Comprimento e altura (Tamanho)", 1);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("size", "m", initialSize, true, false));
            this.objectPosition = this.object.getProperty("position");
            this.initialValue = initialSize;
        }
        updateSpriteSize() {
            this.object.sprite.drawSize = this.value;
        }
        set initialValue(value) {
            super.initialValue = value;
            this.updateSpriteSize();
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
            if (this.objectPosition) {
                const from = this.objectPosition.value.sub(this.value.div(2)); //from = objectPosition - objectSize / 2
                const to = this.objectPosition.value.add(this.value.div(2)); //to = objectPosition + objectSize / 2
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
    }
    exports.ObjectSize = ObjectSize;
    class ObjectArea extends PhysicsProperty {
        constructor(object) {
            super("area", false, object, genericCalulator_1.NumberCalculator.instance);
            const objectSize = object.getProperty("size");
            const updateIValue = () => { this.initialValue = objectSize.value.x * objectSize.value.y; };
            updateIValue();
            objectSize.onIValueChanged(updateIValue.bind(this));
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "A", "Dimensões", 2, false, false, "Área", 2);
            this.propertyEditorInput.addInput(new propertyEditor_1.NumberInputListRow("area", "m", this.initialValue, false, false));
        }
    }
    exports.ObjectArea = ObjectArea;
    class ObjectVelocity extends PhysicsProperty {
        constructor(object) {
            super("velocity", true, object, genericCalulator_1.Vector2Calculator.instance, 1);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "<b><i>v</b></i>", "Cinemática", 2, true, false, "Vetor velocidade", 3);
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
            super("displacement", false, object, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "<b><i>Δs</i></b>", "Cinemática", 5, false, false, "Vetor deslocamento", 4);
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
            super("acceleration", true, object, genericCalulator_1.Vector2Calculator.instance, 2);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "<b><i>a</i></b>", "Cinemática", 3, true, false, "Vetor aceleração", 5);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("acceleration", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue, true, false, "m/s²"));
            this.objectCentripitalAcceleration = this.object.getProperty("centripetalAcceleration");
            this.objectPosition = this.object.getProperty("position");
            this.netForce = this.object.getProperty("netForce");
            this.mass = this.object.getProperty("mass");
        }
        simulate() {
            let value = this.initialValue;
            if (this.objectCentripitalAcceleration && this.objectPosition)
                this.value = this.initialValue.add(this.objectCentripitalAcceleration.calculate(this.objectPosition.value));
            if (this.netForce && this.mass && this.objectPosition && this.mass.value > 0)
                this.value = this.value.add(this.netForce.calculate().div(this.mass.value / 1000));
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
            super("centripetalAcceleration", true, object, genericCalulator_1.TrackingVectorCalculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "<b><i>a<sub>c</sub></i></b>", "Cinemática", 4, true, false, "Vetor aceleração centrípeta", 6);
            this.propertyEditorInput.addInput(new propertyEditor_1.NumberInputListRow("módulo", "m", 0, true, true));
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("ponto", "m", vector2_1.default.zero, true, true));
            this.objectPosition = this.object.getProperty("position");
        }
        calculate(p) {
            const VP = this.value.target.sub(p);
            const dir = vector2_1.default.equals(VP, vector2_1.default.zero) ? vector2_1.default.zero : VP.unit();
            return dir.mult(this.value.magnitude);
        }
        onUserInput(formData) {
            this.initialValue = {
                magnitude: formData.get("módulo"),
                target: formData.get("ponto")
            };
        }
        onUserToggle(v) {
            this.active = v;
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value;
                const to = from.add(this.calculate(from));
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
        updateInputValue(value) {
            if (this.propertyEditorInput) {
                this.propertyEditorInput.getInput("módulo").updateValue(value.magnitude);
                this.propertyEditorInput.getInput("ponto").updateValue(value.target);
            }
        }
    }
    exports.ObjectCentripetalAcceleration = ObjectCentripetalAcceleration;
    class ObjectMass extends PhysicsProperty {
        constructor(object) {
            super("mass", true, object, genericCalulator_1.NumberCalculator.instance);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "m", "Geral", 3, true, false, "Massa", 7);
            this.propertyEditorInput.addInput(new propertyEditor_1.NumberInputListRow("mass", "g", 0, true, false));
        }
    }
    exports.ObjectMass = ObjectMass;
    class ObjectMomentum extends PhysicsProperty {
        constructor(object) {
            super("momentum", false, object, genericCalulator_1.Vector2Calculator.instance);
            this.mass = this.object.getProperty("mass");
            this.velocity = this.object.getProperty("velocity");
            this.position = this.object.getProperty("position");
            const updateValue = () => this.initialValue = this.calculate();
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "<b>p<b>", "Dinâmica", 5, false, false, "Vetor momentum", 8);
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("momentum", "N·s", this.initialValue, false, false, "N*s"));
            this.initialValue = updateValue();
            this.mass.onIValueChanged(updateValue.bind(this));
            this.velocity.onIValueChanged(updateValue.bind(this));
        }
        simulate() {
            this.value = this.calculate();
        }
        calculate() {
            return this.velocity.value.mult(this.mass.value / 1000);
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.position) {
                const from = this.position.value;
                const to = from.add(this.value);
                canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
            }
        }
    }
    exports.ObjectMomentum = ObjectMomentum;
    class ObjectNetForce extends PhysicsProperty {
        constructor(object) {
            super("netForce", true, object, genericCalulator_1.Vector2Calculator.instance);
            this.forceList = new Map();
            this.position = object.getProperty("position");
            const button = new buttons_1.Button(buttons_1.Button.createButtonElement({
                buttonName: `add-force-${object.name}`,
                buttonColor: types_1.ButtonColor.InvisibleBackground,
                enabled: true,
                imgSrc: "./assets/images/addicon.svg"
            }));
            button.onClick = () => this.addForce(this.generateForceName(), vector2_1.default.zero);
            this.propertyEditorInput = new propertyEditor_1.PropertyEditorInputList(this, "F", "Dinâmica", 6, true, false, "Vetor força total", 9);
            this.propertyEditorInput.addInput(new propertyEditor_1.ButtonInputListRow("Criar Força", button));
            this.propertyEditorInput.addInput(new propertyEditor_1.Vector2InputListRow("F<sub>t</sub>", "N", this.calculate(), false, true, "N"));
        }
        addForce(name, value) {
            this.forceList.set(name, value);
            const newInput = new propertyEditor_1.Vector2InputListRow(name, "N", value, true, true, "N");
            const deleteButton = new buttons_1.Button(buttons_1.Button.createButtonElement({
                buttonName: `delete-force-${name}`,
                buttonColor: types_1.ButtonColor.InvisibleBackground,
                enabled: true,
                imgSrc: "./assets/images/destroyicon.svg"
            }));
            deleteButton.onClick = () => this.removeForce(name);
            newInput.element.insertBefore(deleteButton.element, newInput.element.firstChild);
            this.propertyEditorInput.addInput(newInput);
        }
        calculate() {
            let total = vector2_1.default.zero;
            this.forceList.forEach(v => total = total.add(v));
            return total;
        }
        drawGizmos(canvasRenderer) {
            if (this.position && this.doDrawGizmos) {
                const from = this.position.value;
                const totalTo = from.add(this.calculate());
                canvasRenderer.drawingTools.drawVector(from, totalTo, PhysicsProperty.DEFAULT_VECTOR_STYLE);
                if (this.forceList.size > 1)
                    this.forceList.forEach(v => canvasRenderer.drawingTools.drawVector(from, from.add(v), PhysicsProperty.SUB_VECTOR_STYLE));
            }
        }
        getForce(name) {
            return this.forceList.get(name);
        }
        onUserInput(formData) {
            Array.from(this.forceList.keys()).forEach(k => this.forceList.set(k, formData.get(k)));
            this.initialValue = this.calculate();
        }
        removeForce(name) {
            this.forceList.delete(name);
            this.propertyEditorInput.removeInput(name);
            this.updateTotalForceDisplay();
        }
        toJSON() {
            let values = [];
            this.forceList.forEach((v, k) => values.push({ key: k, force: v }));
            return Object.assign({}, {
                kind: this.kind,
                iValue: values
            });
        }
        valueFromJSON(json) {
            json.forEach(value => this.addForce(value.key, vector2_1.default.fromJSON(value.force)));
        }
        updateInputValue(value) {
            this.updateTotalForceDisplay();
            this.updateSubForceDisplay();
        }
        generateForceName() {
            const keys = Array.from(this.forceList.keys());
            for (let i = 0; i < keys.length; i++) {
                const name = `F${i}`;
                const key = keys.find(k => k === name);
                if (!key)
                    return name;
            }
            return `F${keys.length}`;
        }
        updateSubForceDisplay() {
            this.forceList.forEach((f, k) => this.propertyEditorInput.getInput(k).updateValue(f));
        }
        updateTotalForceDisplay() {
            this.propertyEditorInput.getInput("F<sub>t</sub>").updateValue(this.calculate());
        }
    }
    exports.ObjectNetForce = ObjectNetForce;
});
