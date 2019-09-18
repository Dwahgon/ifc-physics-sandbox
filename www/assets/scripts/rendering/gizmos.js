var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading gizmos");
    class Gizmos {
        static drawSelection(canvasRenderer, rectStart, rectSize, selectionStyle) {
            const ctx = canvasRenderer.context;
            const cam = canvasRenderer.camera;
            ctx.save();
            let canvasFrom = cam.getCanvasPosFromWorld(rectStart);
            let sizeOnCanvas = vector2_1.default.mult(rectSize, cam.zoom);
            const offset = new vector2_1.default(selectionStyle.offset, selectionStyle.offset);
            canvasFrom = vector2_1.default.sub(canvasFrom, offset);
            sizeOnCanvas = vector2_1.default.sum(sizeOnCanvas, vector2_1.default.mult(offset, 2));
            ctx.strokeStyle = selectionStyle.style;
            ctx.lineWidth = selectionStyle.lineThickness;
            ctx.setLineDash(selectionStyle.lineDash);
            ctx.beginPath();
            //@ts-ignore
            ctx.rect(...canvasFrom.toArray(), ...sizeOnCanvas.toArray());
            ctx.stroke();
            ctx.restore();
        }
        static drawVector(canvasRenderer, from, to, vectorStyle) {
            const ctx = canvasRenderer.context;
            const cam = canvasRenderer.camera;
            ctx.save();
            const canvasFrom = cam.getCanvasPosFromWorld(from);
            const canvasTo = cam.getCanvasPosFromWorld(to);
            this.drawArrow(ctx, canvasFrom, canvasTo, vectorStyle);
            ctx.setLineDash([5]);
            ctx.strokeStyle = "gray";
            ctx.lineCap = "square";
            this.drawRect(ctx, canvasFrom, canvasTo);
            ctx.restore();
        }
        static drawPositionPoint(canvasRenderer, pos, pointPositionStyle) {
            const ctx = canvasRenderer.context;
            const cam = canvasRenderer.camera;
            ctx.save();
            const canvasPos = cam.getCanvasPosFromWorld(pos);
            ctx.lineWidth = pointPositionStyle.strokeThickness || 0;
            ctx.strokeStyle = pointPositionStyle.strokeStyle || "";
            ctx.fillStyle = pointPositionStyle.style;
            ctx.font = pointPositionStyle.font;
            const textOffset = new vector2_1.default(5, -5);
            ctx.beginPath();
            //@ts-ignore
            ctx.arc(...canvasPos.toArray(), pointPositionStyle.pointRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            //@ts-ignore
            ctx.strokeText(pos.toString(), ...vector2_1.default.sum(canvasPos, textOffset).toArray());
            //@ts-ignore
            ctx.fillText(pos.toString(), ...vector2_1.default.sum(canvasPos, textOffset).toArray());
            ctx.restore();
        }
        static drawArrow(ctx, from, to, vectorStyle) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const angle = Math.atan2(dy, dx);
            const draw = function () {
                ctx.beginPath();
                //@ts-ignore
                ctx.moveTo(...from.toArray());
                //@ts-ignore
                ctx.lineTo(...to.toArray());
                //@ts-ignore
                ctx.moveTo(...to.toArray());
                ctx.lineTo(to.x - vectorStyle.headLength * Math.cos(angle - Math.PI / 6), to.y - vectorStyle.headLength * Math.sin(angle - Math.PI / 6));
                //@ts-ignore
                ctx.moveTo(...to.toArray());
                ctx.lineTo(to.x - vectorStyle.headLength * Math.cos(angle + Math.PI / 6), to.y - vectorStyle.headLength * Math.sin(angle + Math.PI / 6));
                ctx.stroke();
            };
            ctx.lineCap = "round";
            if (vectorStyle.strokeStyle && vectorStyle.strokeThickness) {
                ctx.strokeStyle = vectorStyle.strokeStyle;
                ctx.lineWidth = vectorStyle.lineThickness + vectorStyle.strokeThickness;
                draw();
            }
            ctx.strokeStyle = vectorStyle.style;
            ctx.lineWidth = vectorStyle.lineThickness;
            draw();
        }
        static drawRect(ctx, from, to) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            if (dx == 0 || dy == 0)
                return;
            const smallestX = (from.x < to.x) ? from.x : to.x;
            const smallestY = (from.y < to.y) ? from.y : to.y;
            ctx.strokeRect(smallestX, smallestY, Math.abs(dx), Math.abs(dy));
        }
    }
    exports.default = Gizmos;
});
