console.log("Loading ambient");

import { AmbientJSON, PhysicsObjectJSON } from './fileController';
import { canvasRenderer } from './main';
import { PhysicsObject } from './physicsObjects';
import { Camera, CanvasRenderer } from './rendering';
import { Renderable, Selectable, Simulatable } from './types';
import Vector2 from './vector2';
import { ObjectSelectionController } from './document';

export default class Ambient implements Selectable, Renderable, Simulatable {
    public readonly objects: PhysicsObject[];

    private onMouseMove: ((evt: MouseEvent) => void) | null;
    private onTouchMove: ((evt: TouchEvent) => void) | null;
    private onMouseUp: ((evt: MouseEvent) => void) | null;

    constructor() {
        this.objects = [];

        this.onMouseMove = null;
        this.onTouchMove = null;
        this.onMouseUp = null;
    }

    static fromJSON(json: AmbientJSON | string): Ambient {
        if (typeof json === "string") {
            return JSON.parse(
                json,
                function (key: string, value: any) {
                    return key === "" ? Ambient.fromJSON(value) : value
                }
            );
        } else {
            const loadedAmbient = new Ambient();
            json.objects.forEach(obj => PhysicsObject.fromJSON(obj, loadedAmbient));
            return loadedAmbient;
        }
    }
    
    get name(): string {
        return "Ambiente";
    }

    get isFollowable() {
        return false;
    }

    toJSON(): AmbientJSON {
        const objectsArrayJson: PhysicsObjectJSON[] = [];
        this.objects.forEach(obj => objectsArrayJson.push(obj.toJSON()))
        return Object.assign({}, this, {
            objects: objectsArrayJson
        });
    }

    getObjectOnPosition(pos: Vector2, convertToWorldPos?: boolean): PhysicsObject | null {
        if (convertToWorldPos)
            pos = canvasRenderer.camera.getWorldPosFromCanvas(pos);

        for (const obj of this.objects) {
            if (obj.isPositionInsideObject(pos))
                return obj;
        }

        return null;
    }

    addObject(obj: PhysicsObject): void {
        this.objects.push(obj);
    }

    getProperty(): undefined {
        return undefined;
    }

    draw(cam: Camera, ctx: CanvasRenderingContext2D): void {
        this.objects.forEach(obj => obj.sprite.draw(cam, ctx));
    }

    onCanvasAdded(canvasRenderer: CanvasRenderer): void {
        const canvas = canvasRenderer.context.canvas;
        const camera = canvasRenderer.camera;
        
        this.onMouseMove = (ev: MouseEvent) => this.setCursor(camera, new Vector2(ev.offsetX, -ev.offsetY), canvas);
        this.onTouchMove = (ev: TouchEvent) => this.setCursor(camera, camera.getTouchPosition(ev), canvas);
        this.onMouseUp = (ev: MouseEvent) => this.selectObject(camera, ev);

        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("touchmove", this.onTouchMove);
        canvas.addEventListener("mouseup", this.onMouseUp);
    }

    onCanvasRemoved(canvasRenderer: CanvasRenderer): void {
        const canvas = canvasRenderer.context.canvas;
        
        canvas.removeEventListener("mousemove", this.onMouseMove!);
        canvas.removeEventListener("touchmove", this.onTouchMove!);
        canvas.removeEventListener("mouseup", this.onMouseUp!);
    }

    simulate(step: number): void {
        this.objects.forEach(object => object.simulate(step));
    }

    reset(): void {
        this.objects.forEach(object => object.reset());
    }

    private setCursor (camera: Camera, cursorCoordinates: Vector2, canvas: HTMLCanvasElement){
        if (!camera.isMouseDown) {
            const obj = this.getObjectOnPosition(new Vector2(cursorCoordinates.x, -cursorCoordinates.y), true);
            canvas.style.cursor = (obj) ? "pointer" : "default";
        }
    }
    
    private selectObject (camera: Camera, ev: MouseEvent){
        if (!camera.mouseMoved) {
            const clickedPos = new Vector2(ev.offsetX, ev.offsetY);
            const obj = this.getObjectOnPosition(clickedPos, true);
    
            ObjectSelectionController.selectObject(obj ? obj : this);
        }
    }
}