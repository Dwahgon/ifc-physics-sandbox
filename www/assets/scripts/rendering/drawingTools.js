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
        worldMoveTo(pos) {
            //@ts-ignore
            this.ctx.moveTo(...this.worldToCanvas(pos).toArray());
        }
        worldLineTo(pos) {
            //@ts-ignore
            this.ctx.lineTo(...this.worldToCanvas(pos).toArray());
        }
        worldRect(pos, size, angleRad = 0, resizeOnZoom) {
            this.ctx.save();
            this.ctx.rotate(angleRad);
            //@ts-ignore
            this.ctx.rect(...this.worldToCanvas(pos).toArray(), ...vector2_1.default.mult(size, resizeOnZoom ? this.cam.zoom : 1).toArray());
            this.ctx.restore();
        }
        worldArc(pos, radius, startAngle, endAngle, resizeOnZoom, anticlockwise) {
            //@ts-ignore
            this.ctx.arc(...this.worldToCanvas(pos).toArray(), resizeOnZoom ? (radius * this.cam.zoom) : radius, startAngle, endAngle, anticlockwise);
        }
        worldText(text, pos, angleRad = 0) {
            this.ctx.save();
            const textMeasurement = this.ctx.measureText(text);
            this.rotateAroundCenterpoint(this.worldToCanvas(pos), new vector2_1.default(textMeasurement.width, parseInt(this.ctx.font)), angleRad);
            //@ts-ignore
            this.ctx.fillText(text, ...this.worldToCanvas(pos).toArray());
            this.ctx.restore();
        }
        worldImage(imgElement, pos, size, angleRad = 0, resizeOnZoom, clipPos, clipSize) {
            this.ctx.save();
            const drawSize = resizeOnZoom ? vector2_1.default.mult(size, this.cam.zoom) : size;
            const drawPos = vector2_1.default.div(drawSize, 2).invert();
            this.rotateAroundCenterpoint(this.worldToCanvas(pos), drawSize, angleRad);
            if (clipSize)
                //@ts-ignore
                this.ctx.drawImage(imgElement, ...clipPos.toArray(), ...clipSize.toArray(), ...drawPos.toArray(), ...drawSize.toArray());
            else
                //@ts-ignore
                this.ctx.drawImage(imgElement, ...drawPos.toArray(), ...drawSize.toArray());
            this.ctx.restore();
        }
        drawLine(sPos, fPos, lineStyle = DrawingTools.DEFAULT_LINE_STYLE, isWorldPos = true) {
            this.ctx.beginPath();
            if (isWorldPos) {
                this.worldMoveTo(sPos);
                this.worldLineTo(fPos);
            }
            else {
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
        drawArrow(from, to, arrowStyle = DrawingTools.DEFAULT_ARROW_STYLE, isWorldPos = true) {
            this.ctx.save();
            from = isWorldPos ? this.worldToCanvas(from) : from;
            to = isWorldPos ? this.worldToCanvas(to) : to;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const angle = Math.atan2(dy, dx);
            const headLength = arrowStyle.resizeHeadlengthOnZoom ? arrowStyle.headLength * this.cam.zoom : arrowStyle.headLength;
            const head1 = new vector2_1.default(to.x - headLength * Math.cos(angle - arrowStyle.headAngle), to.y - headLength * Math.sin(angle - arrowStyle.headAngle));
            const head2 = new vector2_1.default(to.x - headLength * Math.cos(angle + arrowStyle.headAngle), to.y - headLength * Math.sin(angle + arrowStyle.headAngle));
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
        drawVector(from, to, vectorStyle = DrawingTools.DEFAULT_VECTOR_STYLE, isWorldPos = true) {
            this.ctx.save();
            this.drawArrow(from, to, vectorStyle, isWorldPos);
            const rectPos = new vector2_1.default(Math.min(from.x, to.x), isWorldPos ? Math.max(from.y, to.y) : Math.min(from.y, to.y));
            const rectSize = new vector2_1.default(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
            ;
            if (rectSize.x > 0 && rectSize.y > 0) {
                this.ctx.setLineDash(vectorStyle.rectDashOffset);
                this.ctx.strokeStyle = vectorStyle.rectStyle;
                this.ctx.lineWidth = vectorStyle.rectThicknessResizeOnZoom ? vectorStyle.rectThickness * this.cam.zoom : vectorStyle.rectThickness;
                this.ctx.beginPath();
                if (isWorldPos) {
                    this.worldRect(rectPos, rectSize, 0, true);
                }
                else
                    //@ts-ignore  
                    this.ctx.rect(...rectPos.toArray(), ...rectSize.toArray());
                this.ctx.stroke();
                this.ctx.closePath();
            }
            this.ctx.restore();
        }
        configureLineStrokeStyle(style) {
            if (style.strokeWidth) {
                this.ctx.lineWidth = style.strokeWidth + style.lineWidth;
                this.ctx.lineWidth = style.strokeWidthResizeOnZoom ? this.ctx.lineWidth * this.cam.zoom : this.ctx.lineWidth;
                this.ctx.strokeStyle = style.strokeStyle || "black";
                return true;
            }
            return false;
        }
        configureLineStyle(style) {
            this.ctx.lineWidth = style.lineWidthResizeOnZoom ? style.lineWidth * this.cam.zoom : style.lineWidth;
            this.ctx.strokeStyle = style.style;
        }
        rotateAroundCenterpoint(pos, size, angleRad) {
            const pivotPos = vector2_1.default.sum(pos, vector2_1.default.div(size, 2));
            //@ts-ignore
            this.ctx.translate(...pivotPos.toArray());
            this.ctx.rotate(angleRad);
        }
    }
    DrawingTools.DEFAULT_LINE_STYLE = {
        lineWidth: 3,
        style: "black"
    };
    DrawingTools.DEFAULT_ARROW_STYLE = {
        lineWidth: 3,
        style: "black",
        headLength: 10,
        headAngle: Math.PI / 6,
    };
    DrawingTools.DEFAULT_VECTOR_STYLE = {
        lineWidth: 3,
        style: "black",
        headLength: 10,
        headAngle: Math.PI / 6,
        rectDashOffset: [10, 10],
        rectStyle: "grey",
        rectThickness: 2
    };
    exports.DrawingTools = DrawingTools;
});
