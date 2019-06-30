import { ambient } from './main';
import { Camera, CanvasRenderer } from './rendering';
import Vector2 from './vector2';
import { ObjectSelectionController } from './document';

export default class Input{
    private isMouseDown: boolean;
    private clickedPos: Vector2;
    private cameraPosOnMouseDown: Vector2;
    private mouseMoved: boolean;
    private camera: Camera;

    constructor(canvasRenderer: CanvasRenderer){
        let canvas = canvasRenderer.context.canvas;

        this.isMouseDown = false;
        this.clickedPos = Vector2.zero;
        this.cameraPosOnMouseDown = Vector2.zero;
        this.mouseMoved = false;
        this.camera = canvasRenderer.camera;

        canvas.addEventListener("mousedown", ev => { this.onInputStart(new Vector2(ev.offsetX, -ev.offsetY)); });
        canvas.addEventListener("touchstart", ev => { this.onInputStart(this.getOffsetVector2(ev)); });
        canvas.addEventListener("mousemove", ev => { this.onMove(new Vector2(ev.offsetX, -ev.offsetY), canvas); });
        canvas.addEventListener("touchmove", ev => { this.onMove(this.getOffsetVector2(ev), canvas); });
        document.addEventListener("mouseup", ev => { this.onMouseUp(ev, canvas) });
    }

    private getOffsetVector2(ev: TouchEvent): Vector2{
        const touchTarget = <Element>ev.targetTouches[0].target;
        const rect = touchTarget.getBoundingClientRect();
        const x = ev.targetTouches[0].pageX - rect.left;
        const y = ev.targetTouches[0].pageY - rect.top;

        return new Vector2(x, -y);
    }
    
    private onInputStart(cursorCoordinates: Vector2){
        this.isMouseDown = true;
        this.mouseMoved = false;
        this.clickedPos = cursorCoordinates;
        this.cameraPosOnMouseDown = this.camera.pos;
    }

    private onMove(cursorCoordinates: Vector2, canvas: HTMLCanvasElement){
        if(this.isMouseDown){
            this.camera.pos = Vector2.sum(this.cameraPosOnMouseDown, Vector2.sub(this.clickedPos, cursorCoordinates));
            canvas.style.cursor = "move";

            if(!Vector2.equals(this.cameraPosOnMouseDown, this.camera.pos)){
                this.mouseMoved = true;
                this.camera.unfollowObject();
                
            }
        }else{
            const obj = ambient.getObjectOnPosition(new Vector2(cursorCoordinates.x, -cursorCoordinates.y));
            canvas.style.cursor = (obj) ? "pointer" : "default";
        }
    }

    private onMouseUp(ev: MouseEvent, canvas: HTMLCanvasElement){
        if(!this.isMouseDown)
            return;

        this.isMouseDown = false;
        canvas.style.cursor = "default";

        if(!this.mouseMoved){
            let clickedPos = new Vector2(ev.offsetX, ev.offsetY);
            let obj = ambient.getObjectOnPosition(clickedPos);

            ObjectSelectionController.selectObject((obj) ? obj : ambient);
        }
    }
}