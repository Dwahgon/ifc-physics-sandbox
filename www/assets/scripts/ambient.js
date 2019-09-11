var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./main", "./physicsObjects", "./types", "./vector2", "./document"], function (require, exports, main_1, physicsObjects_1, types_1, vector2_1, document_1) {
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
            this.onMouseDown = null;
            this.onTouchStart = null;
            this.draggingObject = null;
            this.onKeyDown = null;
            this.onKeyUp = null;
            this.snapToGrid = false;
            this.lastCursosPos = vector2_1.default.zero;
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
        draw(canvasRenderer) {
            this.objects.forEach(obj => obj.draw(canvasRenderer));
        }
        onCanvasAdded(canvasRenderer) {
            const canvas = canvasRenderer.context.canvas;
            const camera = canvasRenderer.camera;
            this.onMouseMove = (ev) => this.setCursor(camera, new vector2_1.default(ev.offsetX, -ev.offsetY), canvas);
            this.onTouchMove = (ev) => this.setCursor(camera, camera.getTouchPosition(ev), canvas);
            this.onMouseUp = (ev) => this.selectObject(camera, ev);
            this.onMouseDown = (ev) => this.dragObject(camera, new vector2_1.default(ev.offsetX, -ev.offsetY));
            this.onTouchStart = (ev) => this.dragObject(camera, camera.getTouchPosition(ev));
            this.onKeyDown = (ev) => this.setSnapToGrid(ev, true);
            this.onKeyUp = (ev) => this.setSnapToGrid(ev, false);
            canvas.addEventListener("mousemove", this.onMouseMove);
            canvas.addEventListener("touchmove", this.onTouchMove);
            canvas.addEventListener("mouseup", this.onMouseUp);
            canvas.addEventListener("mousedown", this.onMouseDown);
            canvas.addEventListener("touchstart", this.onTouchStart);
            document.addEventListener("keydown", this.onKeyDown);
            document.addEventListener("keyup", this.onKeyUp);
        }
        onCanvasRemoved(canvasRenderer) {
            const canvas = canvasRenderer.context.canvas;
            canvas.removeEventListener("mousemove", this.onMouseMove);
            canvas.removeEventListener("touchmove", this.onTouchMove);
            canvas.removeEventListener("mouseup", this.onMouseUp);
            canvas.removeEventListener("mousedown", this.onMouseDown);
            canvas.removeEventListener("touchstart", this.onTouchStart);
            document.removeEventListener("keydown", this.onKeyDown);
            document.removeEventListener("keyup", this.onKeyUp);
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
            else if (this.draggingObject && !vector2_1.default.equals(cursorCoordinates, this.lastCursosPos)) {
                canvas.style.cursor = "pointer";
                const objPos = this.draggingObject.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
                const cursorPos = new vector2_1.default(cursorCoordinates.x, -cursorCoordinates.y);
                const cursorWorldPos = camera.getWorldPosFromCanvas(cursorPos);
                const newPos = (this.snapToGrid) ? new vector2_1.default(Math.round(cursorWorldPos.x), Math.round(cursorWorldPos.y)) : cursorWorldPos;
                objPos.initialValue = newPos;
            }
            this.lastCursosPos = cursorCoordinates;
        }
        dragObject(camera, cursorCoordinates) {
            const obj = this.getObjectOnPosition(new vector2_1.default(cursorCoordinates.x, -cursorCoordinates.y), true);
            if (obj) {
                this.draggingObject = obj;
                camera.allowMovement = false;
            }
        }
        selectObject(camera, ev) {
            if (!camera.mouseMoved) {
                const clickedPos = new vector2_1.default(ev.offsetX, ev.offsetY);
                const obj = this.getObjectOnPosition(clickedPos, true);
                document_1.ObjectSelectionController.selectObject(obj ? obj : this);
            }
            this.draggingObject = null;
            camera.allowMovement = true;
        }
        setSnapToGrid(ev, value) {
            if (ev.key == "Shift")
                this.snapToGrid = value;
        }
    }
    exports.default = Ambient;
});
