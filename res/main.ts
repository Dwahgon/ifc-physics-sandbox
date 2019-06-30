import Ambient from './ambient';
import Input from './input';
import { CanvasRenderer, Grid } from './rendering';
import Simulator from './simulator';
import Vector2 from './vector2';
import { ObjectSelectionController } from './document';


let can = document.createElement('canvas');
let ctx = can.getContext('2d');

can.width = 500;
can.height = 500;

document.body.querySelector("#mid-menu>div")!.appendChild(can);

export const canvasRenderer = new CanvasRenderer(ctx!, Vector2.zero, 100);
export let ambient = new Ambient();
export const simulator = new Simulator();

export const setAmbient = function (a: Ambient) {
    canvasRenderer.remove(ambient);
    ambient = a;
    canvasRenderer.add(ambient);
    ObjectSelectionController.selectObject(ambient);
}

ObjectSelectionController.selectObject(ambient);

new Input(canvasRenderer);

canvasRenderer.add({ draw() { ctx!.clearRect(0, 0, can.width, can.height) } });
canvasRenderer.add(new Grid(1));
canvasRenderer.add(ambient);

canvasRenderer.start();