var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./types", "./vector2", "./document"], function (require, exports, types_1, vector2_1, document_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading rendering");
    class CanvasRenderer {
        constructor(context, cameraPos, cameraZoom) {
            this.context = context;
            this.isRunning = false;
            this.renderables = [];
            this.camera = new Camera(this, cameraPos, cameraZoom);
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
            canvas.height = canvasParent.offsetHeight;
            canvas.width = canvasParent.offsetWidth;
            this.renderables.forEach(rn => rn.draw(cam, con));
            if (this.isRunning)
                window.requestAnimationFrame(this.render.bind(this));
        }
    }
    exports.CanvasRenderer = CanvasRenderer;
    class Camera {
        constructor(canvasRenderer, _pos, zoom) {
            this.canvasRenderer = canvasRenderer;
            this._pos = _pos;
            this.zoom = zoom;
            this.targetObjectPosition = null;
            document_1.miscButtons.get("centralize-camera").onClick = this.focusOrigin.bind(this);
            let canvas = this.canvasRenderer.context.canvas;
            canvas.addEventListener("wheel", this.onWheelEvent.bind(this));
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
        changeButtonText(isFollowing) {
            const followButton = document_1.miscButtons.get("follow-button");
            if (document_1.ObjectSelectionController.selectedObject == this.objectBeingFollowed)
                followButton.toggled = !isFollowing;
        }
        onWheelEvent(ev) {
            this.zoom += ev.deltaY / -20;
            if (this.zoom < 0.1)
                this.zoom = 0.1;
            else if (this.zoom > 200)
                this.zoom = 200;
        }
    }
    exports.Camera = Camera;
    class Sprite {
        constructor(renderer, imageSrc, copyPosition, copySize, drawPosition, drawSize) {
            this.renderer = renderer;
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
        draw() {
            // @ts-ignore
            this.renderer.context.drawImage(this.image, ...this.copyPosition.toArray(), ...this.copySize.toArray(), ...this.getPositionInCanvas().toArray(), ...this.getZoomedSize(this.renderer.camera.zoom).toArray());
        }
        stopDrawing() {
            this.renderer.remove(this);
        }
        getPositionInCanvas() {
            const camera = this.renderer.camera;
            return vector2_1.default.sub(camera.getCanvasPosFromWorld(this.drawPosition), vector2_1.default.div(this.getZoomedSize(camera.zoom), 2));
        }
    }
    exports.Sprite = Sprite;
    class Grid {
        constructor(gridSize) {
            this.gridSize = gridSize;
        }
        draw(cam, ctx) {
            let canvas = ctx.canvas;
            let startPos = cam.getWorldPosFromCanvas(new vector2_1.default(0, 0));
            let finishPos = cam.getWorldPosFromCanvas(new vector2_1.default(canvas.width, canvas.height));
            let startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
            let startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;
            for (let i = startX; i < finishPos.x; i += this.gridSize) {
                let x = (canvas.width / 2) + i * cam.zoom - cam.pos.x;
                ctx.strokeStyle = (i == 0) ? "green" : "gray";
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let i = startY; i > finishPos.y; i -= this.gridSize) {
                let y = (canvas.height / 2) - i * cam.zoom + cam.pos.y;
                ctx.strokeStyle = (i == 0) ? "red" : "gray";
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
    }
    exports.Grid = Grid;
});
