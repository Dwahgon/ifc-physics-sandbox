var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./main", "./vector2", "./document", "./types"], function (require, exports, Main, vector2_1, document_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Main = __importStar(Main);
    vector2_1 = __importDefault(vector2_1);
    console.log("loading input");
    let isMouseDown = false;
    let clickedPos = vector2_1.default.zero;
    let cameraPosOnMouseDown = vector2_1.default.zero;
    let mouseMoved = false;
    let canvas = Main.canvasRenderer.context.canvas;
    let camera = Main.canvasRenderer.camera;
    let getOffsetVector2 = (ev) => {
        const touchTarget = ev.targetTouches[0].target;
        const rect = touchTarget.getBoundingClientRect();
        const x = ev.targetTouches[0].pageX - rect.left;
        const y = ev.targetTouches[0].pageY - rect.top;
        return new vector2_1.default(x, -y);
    };
    let onInputStart = (cursorCoordinates) => {
        isMouseDown = true;
        mouseMoved = false;
        clickedPos = cursorCoordinates;
        cameraPosOnMouseDown = camera.pos;
    };
    let onMove = (cursorCoordinates, canvas) => {
        if (isMouseDown) {
            camera.pos = vector2_1.default.sum(cameraPosOnMouseDown, vector2_1.default.sub(clickedPos, cursorCoordinates));
            canvas.style.cursor = "move";
            if (!vector2_1.default.equals(cameraPosOnMouseDown, camera.pos)) {
                mouseMoved = true;
                camera.unfollowObject();
            }
        }
        else {
            const obj = Main.ambient.getObjectOnPosition(new vector2_1.default(cursorCoordinates.x, -cursorCoordinates.y), true);
            canvas.style.cursor = (obj) ? "pointer" : "default";
        }
    };
    let onMouseUp = (ev, canvas) => {
        if (!isMouseDown)
            return;
        isMouseDown = false;
        canvas.style.cursor = "default";
        if (!mouseMoved) {
            let clickedPos = new vector2_1.default(ev.offsetX, ev.offsetY);
            let obj = Main.ambient.getObjectOnPosition(clickedPos, true);
            document_1.ObjectSelectionController.selectObject((obj) ? obj : Main.ambient);
        }
    };
    let onDocumentClick = (e) => {
        const target = e.target;
        const buttonId = target.getAttribute("button-id");
        switch (target.getAttribute("button-kind")) {
            case types_1.DocumentButtonKind.MiscButton:
                const button = document_1.miscButtons.get(buttonId);
                if (button && button.onClick)
                    button.onClick();
                break;
            case types_1.DocumentButtonKind.CreateObjectButton:
                if (!document_1.ObjectCreationController.objectCreatable)
                    return;
                const objectCreationArray = Array.from(document_1.objectCreationButtons);
                const objectPair = objectCreationArray.find(el => { return el[1].element.getAttribute("button-id") == buttonId; });
                const objectKind = objectPair[0];
                const objectButton = objectPair[1];
                objectButton.onClick(objectKind, Main.canvasRenderer, Main.ambient, objectButton.createObjectConfig());
                break;
            case types_1.DocumentButtonKind.PropertyButton:
                const propertyKind = e.target.getAttribute("property-kind");
                if (propertyKind)
                    document_1.PropertyDescriptionUI.show(parseInt(propertyKind));
                return;
        }
    };
    canvas.addEventListener("mousedown", ev => { onInputStart(new vector2_1.default(ev.offsetX, -ev.offsetY)); });
    canvas.addEventListener("touchstart", ev => { onInputStart(getOffsetVector2(ev)); });
    canvas.addEventListener("mousemove", ev => { onMove(new vector2_1.default(ev.offsetX, -ev.offsetY), canvas); });
    canvas.addEventListener("touchmove", ev => { onMove(getOffsetVector2(ev), canvas); });
    document.addEventListener("mouseup", ev => { onMouseUp(ev, canvas); });
    document.addEventListener("click", onDocumentClick);
});
