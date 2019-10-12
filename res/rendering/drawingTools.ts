import { Camera } from "./canvasRenderer";
import Vector2 from "../vector2";
import { LineStyle, ArrowStyle, VectorStyle } from "../types";

export class DrawingTools {
    public static readonly DEFAULT_LINE_STYLE: LineStyle = {
        lineWidth: 3,
        style: "black"
    }
    public static readonly DEFAULT_ARROW_STYLE: ArrowStyle = {
        lineWidth: 3,
        style: "black",
        headLength: 10,
        headAngle: Math.PI / 6,
    }

    public static readonly DEFAULT_VECTOR_STYLE: VectorStyle = {
        lineWidth: 3,
        style: "black",
        headLength: 10,
        headAngle: Math.PI / 6,
        rectDashOffset: [10, 10],
        rectStyle: "grey",
        rectThickness: 2
    }


    private worldToCanvas: Function;

    constructor(private ctx: CanvasRenderingContext2D, private cam: Camera) {
        this.worldToCanvas = cam.getCanvasPosFromWorld.bind(cam);
    }

    worldMoveTo(pos: Vector2) {
        //@ts-ignore
        this.ctx.moveTo(...this.worldToCanvas(pos).toArray());
    }

    worldLineTo(pos: Vector2) {
        //@ts-ignore
        this.ctx.lineTo(...this.worldToCanvas(pos).toArray());
    }

    worldRect(pos: Vector2, size: Vector2, angleRad: number = 0, resizeOnZoom?: boolean) {
        this.ctx.save();

        this.ctx.rotate(angleRad);
        //@ts-ignore
        this.ctx.rect(...this.worldToCanvas(pos).toArray(), ...Vector2.mult(size, resizeOnZoom ? this.cam.zoom : 1).toArray());

        this.ctx.restore();
    }

    worldArc(pos: Vector2, radius: number, startAngle: number, endAngle: number, resizeOnZoom?: boolean, anticlockwise?: boolean) {
        //@ts-ignore
        this.ctx.arc(...this.worldToCanvas(pos).toArray(), resizeOnZoom ? (radius * this.cam.zoom) : radius, startAngle, endAngle, anticlockwise);
    }

    worldText(text: string, pos: Vector2, angleRad: number = 0) {
        this.ctx.save();

        const textMeasurement = this.ctx.measureText(text);
        this.rotateAroundCenterpoint(this.worldToCanvas(pos), new Vector2(textMeasurement.width, parseInt(this.ctx.font)), angleRad);
        //@ts-ignore
        this.ctx.fillText(text, ...this.worldToCanvas(pos).toArray());

        this.ctx.restore();
    }

    worldImage(imgElement: HTMLImageElement, pos: Vector2, size: Vector2, angleRad: number = 0, resizeOnZoom?: boolean, clipPos?: Vector2, clipSize?: Vector2) {
        this.ctx.save();

        const drawSize = resizeOnZoom ? Vector2.mult(size, this.cam.zoom) : size;
        const drawPos = Vector2.div(drawSize, 2).invert();

        this.rotateAroundCenterpoint(this.worldToCanvas(pos), drawSize, angleRad);

        if (clipSize)
            //@ts-ignore
            this.ctx.drawImage(imgElement, ...clipPos.toArray(), ...clipSize.toArray(), ...drawPos.toArray(), ...drawSize.toArray());
        else
            //@ts-ignore
            this.ctx.drawImage(imgElement, ...drawPos.toArray(), ...drawSize.toArray());

        this.ctx.restore();
    }

    drawLine(sPos: Vector2, fPos: Vector2, lineStyle: LineStyle = DrawingTools.DEFAULT_LINE_STYLE, isWorldPos: boolean = true): void {
        this.ctx.beginPath();

        if (isWorldPos) {
            this.worldMoveTo(sPos);
            this.worldLineTo(fPos);
        } else {
            //@ts-ignore
            this.ctx.moveTo(...sPos.toArray());
            //@ts-ignore
            this.ctx.lineTo(...fPos.toArray());
        }

        //Draw stroke
        if (this.configureLineStrokeStyle(lineStyle))
            this.ctx.stroke();

        this.configureLineStyle(lineStyle);
        this.ctx.stroke();

        this.ctx.closePath();
    }

    drawArrow(from: Vector2, to: Vector2, arrowStyle = DrawingTools.DEFAULT_ARROW_STYLE, isWorldPos: boolean = true) {
        this.ctx.save();

        from = isWorldPos ? this.worldToCanvas(from) : from;
        to = isWorldPos ? this.worldToCanvas(to) : to;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        const headLength = arrowStyle.resizeHeadlengthOnZoom ? arrowStyle.headLength * this.cam.zoom : arrowStyle.headLength;
        const head1 = new Vector2(to.x - headLength * Math.cos(angle - arrowStyle.headAngle), to.y - headLength * Math.sin(angle - arrowStyle.headAngle));
        const head2 = new Vector2(to.x - headLength * Math.cos(angle + arrowStyle.headAngle), to.y - headLength * Math.sin(angle + arrowStyle.headAngle));

        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        this.ctx.beginPath();

        //@ts-ignore
        this.ctx.moveTo(...head1.toArray());
        //@ts-ignore
        this.ctx.lineTo(...to.toArray());
        //@ts-ignore
        this.ctx.lineTo(...head2.toArray());
        //@ts-ignore
        this.ctx.moveTo(...to.toArray());
        //@ts-ignore
        this.ctx.lineTo(...from.toArray());

        if (this.configureLineStrokeStyle(arrowStyle))
            this.ctx.stroke();

        this.configureLineStyle(arrowStyle);
        this.ctx.stroke();

        this.ctx.closePath();

        this.ctx.restore();
    }

    drawVector(from: Vector2, to: Vector2, vectorStyle: VectorStyle = DrawingTools.DEFAULT_VECTOR_STYLE, isWorldPos: boolean = true) {
        this.ctx.save();

        this.drawArrow(from, to, vectorStyle, isWorldPos);

        const rectPos = new Vector2(Math.min(from.x, to.x), isWorldPos ? Math.max(from.y, to.y) : Math.min(from.y, to.y));
        const rectSize = new Vector2(Math.abs(to.x - from.x), Math.abs(to.y - from.y));;

        if (rectSize.x > 0 && rectSize.y > 0) {
            this.ctx.setLineDash(vectorStyle.rectDashOffset);
            this.ctx.strokeStyle = vectorStyle.rectStyle;
            this.ctx.lineWidth = vectorStyle.rectThicknessResizeOnZoom ? vectorStyle.rectThickness * this.cam.zoom : vectorStyle.rectThickness;

            this.ctx.beginPath();
            if (isWorldPos) {
                this.worldRect(rectPos, rectSize, 0, true);
            } else
                //@ts-ignore  
                this.ctx.rect(...rectPos.toArray(), ...rectSize.toArray());
                
            this.ctx.stroke();
            this.ctx.closePath();
        }

        this.ctx.restore();
    }

    private configureLineStrokeStyle(style: LineStyle) {
        if (style.strokeWidth) {
            this.ctx.lineWidth = style.strokeWidth + style.lineWidth;
            this.ctx.lineWidth = style.strokeWidthResizeOnZoom ? this.ctx.lineWidth * this.cam.zoom : this.ctx.lineWidth;
            this.ctx.strokeStyle = style.strokeStyle || "black";

            return true;
        }

        return false;
    }

    private configureLineStyle(style: LineStyle) {
        this.ctx.lineWidth = style.lineWidthResizeOnZoom ? style.lineWidth * this.cam.zoom : style.lineWidth;
        this.ctx.strokeStyle = style.style;
    }

    private rotateAroundCenterpoint(pos: Vector2, size: Vector2, angleRad: number): void {
        const pivotPos = Vector2.sum(pos, Vector2.div(size, 2));

        //@ts-ignore
        this.ctx.translate(...pivotPos.toArray());
        this.ctx.rotate(angleRad);
    }

}