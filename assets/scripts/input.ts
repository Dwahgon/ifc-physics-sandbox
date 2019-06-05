import {Camera, CanvasRenderer} from 'rendering';
import {documentUI, ambient} from 'main';

export default class Input{
    private isMouseDown: boolean;
    private clickedPos: Vector2;
    private cameraPosOnMouseDown: Vector2;
    private mouseMoved: boolean;
    private camera: Camera;

    constructor(private readonly canvasRenderer: CanvasRenderer){
        let canvas = canvasRenderer.context.canvas;

        this.isMouseDown = false;
        this.clickedPos = Vector2.zero;
        this.cameraPosOnMouseDown = Vector2.zero;
        this.mouseMoved = false;
        this.camera = canvasRenderer.camera;

        canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        canvas.addEventListener("mousemove", this.onMove.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
    
    private onMouseDown(ev: MouseEvent){
        this.isMouseDown = true;
        this.mouseMoved = false;
        this.clickedPos = new Vector2(ev.offsetX, -ev.offsetY);
        this.cameraPosOnMouseDown = this.camera.pos;
        console.log("click");
    }

    private onMove(ev: MouseEvent){
        if(!this.isMouseDown)
            return;

        let currentMousePos = new Vector2(ev.offsetX, -ev.offsetY);
        this.camera.pos = Vector2.sum(this.cameraPosOnMouseDown, Vector2.sub(this.clickedPos, currentMousePos));

        if(!Vector2.equals(this.cameraPosOnMouseDown, this.camera.pos)){
            this.mouseMoved = true;
            this.camera.unfollowObject();
        }
    }

    private onMouseUp(ev: MouseEvent){
        if(!this.isMouseDown)
            return;
        
        this.isMouseDown = false;
        
        if(!this.mouseMoved){
            let clickedPos = new Vector2(ev.offsetX, ev.offsetY);
            let obj = ambient.getObjectOnPosition(clickedPos);

            documentUI.selectObject((obj) ? obj : ambient);
        }
    }
}