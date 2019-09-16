console.log("Loading sprite");

import { Renderable } from "../types";
import Vector2 from "../vector2";
import { CanvasRenderer } from "./canvasRenderer";

export class Sprite implements Renderable {
    public drawSize: Vector2;
    private image: HTMLImageElement;

    constructor(imageSrc: string, public copyPosition: Vector2, public copySize: Vector2, public drawPosition: Vector2, drawSize: Vector2) {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        this.image = imgElement;

        this.drawSize = drawSize;
    }

    getZoomedSize(zoom: number): Vector2 {
        return Vector2.mult(this.drawSize, zoom);
    }

    draw(canvasRenderer: CanvasRenderer): void {
        const cam = canvasRenderer.camera;
        const ctx = canvasRenderer.context;
        const posInCanvas = Vector2.sub(cam.getCanvasPosFromWorld(this.drawPosition), Vector2.div(this.getZoomedSize(cam.zoom), 2));

        // @ts-ignore
        ctx.drawImage(this.image,
            ...this.copyPosition.toArray(),
            ...this.copySize.toArray(),
            ...posInCanvas.toArray(),
            ...this.getZoomedSize(cam.zoom).toArray()
        );
    }
}