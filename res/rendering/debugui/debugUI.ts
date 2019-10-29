import { Renderable } from "../../types";
import Vector2 from "../../vector2";
import { FPSCounter } from "./fpsCounter";
import { MousePositionDisplayer } from "./mousePosDisplayer";
import { CanvasRenderer } from "../canvasRenderer";
import { DebugUIItem } from "./debugUIItem";

export class DebugUI implements Renderable{
    private debugUIItems: Map<string, DebugUIItem>;
    
    constructor(){
        this.debugUIItems = new Map<string, DebugUIItem>();
        this.debugUIItems.set("fpscounter", new FPSCounter(Vector2.zero, 0.1));
        this.debugUIItems.set("mousecposdisplay", new MousePositionDisplayer(Vector2.zero));
        this.debugUIItems.set("mousewposdisplay", new MousePositionDisplayer(Vector2.zero, true));
    }

    onCanvasAdded(cR: CanvasRenderer){
        this.debugUIItems.forEach(v => v.onCanvasAdded(cR));
    }

    onCanvasRemoved(cR: CanvasRenderer){
        this.debugUIItems.forEach(v => v.onCanvasRemoved(cR));
    }

    draw(canvasRenderer: CanvasRenderer, step?: number | undefined): void {
        const values = Array.from(this.debugUIItems.values()).reverse();
        for (let i = 0; i < values.length; i++) {
            const debugUIItem = values[i];
            debugUIItem.pos = new Vector2(5, canvasRenderer.context.canvas.height - 5 - i * 16);
            debugUIItem.draw(canvasRenderer, step);
        }
    }
}