import { Camera } from "./canvasRenderer";
import Vector2 from "../vector2";

export class DrawingTools {
    constructor(private ctx: CanvasRenderingContext2D, private camera: Camera){}

    worldLineTo(pos: Vector2){
        //@ts-ignore
        this.ctx.lineTo(...this.camera.getCanvasPosFromWorld(pos).toArray());
    }

    worldRect(pos: Vector2, size: Vector2){
        const func = this.camera.getCanvasPosFromWorld;
        //@ts-ignore
        this.ctx.rect(...func(pos).toArray(), ...func(size).toArray());
    }

    worldArc(pos: Vector2, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean){
        const func = this.camera.getCanvasPosFromWorld;
        //@ts-ignore
        this.ctx.arc(...func(pos).toArray(), radius, startAngle, endAngle, anticlockwise);
    }
}