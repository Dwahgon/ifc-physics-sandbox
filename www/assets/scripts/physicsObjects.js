var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./physicsProperties", "./rendering", "./types", "./vector2"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const PhysicsProperties = __importStar(require("./physicsProperties"));
    const rendering_1 = require("./rendering");
    const types_1 = require("./types");
    const vector2_1 = __importDefault(require("./vector2"));
    class PhysicsObject {
        constructor(kind, name, sprite, ambient) {
            this.kind = kind;
            this.name = name;
            this.sprite = sprite;
            this.ambient = ambient;
            this.objectProperties = [];
            this.ambient.addObject(this);
        }
        addProperties(...properties) {
            properties.forEach(property => this.objectProperties.push(property));
        }
        simulate(step) {
            this.objectProperties.forEach(property => property.simulateStep(step));
        }
        reset() {
            this.objectProperties.forEach(property => property.reset());
        }
        getProperty(type) {
            switch (type) {
                case types_1.PhysicsPropertyType.All:
                    return this.objectProperties;
                default:
                    return this.objectProperties.find(physicsProperty => { return physicsProperty.kind == type; });
            }
        }
        static createPhysicsObject(type, canvasRenderer, ambient, properties) {
            switch (type) {
                case types_1.PhysicsObjectType.Solid:
                    const obj = new PhysicsObject(type, "Sólido", new rendering_1.Sprite(canvasRenderer, "./assets/images/solid.png", new vector2_1.default(0, 0), new vector2_1.default(512, 512), vector2_1.default.zero, vector2_1.default.zero), ambient);
                    obj.addProperties(new PhysicsProperties.ObjectPosition(properties ? properties.position : vector2_1.default.zero, obj));
                    obj.addProperties(new PhysicsProperties.ObjectSize(properties ? properties.size : vector2_1.default.zero, obj));
                    obj.addProperties(new PhysicsProperties.ObjectArea(obj));
                    obj.addProperties(new PhysicsProperties.ObjectAcceleration(obj));
                    obj.addProperties(new PhysicsProperties.ObjectVelocity(obj));
                    obj.addProperties(new PhysicsProperties.ObjectDisplacement(obj));
                    return obj;
            }
        }
        /* Selectable */
        getName() {
            return this.name;
        }
        appendPropertyListItems() {
            this.objectProperties.forEach(property => {
                if (property.propertyLI)
                    property.propertyLI.appendToPropertyUL();
            });
        }
        get isFollowable() {
            return true;
        }
        get isDeletable() {
            return true;
        }
        destroy() {
            this.sprite.stopDrawing();
            const index = this.ambient.objects.indexOf(this);
            this.ambient.objects.splice(index, 1);
        }
        toJSON() {
            const properties = [];
            this.objectProperties.forEach(prop => properties.push(prop.toJSON()));
            return Object.assign({}, {
                kind: this.kind,
                properties: properties
            });
        }
        static fromJSON(json, canvasRenderer, ambient) {
            if (typeof json === "string") {
                return JSON.parse(json, function (key, value) {
                    return key === "" ? PhysicsObject.fromJSON(value, canvasRenderer, ambient) : value;
                });
            }
            else {
                const physicsObj = this.createPhysicsObject(json.kind, canvasRenderer, ambient);
                json.properties.forEach(prop => {
                    physicsObj.getProperty(prop.kind).initialValue = prop.iValue;
                });
                return physicsObj;
            }
        }
    }
    exports.PhysicsObject = PhysicsObject;
});
