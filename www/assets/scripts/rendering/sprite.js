var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading sprite");
    class Sprite {
        constructor(imageSrc, copyPosition, copySize, drawPosition, drawSize) {
            this.copyPosition = copyPosition;
            this.copySize = copySize;
            this.drawPosition = drawPosition;
            const imgElement = document.createElement('img');
            imgElement.src = imageSrc;
            this.image = imgElement;
            this.drawSize = drawSize;
        }
        getZoomedSize(zoom) {
            return vector2_1.default.mult(this.drawSize, zoom);
        }
        draw(canvasRenderer) {
            const cam = canvasRenderer.camera;
            const ctx = canvasRenderer.context;
            const posInCanvas = vector2_1.default.sub(cam.getCanvasPosFromWorld(this.drawPosition), vector2_1.default.div(this.getZoomedSize(cam.zoom), 2));
            // @ts-ignore
            ctx.drawImage(this.image, ...this.copyPosition.toArray(), ...this.copySize.toArray(), ...posInCanvas.toArray(), ...this.getZoomedSize(cam.zoom).toArray());
        }
    }
    exports.Sprite = Sprite;
});
