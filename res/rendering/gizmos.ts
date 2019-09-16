console.log("Loading gizmos");

import { Followable, PositionPointGizmosStyle, VectorGizmosStyle } from "../types";
import Vector2 from "../vector2";
import { CanvasRenderer } from "./canvasRenderer";

export default abstract class Gizmos {
    static drawSelection(canvasRenderer: CanvasRenderer, object: Followable) {

    }

    static drawVector(canvasRenderer: CanvasRenderer, from: Vector2, to: Vector2, vectorStyle: VectorGizmosStyle) {
        const ctx = canvasRenderer.context;
        const cam = canvasRenderer.camera;

        const canvasFrom = cam.getCanvasPosFromWorld(from);
        const canvasTo = cam.getCanvasPosFromWorld(to);

        this.drawArrow(ctx, canvasFrom, canvasTo, vectorStyle);

        ctx.setLineDash([5]);
        ctx.strokeStyle = "gray";
        ctx.lineCap = "square";
        this.drawRect(ctx, canvasFrom, canvasTo);
    }

    static drawPositionPoint(canvasRenderer: CanvasRenderer, pos: Vector2, pointPositionStyle: PositionPointGizmosStyle) {
        const ctx = canvasRenderer.context;
        const cam = canvasRenderer.camera;

        const canvasPos = cam.getCanvasPosFromWorld(pos);

        ctx.lineWidth = pointPositionStyle.strokeThickness || 0;
        ctx.strokeStyle = pointPositionStyle.strokeStyle || "";
        ctx.fillStyle = pointPositionStyle.style;
        ctx.font = pointPositionStyle.font;
        const textOffset = new Vector2(5, -5);


        ctx.beginPath();
        //@ts-ignore
        ctx.arc(...canvasPos.toArray(), pointPositionStyle.pointRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        //@ts-ignore
        ctx.strokeText(pos.toString(), ...Vector2.sum(canvasPos, textOffset).toArray());
        //@ts-ignore
        ctx.fillText(pos.toString(), ...Vector2.sum(canvasPos, textOffset).toArray());
    }

    private static drawArrow(ctx: CanvasRenderingContext2D, from: Vector2, to: Vector2, vectorStyle: VectorGizmosStyle) {
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
        }

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

    private static drawRect(ctx: CanvasRenderingContext2D, from: Vector2, to: Vector2) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        if (dx == 0 || dy == 0)
            return;

        const smallestX = (from.x < to.x) ? from.x : to.x;
        const smallestY = (from.y < to.y) ? from.y : to.y;

        ctx.strokeRect(smallestX, smallestY, Math.abs(dx), Math.abs(dy));
    }
}