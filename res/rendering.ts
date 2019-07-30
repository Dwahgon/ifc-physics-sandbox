console.log("Loading rendering");

import * as Buttons from "./buttons";
import { ObjectSelectionController } from './document';
import { ObjectPosition } from './physicsProperties';
import { PhysicsPropertyType, Renderable, Selectable } from './types';
import Vector2 from './vector2';

export class CanvasRenderer {
    private isRunning: boolean;
    private renderables: Renderable[];
    public readonly camera: Camera;

    constructor(public readonly context: CanvasRenderingContext2D, cameraPos: Vector2 = Vector2.zero, cameraZoom: number = 100, cameraMinZoom: number = 10, cameraMaxZoom: number = 500) {
        this.isRunning = false;
        this.renderables = [];
        this.camera = new Camera(this, cameraPos, cameraZoom, cameraMinZoom, cameraMaxZoom, 5);

        this.add({ draw(cam, ctx) { ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) } });
    }

    start() {
        this.isRunning = true;
        this.render();
    }

    stop() {
        this.isRunning = false;
    }

    add(fn: Renderable) {
        this.renderables.push(fn);
    }

    remove(fn: Renderable) {
        const index = this.renderables.indexOf(fn);
        if (index > -1)
            this.renderables.splice(index, 1);
    }

    render() {
        const cam = this.camera;
        const con = this.context;
        const canvas = this.context.canvas;
        const canvasParent = canvas.parentElement!;
        const style = window.getComputedStyle(canvasParent, null);

        canvas.height = parseInt(style.getPropertyValue("height"));
        canvas.width = parseInt(style.getPropertyValue("width"));

        this.renderables.forEach(rn => rn.draw(cam, con));

        if (this.isRunning)
            window.requestAnimationFrame(this.render.bind(this));
    }
}

export class Camera {
    private targetObjectPosition: ObjectPosition | null;
    private _zoom: number;

    private _isMouseDown: boolean;
    private _mouseMoved: boolean;
    private clickedPos: Vector2;
    private cameraPosOnMouseDown: Vector2;

    constructor(private canvasRenderer: CanvasRenderer, private _pos: Vector2, private defaultZoom: number, private minZoom: number, private maxZoom: number, private zoomStep: number) {
        this.targetObjectPosition = null;

        this._zoom = this.defaultZoom;

        const canvas = canvasRenderer.context.canvas;

        this._isMouseDown = false;
        this._mouseMoved = false;
        this.clickedPos = Vector2.zero;
        this.cameraPosOnMouseDown = Vector2.zero;

        canvas.addEventListener("mousedown", ev => { this.onInputStart(new Vector2(ev.offsetX, -ev.offsetY)); });
        canvas.addEventListener("touchstart", ev => { this.onInputStart(this.getTouchPosition(ev)); });
        canvas.addEventListener("mousemove", ev => { this.onMove(new Vector2(ev.offsetX, -ev.offsetY), canvas); });
        canvas.addEventListener("touchmove", ev => { this.onMove(this.getTouchPosition(ev), canvas); });
        canvas.addEventListener("wheel", ev => { this.onWheel(ev) })
        document.addEventListener("mouseup", ev => { this.onMouseUp(canvas) });
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(n: number) {
        this._zoom = n;

        if (this._zoom < this.minZoom)
            this._zoom = this.minZoom;
        else if (this._zoom > this.maxZoom)
            this._zoom = this.maxZoom;
    }

    get pos() {
        if (this.targetObjectPosition) {
            return Vector2.mult(this.targetObjectPosition.value, this.zoom);
        }

        return this._pos;
    }

    set pos(value: Vector2) {
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

    nextZoom(): void {
        this.zoom += this.zoomStep;
    }

    previousZoom(): void {
        this.zoom -= this.zoomStep;
    }

    resetZoom(): void {
        this.zoom = this.defaultZoom;
    }

    getWorldPosFromCanvas(canvasPos: Vector2): Vector2 {
        const canvas = this.canvasRenderer.context.canvas;

        const posX = ((canvas.width / 2) - this.pos.x - canvasPos.x) / -this.zoom;
        const posY = ((canvas.height / 2) + this.pos.y - canvasPos.y) / this.zoom;

        return new Vector2(posX, posY);
    }

    getCanvasPosFromWorld(worldPos: Vector2): Vector2 {
        const canvas = this.canvasRenderer.context.canvas;

        const posX = (canvas.width / 2) + worldPos.x * this.zoom - this.pos.x;
        const posY = (canvas.height / 2) - worldPos.y * this.zoom + this.pos.y;

        return new Vector2(posX, posY);
    }


    followObject(object: Selectable): void {
        if (!object.isFollowable)
            throw "Attemting to follow an unfollowable object";

        this.targetObjectPosition = <ObjectPosition>object.getProperty(PhysicsPropertyType.ObjectPosition);

        this.changeButtonText(false);
    }

    unfollowObject(): void {
        this.changeButtonText(true);

        this.targetObjectPosition = null;
    }

    focusOrigin(): void {
        this.pos = Vector2.zero;
    }

    getTouchPosition(ev: TouchEvent): Vector2 {
        const touchTarget = <Element>ev.targetTouches[0].target;
        const rect = touchTarget.getBoundingClientRect();
        const x = ev.targetTouches[0].pageX - rect.left;
        const y = ev.targetTouches[0].pageY - rect.top;

        return new Vector2(x, -y);
    }

    private changeButtonText(isFollowing: boolean): void {
        const followButton = Buttons.getButtonById("follow-button")!;

        if (ObjectSelectionController.selectedObject == this.objectBeingFollowed && !isFollowing) {
            followButton.swapToAltImg();
            followButton.swapToAltTitle();
        } else {
            followButton.swapToDefaultImg();
            followButton.swapToDefaultTitle();
        }
    }

    private onInputStart(cursorCoordinates: Vector2) {
        this._isMouseDown = true;
        this._mouseMoved = false;
        this.clickedPos = cursorCoordinates;
        this.cameraPosOnMouseDown = this.pos;
    }

    private onMove(cursorCoordinates: Vector2, canvas: HTMLCanvasElement) {
        if (this.isMouseDown) {
            this.pos = Vector2.sum(this.cameraPosOnMouseDown, Vector2.sub(this.clickedPos, cursorCoordinates));
            canvas.style.cursor = "move";

            if (!Vector2.equals(this.cameraPosOnMouseDown, this.pos)) {
                this._mouseMoved = true;
                this.unfollowObject();
            }
        }
    }

    private onMouseUp(canvas: HTMLCanvasElement) {
        if (!this.isMouseDown)
            return;

        this._isMouseDown = false;
        canvas.style.cursor = "default";
    }

    private onWheel(e: WheelEvent) {
        if (e.deltaY < 0)
            this.nextZoom();
        else
            this.previousZoom();
    }
}

export class Sprite implements Renderable {
    public drawSize: Vector2;
    private image: HTMLImageElement;

    constructor(imageSrc: string, public copyPosition: Vector2, public copySize: Vector2, public drawPosition: Vector2, drawSize: Vector2) {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        this.image = imgElement;

        this.drawSize = drawSize;
    }

    getZoomedSize(zoom: number): Vector2 {
        return Vector2.mult(this.drawSize, zoom);
    }

    draw(cam: Camera, context: CanvasRenderingContext2D): void {
        const posInCanvas = Vector2.sub(cam.getCanvasPosFromWorld(this.drawPosition), Vector2.div(this.getZoomedSize(cam.zoom), 2));

        // @ts-ignore
        context.drawImage(this.image,
            ...this.copyPosition.toArray(),
            ...this.copySize.toArray(),
            ...posInCanvas.toArray(),
            ...this.getZoomedSize(cam.zoom).toArray()
        );
    }
}

export class CartesianPlane implements Renderable {
    constructor(public gridSize: number, private xAxisColor: string = "red", private yAxisColor: string = "green", private originColor: string = "blue") {
    }

    draw(cam: Camera, ctx: CanvasRenderingContext2D) {
        let canvas = ctx.canvas;

        let startPos = cam.getWorldPosFromCanvas(new Vector2(0, 0));
        let finishPos = cam.getWorldPosFromCanvas(new Vector2(canvas.width, canvas.height));

        let startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
        let startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;

        let axisLocation = new Vector2(0, 0);

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
            } else
                this.drawHorizontalLine(ctx, y);
        }

        if (axisLocation.x > 0 && axisLocation.y > 0)
            this.drawOrigin(ctx, axisLocation.x, axisLocation.y);
    }

    private drawLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, finishX: number, finishY: number, style: string, lineWidth: number) {
        ctx.strokeStyle = style;
        ctx.fillStyle = style;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(finishX, finishY);
        ctx.stroke();
    }

    private drawHorizontalLine(ctx: CanvasRenderingContext2D, y: number) {
        this.drawLine(ctx, 0, y, ctx.canvas.width, y, "gray", 1);
    }

    private drawVerticalLine(ctx: CanvasRenderingContext2D, x: number) {
        this.drawLine(ctx, x, 0, x, ctx.canvas.height, "gray", 1);
    }

    private drawXAxis(ctx: CanvasRenderingContext2D, y: number) {
        this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.xAxisColor, 3);
        ctx.fillText("x", ctx.canvas.width - 25, y - 10);
    }

    private drawYAxis(ctx: CanvasRenderingContext2D, x: number) {
        this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.yAxisColor, 3);
        ctx.fillText("y", x + 10, 25);
    }

    private drawOrigin(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = this.originColor;
        ctx.fillRect(x - 3, y - 3, 6, 6);

        ctx.fillText("O", x - 35, y - 10);
    }
}