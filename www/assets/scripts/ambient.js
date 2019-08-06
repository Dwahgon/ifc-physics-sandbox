var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./main", "./physicsObjects", "./vector2", "./document"], function (require, exports, main_1, physicsObjects_1, vector2_1, document_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading ambient");
    class Ambient {
        constructor() {
            this.objects = [];
            this.onMouseMove = null;
            this.onTouchMove = null;
            this.onMouseUp = null;
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
        get name() {
            return "Ambiente";
        }
        get isFollowable() {
            return false;
        }
        toJSON() {
            const objectsArrayJson = [];
            this.objects.forEach(obj => objectsArrayJson.push(obj.toJSON()));
            return Object.assign({}, this, {
                objects: objectsArrayJson
            });
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
        getProperty() {
            return undefined;
        }
        draw(cam, ctx) {
            this.objects.forEach(obj => obj.sprite.draw(cam, ctx));
        }
        onCanvasAdded(canvasRenderer) {
            const canvas = canvasRenderer.context.canvas;
            const camera = canvasRenderer.camera;
            this.onMouseMove = (ev) => this.setCursor(camera, new vector2_1.default(ev.offsetX, -ev.offsetY), canvas);
            this.onTouchMove = (ev) => this.setCursor(camera, camera.getTouchPosition(ev), canvas);
            this.onMouseUp = (ev) => this.selectObject(camera, ev);
            canvas.addEventListener("mousemove", this.onMouseMove);
            canvas.addEventListener("touchmove", this.onTouchMove);
            canvas.addEventListener("mouseup", this.onMouseUp);
        }
        onCanvasRemoved(canvasRenderer) {
            const canvas = canvasRenderer.context.canvas;
            canvas.removeEventListener("mousemove", this.onMouseMove);
            canvas.removeEventListener("touchmove", this.onTouchMove);
            canvas.removeEventListener("mouseup", this.onMouseUp);
        }
        simulate(step) {
            this.objects.forEach(object => object.simulate(step));
        }
        reset() {
            this.objects.forEach(object => object.reset());
        }
        setCursor(camera, cursorCoordinates, canvas) {
            if (!camera.isMouseDown) {
                const obj = this.getObjectOnPosition(new vector2_1.default(cursorCoordinates.x, -cursorCoordinates.y), true);
                canvas.style.cursor = (obj) ? "pointer" : "default";
            }
        }
        selectObject(camera, ev) {
            if (!camera.mouseMoved) {
                const clickedPos = new vector2_1.default(ev.offsetX, ev.offsetY);
                const obj = this.getObjectOnPosition(clickedPos, true);
                document_1.ObjectSelectionController.selectObject(obj ? obj : this);
            }
        }
    }
    exports.default = Ambient;
});
