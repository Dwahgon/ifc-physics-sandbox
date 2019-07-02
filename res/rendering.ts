import { PhysicsObject } from './physicsObjects';
import { ObjectPosition } from './physicsProperties';
import { PhysicsPropertyType } from './types';
import Vector2 from './vector2';
import { miscButtons, ObjectSelectionController, MiscToggleImageButton } from './document';

export interface Renderable{
    draw(cam: Camera, con: CanvasRenderingContext2D): void;
}

export class CanvasRenderer{
    private isRunning: boolean;
    private renderables: Renderable[];
    public readonly camera: Camera;

    constructor(public readonly context: CanvasRenderingContext2D, cameraPos: Vector2, cameraZoom: number){
        this.isRunning = false;
        this.renderables = [];
        this.camera = new Camera(this, cameraPos, cameraZoom);
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

    constructor(private canvasRenderer: CanvasRenderer, private _pos: Vector2, public zoom: number) {
        this.targetObjectPosition = null;
        
        miscButtons.get("centralize-camera")!.onClick = this.centralize.bind(this);

        let canvas = this.canvasRenderer.context.canvas;
        canvas.addEventListener("wheel", this.onWheelEvent.bind(this))
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

    centralize(): void{
        this.pos = Vector2.zero;
    }

    private changeButtonText(isFollowing: boolean): void{
        const followButton = <MiscToggleImageButton>miscButtons.get("follow-button")!;
        
        if(ObjectSelectionController.selectedObject == this.objectBeingFollowed)
            followButton.toggled = !isFollowing;
    }

    private onWheelEvent(ev: WheelEvent): void{
        this.zoom += ev.deltaY / -20;

        if (this.zoom < 0.1)
            this.zoom = 0.1;
        else if (this.zoom > 200)
            this.zoom = 200;
    }
}

export class Sprite implements Renderable{
    public drawSize: Vector2;
    private image: HTMLImageElement;
    private drawFunction: Function;

    constructor(private renderer: CanvasRenderer, imageSrc: string, public copyPosition: Vector2, public copySize: Vector2, public drawPosition: Vector2, drawSize: Vector2) {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        this.image = imgElement;

        this.drawSize = drawSize;
        this.drawFunction = this.draw.bind(this);
    }

    getZoomedSize(zoom: number): Vector2{
        return Vector2.mult(this.drawSize, zoom);
    }

    draw(): void{
        // @ts-ignore
        this.renderer.context.drawImage(this.image, 
            ...this.copyPosition.toArray(), 
            ...this.copySize.toArray(), 
            ...this.getPositionInCanvas().toArray(), 
            ...this.getZoomedSize(this.renderer.camera.zoom).toArray()
        );
    }

    stopDrawing(): void{
        this.renderer.remove(this);
    }

    getPositionInCanvas(): Vector2{
        const camera = this.renderer.camera;
        
        return Vector2.sub(camera.getCanvasPosFromWorld(this.drawPosition), Vector2.div(this.getZoomedSize(camera.zoom), 2));
    }

    positionIsInsideSprite(pos: Vector2){
        const posInCan = this.getPositionInCanvas();
        const cam = this.renderer.camera;

        if(pos.x > posInCan.x && pos.x < posInCan.x + this.getZoomedSize(cam.zoom).x && pos.y > posInCan.y && pos.y < posInCan.y + this.getZoomedSize(cam.zoom).y)
            return true;

        return false;
    }
}

export class Grid implements Renderable{
    constructor(public gridSize: number){
    }

    draw(cam: Camera, ctx: CanvasRenderingContext2D){
        let canvas = ctx.canvas;
        let startPos = cam.getWorldPosFromCanvas(new Vector2(0, 0));
        let finishPos = cam.getWorldPosFromCanvas(new Vector2(canvas.width, canvas.height));

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