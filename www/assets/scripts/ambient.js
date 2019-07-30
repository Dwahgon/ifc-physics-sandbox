define(["require", "exports", "./main", "./physicsObjects"], function (require, exports, main_1, physicsObjects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading ambient");
    class Ambient {
        constructor() {
            this.objects = [];
        }
        toJSON() {
            let objectsArrayJson = [];
            this.objects.forEach(obj => objectsArrayJson.push(obj.toJSON()));
            return Object.assign({}, this, {
                objects: objectsArrayJson
            });
        }
        static fromJSON(json) {
            if (typeof json === "string") {
                return JSON.parse(json, function (key, value) {
                    return key === "" ? Ambient.fromJSON(value) : value;
                });
            }
            else {
                const loadedAmbient = new Ambient();
                json.objects.forEach(obj => physicsObjects_1.PhysicsObject.fromJSON(obj, loadedAmbient));
                return loadedAmbient;
            }
        }
        getObjectOnPosition(pos, convertToWorldPos) {
            if (convertToWorldPos)
                pos = main_1.canvasRenderer.camera.getWorldPosFromCanvas(pos);
            for (const obj of this.objects) {
                if (obj.isPositionInsideObject(pos))
                    return obj;
            }
            return null;
        }
        addObject(obj) {
            this.objects.push(obj);
        }
        get name() {
            return "Ambiente";
        }
        getProperty() {
            return undefined;
        }
        get isFollowable() {
            return false;
        }
        draw(cam, ctx) {
            this.objects.forEach(obj => obj.sprite.draw(cam, ctx));
        }
        simulate(step) {
            this.objects.forEach(object => object.simulate(step));
        }
        reset() {
            this.objects.forEach(object => object.reset());
        }
    }
    exports.default = Ambient;
});
