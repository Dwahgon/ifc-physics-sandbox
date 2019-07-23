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
define(["require", "exports", "./physicsProperties", "./rendering", "./types", "./vector2"], function (require, exports, PhysicsProperties, rendering_1, types_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    PhysicsProperties = __importStar(PhysicsProperties);
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading physicsobjects");
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
            this.objectProperties.forEach(property => property.simulate(step));
        }
        reset() {
            this.objectProperties.forEach(property => property.reset());
        }
        /**
         * Returns rather the position(world position) parameter is located inside the object
         * @param position
         */
        isPositionInsideObject(position) {
            const objPos = this.getProperty(types_1.PhysicsPropertyType.ObjectPosition).value;
            let objSize = this.getProperty(types_1.PhysicsPropertyType.ObjectSize).value;
            objSize = vector2_1.default.div(objSize, 2);
            return position.x >= objPos.x - objSize.x &&
                position.x <= objPos.x + objSize.x &&
                position.y >= objPos.y - objSize.y &&
                position.y <= objPos.y + objSize.y;
        }
        getProperty(type) {
            switch (type) {
                case types_1.PhysicsPropertyType.All:
                    return this.objectProperties;
                default:
                    return this.objectProperties.find(physicsProperty => { return physicsProperty.kind == type; });
            }
        }
        static createPhysicsObject(type, ambient, properties) {
            switch (type) {
                case types_1.PhysicsObjectType.Solid:
                    const obj = new PhysicsObject(type, "Sólido", new rendering_1.Sprite("./assets/images/solid.svg", new vector2_1.default(0, 0), new vector2_1.default(512, 512), vector2_1.default.zero, vector2_1.default.zero), ambient);
                    obj.addProperties(new PhysicsProperties.ObjectPosition(properties ? properties.position : vector2_1.default.zero, obj));
                    obj.addProperties(new PhysicsProperties.ObjectSize(properties ? properties.size : vector2_1.default.zero, obj));
                    obj.addProperties(new PhysicsProperties.ObjectArea(obj));
                    obj.addProperties(new PhysicsProperties.ObjectAcceleration(obj));
                    obj.addProperties(new PhysicsProperties.ObjectVelocity(obj));
                    obj.addProperties(new PhysicsProperties.ObjectDisplacement(obj));
                    return obj;
            }
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
        static fromJSON(json, ambient) {
            if (typeof json === "string") {
                return JSON.parse(json, function (key, value) {
                    return key === "" ? PhysicsObject.fromJSON(value, ambient) : value;
                });
            }
            else {
                const physicsObj = this.createPhysicsObject(json.kind, ambient);
                json.properties.forEach(prop => {
                    physicsObj.getProperty(prop.kind).initialValue = prop.iValue;
                });
                return physicsObj;
            }
        }
    }
    exports.PhysicsObject = PhysicsObject;
});
