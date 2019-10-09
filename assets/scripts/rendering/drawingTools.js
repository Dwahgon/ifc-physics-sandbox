var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    class DrawingTools {
        constructor(ctx, cam) {
            this.ctx = ctx;
            this.cam = cam;
            this.worldToCanvas = cam.getCanvasPosFromWorld.bind(cam);
        }
        worldLineTo(pos) {
            //@ts-ignore
            this.ctx.lineTo(...this.camera.getCanvasPosFromWorld(pos).toArray());
        }
        worldRect(pos, size, angleRad = 0) {
            this.ctx.save();
            this.ctx.rotate(angleRad);
            //@ts-ignore
            this.ctx.rect(...this.worldToCanvas(pos).toArray(), ...this.worldToCanvas(size).toArray());
            this.ctx.restore();
        }
        worldArc(pos, radius, startAngle, endAngle, radiusIsWorld, anticlockwise) {
            //@ts-ignore
            this.ctx.arc(...this.worldToCanvas(pos).toArray(), radiusIsWorld ? (radius * this.cam.zoom) : radius, startAngle, endAngle, anticlockwise);
        }
        worldText(text, pos, angleRad = 0) {
            this.ctx.save();
            this.ctx.rotate(angleRad);
            //@ts-ignore
            this.ctx.fillText(text, ...this.worldToCanvas(pos).toArray());
            this.ctx.restore();
        }
        worldImage(imgSrc, pos, angleRad = 0, size, resizeOnZoom, clipPos, clipSize) {
            this.ctx.save();
            this.ctx.rotate(angleRad);
            const img = document.createElement("img");
            img.src = imgSrc;
            let drawSize = undefined;
            if (size && resizeOnZoom)
                drawSize = vector2_1.default.mult(size, this.cam.zoom);
            else if (size)
                drawSize = size;
            if (clipSize)
                //@ts-ignore
                this.ctx.drawImage(img, ...clipPos.toArray(), ...clipSize.toArray(), ...this.worldToCanvas(pos).toArray(), ...drawSize.toArray());
            else
                //@ts-ignore
                this.ctx.drawImage(img, ...this.worldToCanvas(pos).toArray(), ...drawSize.toArray());
            this.ctx.restore();
        }
    }
    exports.DrawingTools = DrawingTools;
});
