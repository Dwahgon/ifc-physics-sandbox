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
define(["require", "exports", "./buttons", "./document", "./types", "./vector2"], function (require, exports, Buttons, document_1, types_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Buttons = __importStar(Buttons);
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading rendering");
    class CanvasRenderer {
        constructor(context, cameraPos = vector2_1.default.zero, cameraZoom = 100, cameraMinZoom = 10, cameraMaxZoom = 500) {
            this.context = context;
            this.isRunning = false;
            this.renderables = [];
            this.camera = new Camera(this, cameraPos, cameraZoom, cameraMinZoom, cameraMaxZoom, 5);
            this.add({ draw(cam, ctx) { ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); } });
        }
        start() {
            this.isRunning = true;
            this.render();
        }
        stop() {
            this.isRunning = false;
        }
        add(fn) {
            this.renderables.push(fn);
        }
        remove(fn) {
            const index = this.renderables.indexOf(fn);
            if (index > -1)
                this.renderables.splice(index, 1);
        }
        render() {
            const cam = this.camera;
            const con = this.context;
            const canvas = this.context.canvas;
            const canvasParent = canvas.parentElement;
            const style = window.getComputedStyle(canvasParent, null);
            canvas.height = parseInt(style.getPropertyValue("height"));
            canvas.width = parseInt(style.getPropertyValue("width"));
            this.renderables.forEach(rn => rn.draw(cam, con));
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
            this.clickedPos = vector2_1.default.zero;
            this.cameraPosOnMouseDown = vector2_1.default.zero;
            canvas.addEventListener("mousedown", ev => { this.onInputStart(new vector2_1.default(ev.offsetX, -ev.offsetY)); });
            canvas.addEventListener("touchstart", ev => { this.onInputStart(this.getTouchPosition(ev)); });
            canvas.addEventListener("mousemove", ev => { this.onMove(new vector2_1.default(ev.offsetX, -ev.offsetY), canvas); });
            canvas.addEventListener("touchmove", ev => { this.onMove(this.getTouchPosition(ev), canvas); });
            canvas.addEventListener("wheel", ev => { this.onWheel(ev); });
            document.addEventListener("mouseup", ev => { this.onMouseUp(canvas); });
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
            if (this.targetObjectPosition) {
                return vector2_1.default.mult(this.targetObjectPosition.value, this.zoom);
            }
            return this._pos;
        }
        set pos(value) {
            if (this.targetObjectPosition)
                this.unfollowObject();
            this._pos = value;
        }
        get objectBeingFollowed() {
            if (this.targetObjectPosition)
                return this.targetObjectPosition.object;
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
            const posX = ((canvas.width / 2) - this.pos.x - canvasPos.x) / -this.zoom;
            const posY = ((canvas.height / 2) + this.pos.y - canvasPos.y) / this.zoom;
            return new vector2_1.default(posX, posY);
        }
        getCanvasPosFromWorld(worldPos) {
            const canvas = this.canvasRenderer.context.canvas;
            const posX = (canvas.width / 2) + worldPos.x * this.zoom - this.pos.x;
            const posY = (canvas.height / 2) - worldPos.y * this.zoom + this.pos.y;
            return new vector2_1.default(posX, posY);
        }
        followObject(object) {
            if (!object.isFollowable)
                throw "Attemting to follow an unfollowable object";
            this.targetObjectPosition = object.getProperty(types_1.PhysicsPropertyType.ObjectPosition);
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
            return new vector2_1.default(x, -y);
        }
        changeButtonText(isFollowing) {
            const followButton = Buttons.getButtonById("follow-button");
            if (document_1.ObjectSelectionController.selectedObject == this.objectBeingFollowed && !isFollowing) {
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
                this.pos = vector2_1.default.sum(this.cameraPosOnMouseDown, vector2_1.default.sub(this.clickedPos, cursorCoordinates));
                canvas.style.cursor = "move";
                if (!vector2_1.default.equals(this.cameraPosOnMouseDown, this.pos)) {
                    this._mouseMoved = true;
                    this.unfollowObject();
                }
            }
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
    class Sprite {
        constructor(imageSrc, copyPosition, copySize, drawPosition, drawSize) {
            this.copyPosition = copyPosition;
            this.copySize = copySize;
            this.drawPosition = drawPosition;
            const imgElement = document.createElement('img');
            imgElement.src = imageSrc;
            this.image = imgElement;
            this.drawSize = drawSize;
        }
        getZoomedSize(zoom) {
            return vector2_1.default.mult(this.drawSize, zoom);
        }
        draw(cam, context) {
            const posInCanvas = vector2_1.default.sub(cam.getCanvasPosFromWorld(this.drawPosition), vector2_1.default.div(this.getZoomedSize(cam.zoom), 2));
            // @ts-ignore
            context.drawImage(this.image, ...this.copyPosition.toArray(), ...this.copySize.toArray(), ...posInCanvas.toArray(), ...this.getZoomedSize(cam.zoom).toArray());
        }
    }
    exports.Sprite = Sprite;
    class CartesianPlane {
        constructor(gridSize, xAxisColor = "red", yAxisColor = "green", originColor = "blue") {
            this.gridSize = gridSize;
            this.xAxisColor = xAxisColor;
            this.yAxisColor = yAxisColor;
            this.originColor = originColor;
        }
        draw(cam, ctx) {
            let canvas = ctx.canvas;
            let startPos = cam.getWorldPosFromCanvas(new vector2_1.default(0, 0));
            let finishPos = cam.getWorldPosFromCanvas(new vector2_1.default(canvas.width, canvas.height));
            let startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
            let startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;
            let axisLocation = new vector2_1.default(0, 0);
            ctx.font = "italic 30px CMU Serif";
            for (let i = startX; i < finishPos.x; i += this.gridSize) {
                let x = (canvas.width / 2) + i * cam.zoom - cam.pos.x;
                if (i == 0) {
                    this.drawYAxis(ctx, x);
                    axisLocation.x = x;
                }
                else
                    this.drawVerticalLine(ctx, x);
            }
            for (let i = startY; i > finishPos.y; i -= this.gridSize) {
                let y = (canvas.height / 2) - i * cam.zoom + cam.pos.y;
                if (i == 0) {
                    this.drawXAxis(ctx, y);
                    axisLocation.y = y;
                }
                else
                    this.drawHorizontalLine(ctx, y);
            }
            if (axisLocation.x > 0 && axisLocation.y > 0)
                this.drawOrigin(ctx, axisLocation.x, axisLocation.y);
        }
        drawLine(ctx, startX, startY, finishX, finishY, style, lineWidth) {
            ctx.strokeStyle = style;
            ctx.fillStyle = style;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(finishX, finishY);
            ctx.stroke();
        }
        drawHorizontalLine(ctx, y) {
            this.drawLine(ctx, 0, y, ctx.canvas.width, y, "gray", 1);
        }
        drawVerticalLine(ctx, x) {
            this.drawLine(ctx, x, 0, x, ctx.canvas.height, "gray", 1);
        }
        drawXAxis(ctx, y) {
            this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.xAxisColor, 3);
            ctx.fillText("x", ctx.canvas.width - 25, y - 10);
        }
        drawYAxis(ctx, x) {
            this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.yAxisColor, 3);
            ctx.fillText("y", x + 10, 25);
        }
        drawOrigin(ctx, x, y) {
            ctx.fillStyle = this.originColor;
            ctx.fillRect(x - 3, y - 3, 6, 6);
            ctx.fillText("O", x - 35, y - 10);
        }
    }
    exports.CartesianPlane = CartesianPlane;
});
