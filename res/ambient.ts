console.log("Loading ambient");

import { ObjectSelectionController } from './document/document';
import { ObjectLocatorPropertyEditorRow } from './document/propertyEditor';
import { AmbientJSON, PhysicsObjectJSON } from './fileController';
import { canvasRenderer } from './main';
import { PhysicsObject } from './physicsObjects';
import { ObjectPosition } from './physicsProperties';
import { Camera, CanvasRenderer } from './rendering/canvasRenderer';
import { PhysicsPropertyType, PropertyEditorRow, Renderable, Selectable, Simulatable } from './types';
import Vector2 from './vector2';

export default class Ambient implements Selectable, Renderable, Simulatable {
    public readonly objects: PhysicsObject[];

    private onMouseMove: ((evt: MouseEvent) => void) | null;
    private onTouchMove: ((evt: TouchEvent) => void) | null;
    private onMouseUp: ((evt: MouseEvent) => void) | null;
    private onMouseDown: ((evt: MouseEvent) => void) | null;
    private onTouchStart: ((evt: TouchEvent) => void) | null;
    private onKeyDown: ((evt: KeyboardEvent) => void) | null;
    private onKeyUp: ((evt: KeyboardEvent) => void) | null;

    private lastCursosPos: Vector2;
    private draggingObject: PhysicsObject | null;
    private snapToGrid: boolean;

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
        this.lastCursosPos = Vector2.zero;
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

    getPropertyEditorRows(): PropertyEditorRow[] {
        const rows: PropertyEditorRow[] = [];

        this.objects.forEach(obj => rows.push(new ObjectLocatorPropertyEditorRow(obj, "Objetos", 0)));

        return rows;
    }

    addObject(obj: PhysicsObject): void {
        this.objects.push(obj);
    }

    getProperty(): undefined {
        return undefined;
    }

    draw(canvasRenderer: CanvasRenderer): void {
        this.objects.forEach(obj => obj.draw(canvasRenderer));
    }

    onCanvasAdded(canvasRenderer: CanvasRenderer): void {
        const canvas = canvasRenderer.context.canvas;
        const camera = canvasRenderer.camera;

        this.onMouseMove = (ev: MouseEvent) => this.setCursor(camera, new Vector2(ev.offsetX, -ev.offsetY), canvas);
        this.onTouchMove = (ev: TouchEvent) => this.setCursor(camera, camera.getTouchPosition(ev), canvas);
        this.onMouseUp = (ev: MouseEvent) => this.selectObject(camera, ev);
        this.onMouseDown = (ev: MouseEvent) => this.dragObject(camera, new Vector2(ev.offsetX, -ev.offsetY));
        this.onTouchStart = (ev: TouchEvent) => this.dragObject(camera, camera.getTouchPosition(ev));
        this.onKeyDown = (ev: KeyboardEvent) => this.setSnapToGrid(ev, true);
        this.onKeyUp = (ev: KeyboardEvent) => this.setSnapToGrid(ev, false);

        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("touchmove", this.onTouchMove);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("touchstart", this.onTouchStart);
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }

    onCanvasRemoved(canvasRenderer: CanvasRenderer): void {
        const canvas = canvasRenderer.context.canvas;

        canvas.removeEventListener("mousemove", this.onMouseMove!);
        canvas.removeEventListener("touchmove", this.onTouchMove!);
        canvas.removeEventListener("mouseup", this.onMouseUp!);
        canvas.removeEventListener("mousedown", this.onMouseDown!);
        canvas.removeEventListener("touchstart", this.onTouchStart!);
        document.removeEventListener("keydown", this.onKeyDown!);
        document.removeEventListener("keyup", this.onKeyUp!);
    }

    simulate(step: number): void {
        this.objects.forEach(object => object.simulate(step));
    }

    reset(): void {
        this.objects.forEach(object => object.reset());
    }

    private setCursor(camera: Camera, cursorCoordinates: Vector2, canvas: HTMLCanvasElement) {
        if (!camera.isMouseDown) {
            const obj = this.getObjectOnPosition(new Vector2(cursorCoordinates.x, -cursorCoordinates.y), true);
            canvas.style.cursor = (obj) ? "pointer" : "default";
        } else if (this.draggingObject && !Vector2.equals(cursorCoordinates, this.lastCursosPos)) {
            canvas.style.cursor = "pointer";

            const objPos = <ObjectPosition>this.draggingObject.getProperty(PhysicsPropertyType.ObjectPosition)!;
            const cursorPos = new Vector2(cursorCoordinates.x, -cursorCoordinates.y);
            const cursorWorldPos = camera.getWorldPosFromCanvas(cursorPos);
            const newPos = (this.snapToGrid) ? new Vector2(Math.round(cursorWorldPos.x), Math.round(cursorWorldPos.y)) : cursorWorldPos;

            objPos.initialValue = newPos;
        }

        this.lastCursosPos = cursorCoordinates;
    }

    private dragObject(camera: Camera, cursorCoordinates: Vector2) {
        const obj = this.getObjectOnPosition(new Vector2(cursorCoordinates.x, -cursorCoordinates.y), true);
        if (obj) {
            this.draggingObject = obj;
            camera.allowMovement = false;
        }
    }

    private selectObject(camera: Camera, ev: MouseEvent) {
        if (!camera.mouseMoved) {
            const clickedPos = new Vector2(ev.offsetX, ev.offsetY);
            const obj = this.getObjectOnPosition(clickedPos, true);

            ObjectSelectionController.selectObject(obj ? obj : this);
        }

        this.draggingObject = null;
        camera.allowMovement = true;
    }

    private setSnapToGrid(ev: KeyboardEvent, value: boolean) {
        if (ev.key == "Shift")
            this.snapToGrid = value;
    }
}