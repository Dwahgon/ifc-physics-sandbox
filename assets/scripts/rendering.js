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
            const cam = this.camera;
            const con = this.context;
            const canvas = this.context.canvas;
            const canvasParent = canvas.parentElement;
            const style = window.getComputedStyle(canvasParent, null);
            canvas.height = parseInt(style.getPropertyValue("height"));
            canvas.width = parseInt(style.getPropertyValue("width"));
            this.renderables.forEach(rn => rn.draw(cam, con, step));
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
        constructor(gridSize, style = CartesianPlane.BASIC_STYLE, xAxisName, yAxisName) {
            this.gridSize = gridSize;
            this.style = style;
            this.xAxisName = xAxisName;
            this.yAxisName = yAxisName;
        }
        draw(cam, ctx) {
            const canvas = ctx.canvas;
            const startPos = cam.getWorldPosFromCanvas(new vector2_1.default(0, 0));
            const finishPos = cam.getWorldPosFromCanvas(new vector2_1.default(canvas.width, canvas.height));
            const startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
            const startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;
            const originPosOnCanvas = cam.getCanvasPosFromWorld(vector2_1.default.zero);
            for (let i = startX; i < finishPos.x; i += this.gridSize) {
                const x = (canvas.width / 2) + i * cam.zoom - cam.pos.x;
                if (i != 0) {
                    this.drawVerticalLine(ctx, x);
                    if (this.style.showMeasurements)
                        this.drawText(ctx, i.toString(), this.style.measurementFont, this.style.measurementStyle, x + 5, originPosOnCanvas.y - 5, false);
                }
            }
            for (let i = startY; i > finishPos.y; i -= this.gridSize) {
                const y = (canvas.height / 2) - i * cam.zoom + cam.pos.y;
                if (i != 0) {
                    this.drawHorizontalLine(ctx, y);
                    if (this.style.showMeasurements)
                        this.drawText(ctx, i.toString(), this.style.measurementFont, this.style.measurementStyle, originPosOnCanvas.x + 5, y - 5, false);
                }
            }
            if (originPosOnCanvas.y > 0) {
                const y = originPosOnCanvas.y;
                this.drawXAxis(ctx, y);
                this.drawXAxisMarker(ctx, ctx.canvas.width - 25, y < ctx.canvas.height / 2 ? y + 30 : y - 10);
                if (this.xAxisName)
                    this.drawXAxisLabel(ctx, y, this.xAxisName);
            }
            if (originPosOnCanvas.x > 0) {
                const x = originPosOnCanvas.x;
                this.drawYAxis(ctx, x);
                this.drawYAxisMarker(ctx, x < ctx.canvas.width / 2 ? x + 10 : x - 30, 25);
                if (this.yAxisName)
                    this.drawYAxisLabel(ctx, x, this.yAxisName);
            }
            if (originPosOnCanvas.x > 0 && originPosOnCanvas.y > 0)
                this.drawOrigin(ctx, originPosOnCanvas.x, originPosOnCanvas.y);
        }
        drawText(ctx, text, font, color, x, y, strokeText, strokeStyle, strokeWidth) {
            ctx.save();
            ctx.lineWidth = strokeWidth ? strokeWidth : ctx.lineWidth;
            ctx.strokeStyle = strokeStyle ? strokeStyle : ctx.strokeStyle;
            ctx.font = font;
            ctx.fillStyle = color;
            if (strokeText)
                ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
            ctx.restore();
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
        //Draw grid lines
        drawHorizontalLine(ctx, y) {
            this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.style.gridStyle, this.style.gridThickness);
        }
        drawVerticalLine(ctx, x) {
            this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.style.gridStyle, this.style.gridThickness);
        }
        //Draw axises
        drawXAxis(ctx, y) {
            this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.style.xAxisStyle, this.style.axisLineThickness);
        }
        drawYAxis(ctx, x) {
            this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.style.yAxisStyle, this.style.axisLineThickness);
        }
        //Draw axis marker
        drawXAxisMarker(ctx, x, y) {
            this.drawText(ctx, "x", this.style.axisMarkerFont, this.style.xAxisStyle, x, y, true, "white", 4);
        }
        drawYAxisMarker(ctx, x, y) {
            this.drawText(ctx, "y", this.style.axisMarkerFont, this.style.yAxisStyle, x, y, true, "white", 4);
        }
        //Draw axis label
        drawXAxisLabel(ctx, y, text) {
            ctx.font = this.style.axisNameFont;
            const textX = (ctx.canvas.width / 2) - (ctx.measureText(text).width / 2);
            const textY = y + 15;
            this.drawText(ctx, text, this.style.axisNameFont, this.style.xAxisStyle, textX, textY, true, "white", 3);
        }
        drawYAxisLabel(ctx, x, text) {
            ctx.save();
            ctx.font = this.style.axisNameFont;
            ctx.translate(x - 7, (ctx.canvas.height / 2) + (ctx.measureText(text).width / 2));
            ctx.rotate(-Math.PI / 2);
            this.drawText(ctx, text, this.style.axisNameFont, this.style.yAxisStyle, 0, 0, true, "white", 3);
            ctx.restore();
        }
        //Draw origin
        drawOrigin(ctx, x, y) {
            ctx.fillStyle = this.style.originStyle;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            const textX = x < ctx.canvas.width / 2 ? x + 5 : x - 35;
            const textY = y < ctx.canvas.height / 2 ? y + 30 : y - 10;
            this.drawText(ctx, "O", this.style.axisMarkerFont, this.style.originStyle, textX, textY, true, "white", 4);
        }
    }
    CartesianPlane.ENVIRONMENT_STYLE = {
        xAxisStyle: "red",
        yAxisStyle: "green",
        gridStyle: "grey",
        originStyle: "blue",
        axisLineThickness: 3,
        gridThickness: 1,
        axisMarkerFont: "italic 30px CMU Serif",
        axisNameFont: "italic 15px CMU Serif",
        showMeasurements: false
    };
    CartesianPlane.BASIC_STYLE = {
        xAxisStyle: "black",
        yAxisStyle: "black",
        gridStyle: "lightgrey",
        originStyle: "black",
        measurementStyle: "grey",
        axisLineThickness: 1,
        gridThickness: 1,
        axisMarkerFont: "italic 30px CMU Serif",
        axisNameFont: "italic 15px CMU Serif",
        measurementFont: "italic 12px CMU Serif",
        showMeasurements: true
    };
    exports.CartesianPlane = CartesianPlane;
    class FPSCounter {
        constructor(delay) {
            this.delay = delay;
            this.lastFrameTimestamp = 0;
            this.nextUpdate = 0;
            this.fps = 0;
        }
        draw(cam, con, step) {
            if (step > this.nextUpdate) {
                this.fps = 1000 / (step - this.lastFrameTimestamp);
                this.nextUpdate = step + this.delay;
            }
            con.font = "12px Arial";
            con.fillStyle = "black";
            con.fillText(`${this.fps.toFixed(2)} FPS`, 5, con.canvas.height - 5);
            this.lastFrameTimestamp = step;
        }
    }
    exports.FPSCounter = FPSCounter;
});
