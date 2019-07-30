console.log("loading input");

import * as Main from './main';
import Vector2 from './vector2';
import { ObjectSelectionController } from './document';

const canvas = Main.canvasRenderer.context.canvas;
const camera = Main.canvasRenderer.camera;

const onMove = (cursorCoordinates: Vector2, canvas: HTMLCanvasElement) => {
    if (!camera.isMouseDown) {
        const obj = Main.ambient.getObjectOnPosition(new Vector2(cursorCoordinates.x, -cursorCoordinates.y), true);
        canvas.style.cursor = (obj) ? "pointer" : "default";
    }
}

const onMouseUp = (ev: MouseEvent) => {
    if (!camera.mouseMoved) {
        let clickedPos = new Vector2(ev.offsetX, ev.offsetY);
        let obj = Main.ambient.getObjectOnPosition(clickedPos, true);

        ObjectSelectionController.selectObject((obj) ? obj : Main.ambient);
    }
}

canvas.addEventListener("mousemove", ev => { onMove(new Vector2(ev.offsetX, -ev.offsetY), canvas); });
canvas.addEventListener("touchmove", ev => { onMove(camera.getTouchPosition(ev), canvas); });
canvas.addEventListener("mouseup", ev => { onMouseUp(ev) });