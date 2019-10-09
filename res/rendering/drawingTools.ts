import { Camera } from "./canvasRenderer";
import Vector2 from "../vector2";

export class DrawingTools {
    private worldToCanvas: Function;

    constructor(private ctx: CanvasRenderingContext2D, private cam: Camera){
        this.worldToCanvas = cam.getCanvasPosFromWorld.bind(cam);
    }

    worldLineTo(pos: Vector2){
        //@ts-ignore
        this.ctx.lineTo(...this.camera.getCanvasPosFromWorld(pos).toArray());
    }

    worldRect(pos: Vector2, size: Vector2, angleRad: number = 0){
        this.ctx.save();
        
        this.ctx.rotate(angleRad);
        //@ts-ignore
        this.ctx.rect(...this.worldToCanvas(pos).toArray(), ...this.worldToCanvas(size).toArray());
        this.ctx.restore();
    }

    worldArc(pos: Vector2, radius: number, startAngle: number, endAngle: number, radiusIsWorld?: boolean, anticlockwise?: boolean){
        //@ts-ignore
        this.ctx.arc(...this.worldToCanvas(pos).toArray(), radiusIsWorld ? (radius * this.cam.zoom) : radius , startAngle, endAngle, anticlockwise);
    }

    worldText(text: string, pos: Vector2, angleRad: number = 0){
        this.ctx.save();

        this.ctx.rotate(angleRad);
        //@ts-ignore
        this.ctx.fillText(text, ...this.worldToCanvas(pos).toArray());

        this.ctx.restore();
    }

    worldImage(imgSrc: string, pos: Vector2, angleRad:number = 0, size?: Vector2, resizeOnZoom?: boolean, clipPos?: Vector2, clipSize?: Vector2){
        this.ctx.save();
        
        this.ctx.rotate(angleRad);

        const img = document.createElement("img");
        img.src = imgSrc;
        
        let drawSize: Vector2 | undefined = undefined;
        if(size && resizeOnZoom)
            drawSize = Vector2.mult(size, this.cam.zoom);
        else if(size)
            drawSize = size;

        if(clipSize)
            //@ts-ignore
            this.ctx.drawImage(img, ...clipPos.toArray(), ...clipSize.toArray(), ...this.worldToCanvas(pos).toArray(), ...drawSize.toArray());
        else
            //@ts-ignore
            this.ctx.drawImage(img, ...this.worldToCanvas(pos).toArray(), ...drawSize.toArray());

        this.ctx.restore();
    }
}