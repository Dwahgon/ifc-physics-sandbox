var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./document/propertyEditor", "./genericCalulator", "./rendering/gizmos", "./types", "./vector2"], function (require, exports, propertyEditor_1, genericCalulator_1, gizmos_1, types_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    gizmos_1 = __importDefault(gizmos_1);
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
            this.onValueChangedCallbacks = [];
            this.doDrawGizmos = false;
        }
        get initialValue() {
            return this.iValue;
        }
        set initialValue(value) {
            this.iValue = value;
            this.propertyEditorInput.updateValue(this.value);
            this.onValueChangedCallbacks.forEach(callback => callback());
        }
        get value() {
            return this.genericCalculator.sum(this.iValue, this.oValue);
        }
        set value(value) {
            this.oValue = this.genericCalculator.sub(value, this.iValue);
            this.propertyEditorInput.updateValue(this.value);
            this.onValueChangedCallbacks.forEach(callback => callback());
        }
        onUserInput(value) {
            this.initialValue = value;
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
    }
    exports.default = PhysicsProperty;
    class ObjectPosition extends PhysicsProperty {
        constructor(initialPosition, object) {
            super(types_1.PhysicsPropertyType.ObjectPosition, true, object, initialPosition, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.Vector2PropertyEditorInput(this, "pos<sub>(x, y)</sub>", "m", "Localização", 0, true, initialPosition, this.kind);
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
                gizmos_1.default.drawPositionPoint(canvasRenderer, this.value, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, font: "italic 15px CMU Serif", pointRadius: 3 });
        }
    }
    exports.ObjectPosition = ObjectPosition;
    class ObjectSize extends PhysicsProperty {
        constructor(initialSize, object) {
            super(types_1.PhysicsPropertyType.ObjectSize, true, object, initialSize, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.Vector2PropertyEditorInput(this, "tam<sub>(x, y)</sub>", "m", "Dimensões", 1, true, initialSize, this.kind);
            this.objectPosition = this.object.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
            this.updateSpriteSize();
        }
        updateSpriteSize() {
            this.object.sprite.drawSize = this.value;
        }
        set initialValue(value) {
            super.initialValue = value;
            this.updateSpriteSize();
            // Change area
            const objArea = this.object.getProperty(types_1.PhysicsPropertyType.ObjectArea);
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
                const from = vector2_1.default.sub(this.objectPosition.value, vector2_1.default.div(this.value, 2));
                const to = vector2_1.default.sum(this.objectPosition.value, vector2_1.default.div(this.value, 2));
                gizmos_1.default.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
            }
        }
    }
    exports.ObjectSize = ObjectSize;
    class ObjectArea extends PhysicsProperty {
        constructor(object) {
            super(types_1.PhysicsPropertyType.ObjectArea, false, object, 0, 0, genericCalulator_1.NumberCalculator.instance);
            this.propertyEditorInput = new propertyEditor_1.NumberPropertyEditorInput(this, "área", "m", "Dimensões", 2, false, 0, this.kind);
            const objectSize = object.getProperty(types_1.PhysicsPropertyType.ObjectSize);
            const sizeVector2 = (objectSize) ? objectSize.initialValue : vector2_1.default.zero;
            this.initialValue = sizeVector2.x * sizeVector2.y;
        }
    }
    exports.ObjectArea = ObjectArea;
    class ObjectVelocity extends PhysicsProperty {
        constructor(object) {
            super(types_1.PhysicsPropertyType.ObjectVelocity, true, object, vector2_1.default.zero, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance, 1);
            this.propertyEditorInput = new propertyEditor_1.Vector2PropertyEditorInput(this, "vel", "<sup>m</sup>&frasl;<sub>s</sub>", "Cinemática", 2, true, vector2_1.default.zero, this.kind, "m/s");
            this.objectPosition = this.object.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
            this.objectAcceleration = this.object.getProperty(types_1.PhysicsPropertyType.ObjectAcceleration);
        }
        simulate(step) {
            const currentVel = this.value;
            if (this.objectAcceleration)
                this.value = vector2_1.default.sum(this.value, vector2_1.default.mult(this.objectAcceleration.value, step));
            if (this.objectPosition && this.objectAcceleration) {
                this.objectPosition.value = vector2_1.default.sum(this.objectPosition.value, vector2_1.default.sum(vector2_1.default.mult(currentVel, step), vector2_1.default.div(vector2_1.default.mult(this.objectAcceleration.value, Math.pow(step, 2)), 2)));
            }
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value;
                const to = vector2_1.default.sum(from, this.value);
                gizmos_1.default.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
            }
        }
    }
    exports.ObjectVelocity = ObjectVelocity;
    class ObjectDisplacement extends PhysicsProperty {
        constructor(object) {
            super(types_1.PhysicsPropertyType.ObjectDisplacement, false, object, vector2_1.default.zero, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.Vector2PropertyEditorInput(this, "des", "m", "Cinemática", 4, false, vector2_1.default.zero, this.kind, "m");
            this.objectPosition = this.object.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
        }
        simulate(step) {
            if (this.objectPosition)
                this.value = vector2_1.default.sub(this.objectPosition.value, this.objectPosition.initialValue);
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.initialValue;
                const to = vector2_1.default.sum(from, this.value);
                gizmos_1.default.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
            }
        }
    }
    exports.ObjectDisplacement = ObjectDisplacement;
    class ObjectAcceleration extends PhysicsProperty {
        constructor(object) {
            super(types_1.PhysicsPropertyType.ObjectAcceleration, true, object, vector2_1.default.zero, vector2_1.default.zero, genericCalulator_1.Vector2Calculator.instance);
            this.propertyEditorInput = new propertyEditor_1.Vector2PropertyEditorInput(this, "acel", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", "Cinemática", 3, true, this.initialValue, this.kind, "m/s²");
            this.objectPosition = this.object.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
        }
        drawGizmos(canvasRenderer) {
            if (this.doDrawGizmos && this.objectPosition) {
                const from = this.objectPosition.value;
                const to = vector2_1.default.sum(from, this.value);
                gizmos_1.default.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
            }
        }
    }
    exports.ObjectAcceleration = ObjectAcceleration;
});