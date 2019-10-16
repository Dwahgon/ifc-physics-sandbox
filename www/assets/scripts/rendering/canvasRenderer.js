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
define(["require", "exports", "../document/buttons", "../document/documentUtilities", "../vector2", "./drawingTools"], function (require, exports, Buttons, documentUtilities_1, vector2_1, drawingTools_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Buttons = __importStar(Buttons);
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading canvasRenderer");
    class CanvasRenderer {
        constructor(context, cameraPos = vector2_1.default.zero, cameraZoom = 100, cameraMinZoom = 10, cameraMaxZoom = 500) {
            this.context = context;
            this.isRunning = false;
            this.renderables = [];
            this.camera = new Camera(this, cameraPos, cameraZoom, cameraMinZoom, cameraMaxZoom, 5);
            this.drawingTools = new drawingTools_1.DrawingTools(context, this.camera);
            this.add({
                draw(canvasRenderer) {
                    const ctx = canvasRenderer.context;
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                }
            });
        }
        start() {
            this.isRunning = true;
            this.render(0);
        }
        stop() {
            this.isRunning = false;
        }
        add(renderable) {
            this.renderables.push(renderable);
            if (renderable.onCanvasAdded)
                renderable.onCanvasAdded(this);
        }
        remove(renderable) {
            const index = this.renderables.indexOf(renderable);
            if (index > -1)
                this.renderables.splice(index, 1);
            if (renderable.onCanvasRemoved)
                renderable.onCanvasRemoved(this);
        }
        render(step) {
            const canvas = this.context.canvas;
            const canvasParent = canvas.parentElement;
            const style = window.getComputedStyle(canvasParent, null);
            canvas.height = parseInt(style.getPropertyValue("height"));
            canvas.width = parseInt(style.getPropertyValue("width"));
            this.renderables.forEach(rn => {
                this.context.save();
                rn.draw(this, step);
                this.context.restore();
            });
            if (this.isRunning)
                window.requestAnimationFrame(this.render.bind(this));
        }
    }
    exports.CanvasRenderer = CanvasRenderer;
    class Camera {
        constructor(canvasRenderer, _pos, defaultZoom, minZoom, maxZoom, zoomStep) {
            this.canvasRenderer = canvasRenderer;
            this._pos = _pos;
            this.defaultZoom = defaultZoom;
            this.minZoom = minZoom;
            this.maxZoom = maxZoom;
            this.zoomStep = zoomStep;
            this.targetObjectPosition = null;
            this._zoom = this.defaultZoom;
            const canvas = canvasRenderer.context.canvas;
            this._isMouseDown = false;
            this._mouseMoved = false;
            this.allowMovement = true;
            this.clickedPos = vector2_1.default.zero;
            this.cameraPosOnMouseDown = vector2_1.default.zero;
            canvas.addEventListener("mousedown", ev => { this.onInputStart(new vector2_1.default(ev.offsetX, ev.offsetY)); });
            canvas.addEventListener("touchstart", ev => { this.onInputStart(this.getTouchPosition(ev)); });
            canvas.addEventListener("mousemove", ev => { this.onMove(new vector2_1.default(ev.offsetX, ev.offsetY), canvas); });
            canvas.addEventListener("touchmove", ev => { this.onMove(this.getTouchPosition(ev), canvas); });
            canvas.addEventListener("wheel", ev => { this.onWheel(ev); });
            document.addEventListener("mouseup", () => { this.onMouseUp(canvas); });
        }
        get zoom() {
            return this._zoom;
        }
        set zoom(n) {
            this._zoom = n;
            if (this._zoom < this.minZoom)
                this._zoom = this.minZoom;
            else if (this._zoom > this.maxZoom)
                this._zoom = this.maxZoom;
        }
        get pos() {
            if (this.targetObjectPosition)
                return this.targetObjectPosition.locate();
            return this._pos;
        }
        set pos(value) {
            if (this.targetObjectPosition)
                this.unfollowObject();
            this._pos = value;
        }
        get objectBeingFollowed() {
            if (this.targetObjectPosition)
                return this.targetObjectPosition;
            return null;
        }
        get isMouseDown() {
            return this._isMouseDown;
        }
        get mouseMoved() {
            return this._mouseMoved;
        }
        nextZoom() {
            this.zoom += this.zoomStep;
        }
        previousZoom() {
            this.zoom -= this.zoomStep;
        }
        resetZoom() {
            this.zoom = this.defaultZoom;
        }
        getWorldPosFromCanvas(canvasPos) {
            const canvas = this.canvasRenderer.context.canvas;
            const posX = this.pos.x - (canvas.width / 2 - canvasPos.x) / this.zoom;
            const posY = this.pos.y + (canvas.height / 2 - canvasPos.y) / this.zoom;
            return new vector2_1.default(posX, posY);
        }
        getCanvasPosFromWorld(worldPos) {
            const canvas = this.canvasRenderer.context.canvas;
            const posX = (worldPos.x - this.pos.x) * this.zoom + canvas.width / 2;
            const posY = -((worldPos.y - this.pos.y) * this.zoom - canvas.height / 2);
            return new vector2_1.default(posX, posY);
        }
        followObject(object) {
            this.targetObjectPosition = object;
            this.changeButtonText(false);
        }
        unfollowObject() {
            this.changeButtonText(true);
            this.targetObjectPosition = null;
        }
        focusOrigin() {
            this.pos = vector2_1.default.zero;
        }
        getTouchPosition(ev) {
            const touchTarget = ev.targetTouches[0].target;
            const rect = touchTarget.getBoundingClientRect();
            const x = ev.targetTouches[0].pageX - rect.left;
            const y = ev.targetTouches[0].pageY - rect.top;
            return new vector2_1.default(x, y);
        }
        changeButtonText(isFollowing) {
            const followButton = Buttons.getButtonById("follow-button");
            if (documentUtilities_1.ObjectSelectionController.selectedObject == this.objectBeingFollowed && !isFollowing) {
                followButton.swapToAltImg();
                followButton.swapToAltTitle();
            }
            else {
                followButton.swapToDefaultImg();
                followButton.swapToDefaultTitle();
            }
        }
        onInputStart(cursorCoordinates) {
            this._isMouseDown = true;
            this._mouseMoved = false;
            this.clickedPos = cursorCoordinates;
            this.cameraPosOnMouseDown = this.pos;
        }
        onMove(cursorCoordinates, canvas) {
            if (this.isMouseDown) {
                if (this.allowMovement)
                    this.pos = vector2_1.default.sum(this.cameraPosOnMouseDown, vector2_1.default.div(vector2_1.default.sub(this.clickedPos, cursorCoordinates), this.zoom).invertY());
                canvas.style.cursor = "move";
                if (!vector2_1.default.equals(this.cameraPosOnMouseDown, this.pos)) {
                    this._mouseMoved = true;
                    this.unfollowObject();
                }
            }
            //DEBUG: Display cursos canvas position
            //console.log(cursorCoordinates);
            //DEBUG: Display cursos world position
            //console.log();
        }
        onMouseUp(canvas) {
            if (!this.isMouseDown)
                return;
            this._isMouseDown = false;
            canvas.style.cursor = "default";
        }
        onWheel(e) {
            if (e.deltaY < 0)
                this.nextZoom();
            else
                this.previousZoom();
        }
    }
    exports.Camera = Camera;
});
