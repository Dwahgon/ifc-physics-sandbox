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
define(["require", "exports", "./physicsProperties", "./rendering/sprite", "./types", "./vector2", "./document/documentUtilities", "./rendering/gizmos"], function (require, exports, PhysicsProperties, sprite_1, types_1, vector2_1, documentUtilities_1, gizmos_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    PhysicsProperties = __importStar(PhysicsProperties);
    vector2_1 = __importDefault(vector2_1);
    gizmos_1 = __importDefault(gizmos_1);
    console.log("Loading physicsobjects");
    class PhysicsObject {
        constructor(kind, sprite, ambient, name) {
            this.kind = kind;
            this.sprite = sprite;
            this.ambient = ambient;
            this.properties = new Map();
            this.name = name || this.generateName();
            this.ambient.addObject(this);
        }
        get isDeletable() {
            return true;
        }
        static createPhysicsObject(type, ambient, properties) {
            switch (type) {
                case types_1.PhysicsObjectType.Solid:
                    return new Solid(ambient, properties);
            }
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
        draw(canvasRenderer) {
            this.sprite.draw(canvasRenderer);
            this.properties.forEach(property => property.drawGizmos(canvasRenderer));
            if (documentUtilities_1.ObjectSelectionController.selectedObject == this) {
                const pos = this.getProperty("position");
                const size = this.getProperty("size");
                const drawPos = vector2_1.default.sub(pos.value, vector2_1.default.div(size.value, new vector2_1.default(2, -2)));
                gizmos_1.default.drawSelection(canvasRenderer, drawPos, size.value, { style: "MediumSeaGreen", lineThickness: 4, offset: 6, lineDash: [8, 3] });
            }
        }
        addProperty(name, property) {
            this.properties.set(name, property);
        }
        simulate(step) {
            const sorted = Array.from(this.properties.values()).sort((a, b) => { return b.simulationPriority - a.simulationPriority; });
            sorted.forEach(property => property.simulate(step));
        }
        reset() {
            this.properties.forEach(property => property.reset());
        }
        locate() {
            return this.getProperty("position").value;
        }
        generateName() {
            const objs = this.ambient.objects.filter(obj => obj.kind == this.kind);
            const defaultName = Object.getPrototypeOf(this).constructor.DEFAULT_NAME;
            let i = 0;
            while (true) {
                const object = objs.find(obj => obj.name.includes(i.toString()));
                if (!object)
                    return `${defaultName} ${i}`;
                i++;
            }
        }
        /**
         * Returns rather the position(world position) parameter is located inside the object
         * @param position
         */
        isPositionInsideObject(position) {
            const objPos = this.getProperty("position").value;
            let objSize = this.getProperty("size").value;
            objSize = vector2_1.default.div(objSize, 2);
            return position.x >= objPos.x - objSize.x &&
                position.x <= objPos.x + objSize.x &&
                position.y >= objPos.y - objSize.y &&
                position.y <= objPos.y + objSize.y;
        }
        getProperty(property) {
            if (typeof property == "number")
                return Array.from(this.properties.values()).find(el => el.kind == property);
            else
                return this.properties.get(property);
        }
        getAllProperties() {
            return Array.from(this.properties.values());
        }
        getPropertyEditorRows() {
            const rows = [];
            this.properties.forEach(el => {
                if (el.propertyEditorInput)
                    rows.push(el.propertyEditorInput);
            });
            return rows;
        }
        destroy() {
            const index = this.ambient.objects.indexOf(this);
            this.ambient.objects.splice(index, 1);
        }
        toJSON() {
            const properties = [];
            this.properties.forEach(prop => properties.push(prop.toJSON()));
            return Object.assign({}, {
                kind: this.kind,
                properties: properties
            });
        }
    }
    PhysicsObject.DEFAULT_NAME = "";
    exports.PhysicsObject = PhysicsObject;
    class Solid extends PhysicsObject {
        constructor(ambient, properties) {
            super(types_1.PhysicsObjectType.Solid, new sprite_1.Sprite("./assets/images/solid.svg", new vector2_1.default(0, 0), new vector2_1.default(512, 512), vector2_1.default.zero, vector2_1.default.zero), ambient, properties ? properties.name : undefined);
            this.addProperty("position", new PhysicsProperties.ObjectPosition(properties ? properties.position : vector2_1.default.zero, this));
            this.addProperty("acceleration", new PhysicsProperties.ObjectAcceleration(this));
            this.addProperty("velocity", new PhysicsProperties.ObjectVelocity(this));
            this.addProperty("size", new PhysicsProperties.ObjectSize(properties ? properties.size : vector2_1.default.zero, this));
            this.addProperty("area", new PhysicsProperties.ObjectArea(this));
            this.addProperty("displacement", new PhysicsProperties.ObjectDisplacement(this));
            this.addProperty("centripetalAcceleration", new PhysicsProperties.ObjectCentripetalAcceleration(this, false));
        }
    }
    Solid.DEFAULT_NAME = "Sólido";
});
