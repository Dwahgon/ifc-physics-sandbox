console.log("Loading fpsCounter");

import { Renderable } from "../types";
import { CanvasRenderer } from "./canvasRenderer";

export class FPSCounter implements Renderable {
    private lastFrameTimestamp: number;
    private fps: number;
    private nextUpdate: number;

    constructor(private readonly delay: number) {
        this.lastFrameTimestamp = 0;
        this.nextUpdate = 0;
        this.fps = 0;
    }

    draw(canvasRenderer: CanvasRenderer, step: number): void {
        const ctx = canvasRenderer.context;

        if (step > this.nextUpdate) {
            this.fps = 1000 / (step - this.lastFrameTimestamp);
            this.nextUpdate = step + this.delay;
        }

        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(`${this.fps.toFixed(2)} FPS`, 5, ctx.canvas.height - 5);
        this.lastFrameTimestamp = step;
    }
}