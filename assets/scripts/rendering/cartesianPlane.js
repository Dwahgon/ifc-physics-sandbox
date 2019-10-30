var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading cartesianPlane");
    class CartesianPlane {
        constructor(gridSize, style = CartesianPlane.BASIC_STYLE, xAxisName, yAxisName) {
            this.gridSize = gridSize;
            this.style = style;
            this.xAxisName = xAxisName;
            this.yAxisName = yAxisName;
        }
        draw(canvasRenderer) {
            const cam = canvasRenderer.camera;
            const ctx = canvasRenderer.context;
            const canvas = ctx.canvas;
            const startPos = cam.getWorldPosFromCanvas(new vector2_1.default(0, 0));
            const finishPos = cam.getWorldPosFromCanvas(new vector2_1.default(canvas.width, canvas.height));
            const startX = Math.ceil(startPos.x / this.gridSize) * this.gridSize;
            const startY = Math.floor(startPos.y / this.gridSize) * this.gridSize;
            const originPosOnCanvas = cam.getCanvasPosFromWorld(vector2_1.default.zero);
            for (let i = startX; i < finishPos.x; i += this.gridSize) {
                const x = (i - cam.pos.x) * cam.zoom + canvas.width / 2;
                if (i != 0) {
                    this.drawVerticalLine(ctx, x);
                    if (this.style.showMeasurements)
                        this.drawText(ctx, i.toString(), this.style.measurementFont, this.style.measurementStyle, x + 5, originPosOnCanvas.y - 5, false);
                }
            }
            for (let i = startY; i > finishPos.y; i -= this.gridSize) {
                const y = -((i - cam.pos.y) * cam.zoom - canvas.height / 2);
                if (i != 0) {
                    this.drawHorizontalLine(ctx, y);
                    if (this.style.showMeasurements)
                        this.drawText(ctx, i.toString(), this.style.measurementFont, this.style.measurementStyle, originPosOnCanvas.x + 5, y - 5, false);
                }
            }
            if (originPosOnCanvas.y > 0) {
                const y = originPosOnCanvas.y;
                this.drawXAxis(ctx, y);
                this.drawXAxisMarker(ctx, ctx.canvas.width - 25, y < ctx.canvas.height / 2 ? y + 30 : y - 10);
                if (this.xAxisName)
                    this.drawXAxisLabel(ctx, y, this.xAxisName);
            }
            if (originPosOnCanvas.x > 0) {
                const x = originPosOnCanvas.x;
                this.drawYAxis(ctx, x);
                this.drawYAxisMarker(ctx, x < ctx.canvas.width / 2 ? x + 10 : x - 30, 25);
                if (this.yAxisName)
                    this.drawYAxisLabel(ctx, x, this.yAxisName);
            }
            if (originPosOnCanvas.x > 0 && originPosOnCanvas.y > 0)
                this.drawOrigin(ctx, originPosOnCanvas.x, originPosOnCanvas.y);
        }
        drawText(ctx, text, font, color, x, y, strokeText, strokeStyle, strokeWidth) {
            ctx.save();
            ctx.lineWidth = strokeWidth || ctx.lineWidth;
            ctx.strokeStyle = strokeStyle || ctx.strokeStyle;
            ctx.font = font;
            ctx.fillStyle = color;
            if (strokeText)
                ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
            ctx.restore();
        }
        drawLine(ctx, startX, startY, finishX, finishY, style, lineWidth) {
            ctx.strokeStyle = style;
            ctx.fillStyle = style;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(finishX, finishY);
            ctx.stroke();
        }
        //Draw grid lines
        drawHorizontalLine(ctx, y) {
            this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.style.gridStyle, this.style.gridThickness);
        }
        drawVerticalLine(ctx, x) {
            this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.style.gridStyle, this.style.gridThickness);
        }
        //Draw axises
        drawXAxis(ctx, y) {
            this.drawLine(ctx, 0, y, ctx.canvas.width, y, this.style.xAxisStyle, this.style.axisLineThickness);
        }
        drawYAxis(ctx, x) {
            this.drawLine(ctx, x, 0, x, ctx.canvas.height, this.style.yAxisStyle, this.style.axisLineThickness);
        }
        //Draw axis marker
        drawXAxisMarker(ctx, x, y) {
            this.drawText(ctx, "x", this.style.axisMarkerFont, this.style.xAxisStyle, x, y, true, "white", 4);
        }
        drawYAxisMarker(ctx, x, y) {
            this.drawText(ctx, "y", this.style.axisMarkerFont, this.style.yAxisStyle, x, y, true, "white", 4);
        }
        //Draw axis label
        drawXAxisLabel(ctx, y, text) {
            ctx.font = this.style.axisNameFont;
            const textX = ctx.canvas.width - ctx.measureText(text).width - 35;
            const textY = y + 15;
            this.drawText(ctx, text, this.style.axisNameFont, this.style.xAxisStyle, textX, textY, true, "white", 3);
        }
        drawYAxisLabel(ctx, x, text) {
            ctx.save();
            ctx.font = this.style.axisNameFont;
            ctx.translate(x - 7, ctx.measureText(text).width + 35);
            ctx.rotate(-Math.PI / 2);
            this.drawText(ctx, text, this.style.axisNameFont, this.style.yAxisStyle, 0, 0, true, "white", 3);
            ctx.restore();
        }
        //Draw origin
        drawOrigin(ctx, x, y) {
            ctx.fillStyle = this.style.originStyle;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            const textX = x < ctx.canvas.width / 2 ? x + 5 : x - 35;
            const textY = y < ctx.canvas.height / 2 ? y + 30 : y - 10;
            this.drawText(ctx, "O", this.style.axisMarkerFont, this.style.originStyle, textX, textY, true, "white", 4);
        }
    }
    exports.CartesianPlane = CartesianPlane;
    CartesianPlane.ENVIRONMENT_STYLE = {
        xAxisStyle: "red",
        yAxisStyle: "green",
        gridStyle: "grey",
        originStyle: "blue",
        axisLineThickness: 3,
        gridThickness: 1,
        axisMarkerFont: "italic bold 30px CMU Serif",
        axisNameFont: "italic bold 15px CMU Serif",
        showMeasurements: false
    };
    CartesianPlane.BASIC_STYLE = {
        xAxisStyle: "black",
        yAxisStyle: "black",
        gridStyle: "lightgrey",
        originStyle: "black",
        measurementStyle: "grey",
        axisLineThickness: 1,
        gridThickness: 1,
        axisMarkerFont: "italic bold 30px CMU Serif",
        axisNameFont: "italic bold 15px CMU Serif",
        measurementFont: "italic bold 12px CMU Serif",
        showMeasurements: true
    };
});
