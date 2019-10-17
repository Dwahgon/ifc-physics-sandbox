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
        draw(canvasRenderer) {
            const offsettedPos = this.drawPosition.sub(this.drawSize.div(new vector2_1.default(2, -2))); //offsettedPos = drawPosition - drawSize/V(2, -2)
            canvasRenderer.drawingTools.worldImage(this.image, offsettedPos, this.drawSize, 0, true);
        }
    }
    exports.Sprite = Sprite;
});
