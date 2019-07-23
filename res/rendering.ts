console.log("Loading rendering");

import { miscButtons, MiscToggleImageButton, ObjectSelectionController } from './document';
import { PhysicsObject } from './physicsObjects';
import { ObjectPosition } from './physicsProperties';
import { PhysicsPropertyType, Renderable } from './types';
import Vector2 from './vector2';

export class CanvasRenderer{
    private isRunning: boolean;
    private renderables: Renderable[];
    public readonly camera: Camera;

    constructor(public readonly context: CanvasRenderingContext2D, cameraPos: Vector2, cameraZoom: number, cameraMinZoom: number, cameraMaxZoom:number){
        this.isRunning = false;
        this.renderables = [];
        this.camera = new Camera(this, cameraPos, cameraZoom, cameraMinZoom, cameraMaxZoom, 5);
    }

    start(){
        this.isRunning = true;
        this.render();
    }

    stop(){
        this.isRunning = false;
    }

    add(fn: Renderable){
        this.renderables.push(fn);
    }

    remove(fn: Renderable){
        const index = this.renderables.indexOf(fn);
        if(index > -1) 
            this.renderables.splice(index, 1);
    }

    render(){
        const cam = this.camera;
        const con = this.context;
        const canvas = this.context.canvas;
        const canvasParent = canvas.parentElement!;
        
        canvas.height = canvasParent.offsetHeight;
        canvas.width = canvasParent.offsetWidth;

        this.renderables.forEach(rn => rn.draw(cam, con));
        
        if(this.isRunning)
            window.requestAnimationFrame(this.render.bind(this));
    }
}

export class Camera {
    private targetObjectPosition: ObjectPosition | null;
    private _zoom: number;

    constructor(private canvasRenderer: CanvasRenderer, private _pos: Vector2, private defaultZoom: number, private minZoom: number, private maxZoom: number, private zoomStep: number) {
        this.targetObjectPosition = null;
        
        this._zoom = this.defaultZoom;

        miscButtons.get("centralize-camera")!.onClick = this.focusOrigin.bind(this);
    }

    get zoom(){
        return this._zoom;
    }

    set zoom(n: number){
        this._zoom = n;

        if (this._zoom < this.minZoom)
            this._zoom = this.minZoom;
        else if (this._zoom > this.maxZoom)
            this._zoom = this.maxZoom;
    }

    nextZoom(): void{
        this.zoom += this.zoomStep;
    }

    previousZoom(): void{
        this.zoom -= this.zoomStep;
    }

    resetZoom(): void{
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

    get pos(){
        if(this.targetObjectPosition){
            return Vector2.mult(this.targetObjectPosition.value, this.zoom);
        }
        
        return this._pos;
    }

    set pos(value: Vector2){
        if(this.targetObjectPosition)
            this.unfollowObject();
        
        this._pos = value;
    }

    get objectBeingFollowed(){
        if(this.targetObjectPosition)
            return this.targetObjectPosition.object;
        
        return null;
    }

    followObject(object: PhysicsObject): void{
        if(!object.isFollowable)
            throw "Attemting to follow an unfollowable object";
        
        this.targetObjectPosition = <ObjectPosition>object.getProperty(PhysicsPropertyType.ObjectPosition);

        this.changeButtonText(false);
    }

    unfollowObject(): void{
        this.changeButtonText(true);

        this.targetObjectPosition = null;
    }

    focusOrigin(): void{
        this.pos = Vector2.zero;
    }

    private changeButtonText(isFollowing: boolean): void{
        const followButton = <MiscToggleImageButton>miscButtons.get("follow-button")!;
        
        if(ObjectSelectionController.selectedObject == this.objectBeingFollowed)
            followButton.toggled = !isFollowing;
    }
}

export class Sprite implements Renderable{
    public drawSize: Vector2;
    private image: HTMLImageElement;

    constructor(imageSrc: string, public copyPosition: Vector2, public copySize: Vector2, public drawPosition: Vector2, drawSize: Vector2) {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        this.image = imgElement;

        this.drawSize = drawSize;
    }

    getZoomedSize(zoom: number): Vector2{
        return Vector2.mult(this.drawSize, zoom);
    }

    draw(cam: Camera, context: CanvasRenderingContext2D): void{
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

export class CartesianPlane implements Renderable{
    constructor(public gridSize: number){
    }

    draw(cam: Camera, ctx: CanvasRenderingContext2D){
        let canvas = ctx.canvas;
        let startPos = cam.getWorldPosFromCanvas(new Vector2(0, 0));
        let finishPos = cam.getWorldPosFromCanvas(new Vector2(canvas.width, canvas.height));

        let startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
        let startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;

        let axisLocation = new Vector2(0, 0);

        ctx.font = "italic 30px CMU Serif";

        for (let i = startX; i < finishPos.x; i += this.gridSize) {
            let x = (canvas.width / 2) + i * cam.zoom - cam.pos.x;

            const style = (i == 0) ? "green" : "gray";
            ctx.strokeStyle = style;
            ctx.fillStyle = style;
            ctx.lineWidth = i == 0 ? 3 : 1;   
            
            if(i == 0){
                axisLocation.x = x;
                ctx.fillText("y", x + 10, 25);
            }

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let i = startY; i > finishPos.y; i -= this.gridSize) {
            let y = (canvas.height / 2) - i * cam.zoom + cam.pos.y;

            const style = (i == 0) ? "red" : "gray"
            ctx.strokeStyle = style;
            ctx.fillStyle = style;
            ctx.lineWidth = i == 0 ? 3 : 1;

            if(i == 0){
                axisLocation.y = y;
                ctx.fillText("x", canvas.width - 25, y - 10);
            }

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        if(axisLocation.x > 0 && axisLocation.y > 0){
            ctx.fillStyle = "blue";
            ctx.fillRect(axisLocation.x-3, axisLocation.y-3, 6, 6);
            
            
            ctx.fillText("O", axisLocation.x - 35, axisLocation.y - 10);
        }
    }
}