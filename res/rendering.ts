console.log("Loading rendering");

import * as Buttons from "./buttons";
import { ObjectSelectionController } from './document';
import { ObjectPosition } from './physicsProperties';
import { PhysicsPropertyType, Renderable, Selectable, CartesianPlaneStyle } from './types';
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
        this.render(0);
    }

    stop() {
        this.isRunning = false;
    }

    add(renderable: Renderable) {
        this.renderables.push(renderable);
        if(renderable.onCanvasAdded)
            renderable.onCanvasAdded(this);
    }

    remove(renderable: Renderable) {
        const index = this.renderables.indexOf(renderable);
        if (index > -1)
            this.renderables.splice(index, 1);
        
        if(renderable.onCanvasRemoved)
            renderable.onCanvasRemoved(this);
    }

    render(step: DOMHighResTimeStamp) {
        const cam = this.camera;
        const con = this.context;
        const canvas = this.context.canvas;
        const canvasParent = canvas.parentElement!;
        const style = window.getComputedStyle(canvasParent, null);

        canvas.height = parseInt(style.getPropertyValue("height"));
        canvas.width = parseInt(style.getPropertyValue("width"));

        this.renderables.forEach(rn => rn.draw(cam, con, step));

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
        document.addEventListener("mouseup", () => { this.onMouseUp(canvas) });
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
    public static readonly ENVIRONMENT_STYLE: CartesianPlaneStyle = {
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
    public static readonly BASIC_STYLE: CartesianPlaneStyle = {
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


    constructor(public gridSize: number, private readonly style: CartesianPlaneStyle = CartesianPlane.BASIC_STYLE, public xAxisName?: string, public yAxisName?: string) {
    }

    draw(cam: Camera, ctx: CanvasRenderingContext2D) {
        const canvas = ctx.canvas;

        const startPos = cam.getWorldPosFromCanvas(new Vector2(0, 0));
        const finishPos = cam.getWorldPosFromCanvas(new Vector2(canvas.width, canvas.height));

        const startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;

        const originPosOnCanvas = cam.getCanvasPosFromWorld(Vector2.zero);

        for (let i = startX; i < finishPos.x; i += this.gridSize) {
            const x = (canvas.width / 2) + i * cam.zoom - cam.pos.x;

            if(i != 0){
                this.drawVerticalLine(ctx, x);

                if(this.style.showMeasurements)
                    this.drawText(ctx, i.toString(), this.style.measurementFont!, this.style.measurementStyle!, x + 5, originPosOnCanvas.y - 5, false);
            }
        }

        for (let i = startY; i > finishPos.y; i -= this.gridSize) {
            const y = (canvas.height / 2) - i * cam.zoom + cam.pos.y;

            if(i != 0){
                this.drawHorizontalLine(ctx, y);

                if(this.style.showMeasurements)
                    this.drawText(ctx, i.toString(), this.style.measurementFont!, this.style.measurementStyle!, originPosOnCanvas.x + 5, y - 5, false);
            }
        }

        if(originPosOnCanvas.y > 0){
            const y = originPosOnCanvas.y;

            this.drawXAxis(ctx, y);
            this.drawXAxisMarker(ctx, ctx.canvas.width - 25, y < ctx.canvas.height / 2 ? y + 30 : y - 10);
            if(this.xAxisName)
                this.drawXAxisLabel(ctx, y, this.xAxisName);
        }

        if(originPosOnCanvas.x > 0){
            const x = originPosOnCanvas.x;

            this.drawYAxis(ctx, x);
            this.drawYAxisMarker(ctx, x < ctx.canvas.width / 2 ? x + 10 : x - 30, 25);
            if(this.yAxisName)
                this.drawYAxisLabel(ctx, x, this.yAxisName);
        }

        if (originPosOnCanvas.x > 0 && originPosOnCanvas.y > 0)
            this.drawOrigin(ctx, originPosOnCanvas.x, originPosOnCanvas.y);
    }

    private drawText(ctx: CanvasRenderingContext2D, text: string, font: string, color: string, x: number, y: number, strokeText: boolean, strokeStyle?: string, strokeWidth?: number){
        ctx.save();
        
        ctx.lineWidth = strokeWidth ? strokeWidth : ctx.lineWidth;
        ctx.strokeStyle = strokeStyle ? strokeStyle : ctx.strokeStyle;
        ctx.font = font;
        ctx.fillStyle = color;
        
        if(strokeText) ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.restore();
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

    //Draw grid lines

    private drawHorizontalLine(ctx: CanvasRenderingContext2D, y: number) {
        this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.style.gridStyle, this.style.gridThickness);
    }

    private drawVerticalLine(ctx: CanvasRenderingContext2D, x: number) {
        this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.style.gridStyle, this.style.gridThickness);
    }

    //Draw axises

    private drawXAxis(ctx: CanvasRenderingContext2D, y: number) {
        this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.style.xAxisStyle, this.style.axisLineThickness);
    }

    private drawYAxis(ctx: CanvasRenderingContext2D, x: number) {
        this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.style.yAxisStyle, this.style.axisLineThickness);
    }

    //Draw axis marker

    private drawXAxisMarker(ctx: CanvasRenderingContext2D, x: number, y: number){
        this.drawText(ctx, "x", this.style.axisMarkerFont, this.style.xAxisStyle, x, y, true, "white", 4);
    }

    private drawYAxisMarker(ctx: CanvasRenderingContext2D, x: number, y: number){
        this.drawText(ctx, "y", this.style.axisMarkerFont, this.style.yAxisStyle, x, y, true, "white", 4);
    }

    //Draw axis label

    private drawXAxisLabel(ctx: CanvasRenderingContext2D, y: number, text: string){
        ctx.font = this.style.axisNameFont;
        const textX = (ctx.canvas.width / 2) - (ctx.measureText(text).width / 2);
        const textY = y + 15;
        
        this.drawText(ctx, text, this.style.axisNameFont, this.style.xAxisStyle, textX, textY, true, "white", 3);
    }

    private drawYAxisLabel(ctx: CanvasRenderingContext2D, x: number, text: string){
        ctx.save();

        ctx.font = this.style.axisNameFont;
        ctx.translate(x - 7, (ctx.canvas.height / 2) + (ctx.measureText(text).width / 2));
        ctx.rotate(-Math.PI/2);
        this.drawText(ctx, text, this.style.axisNameFont, this.style.yAxisStyle, 0, 0, true, "white", 3);

        ctx.restore();
    }

    //Draw origin

    private drawOrigin(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.fillStyle = this.style.originStyle;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        const textX = x < ctx.canvas.width / 2 ? x + 5 :  x - 35;
        const textY = y < ctx.canvas.height / 2 ? y + 30 : y - 10;
        this.drawText(ctx, "O", this.style.axisMarkerFont, this.style.originStyle, textX, textY, true, "white", 4);
    }
}

export class FPSCounter implements Renderable{
    private lastFrameTimestamp: number;
    private fps: number;
    private nextUpdate: number;
    
    constructor(private readonly delay: number){
        this.lastFrameTimestamp = 0;
        this.nextUpdate = 0;
        this.fps = 0;
    }

    draw(cam: Camera, con: CanvasRenderingContext2D, step: number): void {
        if(step > this.nextUpdate){
            this.fps = 1000/(step - this.lastFrameTimestamp);
            this.nextUpdate = step + this.delay;
        }

        con.font = "12px Arial";
        con.fillStyle = "black";
        con.fillText(`${this.fps.toFixed(2)} FPS`, 5, con.canvas.height - 5);
        this.lastFrameTimestamp = step;
    }
}