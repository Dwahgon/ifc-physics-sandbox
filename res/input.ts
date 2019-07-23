console.log("loading input");

import * as Main from './main';
import Vector2 from './vector2';
import { ObjectSelectionController, ObjectCreationController, miscButtons, objectCreationButtons, PropertyDescriptionUI } from './document';
import { DocumentButtonKind } from './types';

const canvas = Main.canvasRenderer.context.canvas;
const camera = Main.canvasRenderer.camera;

let mouseMoved = false;
let isMouseDown = false;
let clickedPos = Vector2.zero;
let cameraPosOnMouseDown = Vector2.zero;

const getOffsetVector2 = (ev: TouchEvent) => {
    const touchTarget = <Element>ev.targetTouches[0].target;
    const rect = touchTarget.getBoundingClientRect();
    const x = ev.targetTouches[0].pageX - rect.left;
    const y = ev.targetTouches[0].pageY - rect.top;

    return new Vector2(x, -y);
}

const onInputStart = (cursorCoordinates: Vector2) => {
    isMouseDown = true;
    mouseMoved = false;
    clickedPos = cursorCoordinates;
    cameraPosOnMouseDown = camera.pos;
}

const onMove = (cursorCoordinates: Vector2, canvas: HTMLCanvasElement) => {
    if (isMouseDown) {
        camera.pos = Vector2.sum(cameraPosOnMouseDown, Vector2.sub(clickedPos, cursorCoordinates));
        canvas.style.cursor = "move";

        if (!Vector2.equals(cameraPosOnMouseDown, camera.pos)) {
            mouseMoved = true;
            camera.unfollowObject();
        }
    } else {
        const obj = Main.ambient.getObjectOnPosition(new Vector2(cursorCoordinates.x, -cursorCoordinates.y), true);
        canvas.style.cursor = (obj) ? "pointer" : "default";
    }
}

const onMouseUp = (ev: MouseEvent, canvas: HTMLCanvasElement) => {
    if (!isMouseDown)
        return;

    isMouseDown = false;
    canvas.style.cursor = "default";

    if (!mouseMoved) {
        let clickedPos = new Vector2(ev.offsetX, ev.offsetY);
        let obj = Main.ambient.getObjectOnPosition(clickedPos, true);

        ObjectSelectionController.selectObject((obj) ? obj : Main.ambient);
    }
}

const onDocumentClick = (e: MouseEvent) => {
    const target = (<HTMLElement>e.target);
    const buttonId = target.getAttribute("button-id");

    switch (target.getAttribute("button-kind")) {
        case DocumentButtonKind.MiscButton:
            const button = miscButtons.get(buttonId!);
            if (button && button.onClick)
                button.onClick();

            break;
        case DocumentButtonKind.CreateObjectButton:
            if (!ObjectCreationController.objectCreatable)
                return;

            const objectCreationArray = Array.from(objectCreationButtons);
            const objectPair = objectCreationArray.find(el => { return el[1].element.getAttribute("button-id") == buttonId })!;
            const objectKind = objectPair[0];
            const objectButton = objectPair[1];

            objectButton.onClick!(objectKind, Main.ambient, objectButton.createObjectConfig());
            break;
        case DocumentButtonKind.PropertyButton:
            const propertyKind: string | null = (<HTMLDivElement>e.target)!.getAttribute("property-kind");
            if (propertyKind)
                PropertyDescriptionUI.show(parseInt(propertyKind));
            return;
    }
}

const onWheel = (e: WheelEvent) => {
    if(e.deltaY < 0)
        camera.nextZoom();
    else
        camera.previousZoom();
}

canvas.addEventListener("mousedown", ev => { onInputStart(new Vector2(ev.offsetX, -ev.offsetY)); });
canvas.addEventListener("touchstart", ev => { onInputStart(getOffsetVector2(ev)); });
canvas.addEventListener("mousemove", ev => { onMove(new Vector2(ev.offsetX, -ev.offsetY), canvas); });
canvas.addEventListener("touchmove", ev => { onMove(getOffsetVector2(ev), canvas); });
canvas.addEventListener("wheel", ev => { onWheel(ev) })
document.addEventListener("mouseup", ev => { onMouseUp(ev, canvas) });
document.addEventListener("click", onDocumentClick);