import DocumentUI from 'document';
import {CanvasRenderer, Grid} from 'rendering';
import Ambient from 'ambient';
import Simulator from 'simulator';
import Input from 'input';
import Vector2 from 'vector2';

let can = document.createElement('canvas');
let ctx = can.getContext('2d');

can.width = 500;
can.height = 500;

document.body.querySelector("#mid-menu>div")!.appendChild(can);


export const canvasRenderer = new CanvasRenderer(ctx!, Vector2.zero, 100);

export const ambient = new Ambient();

export const documentUI = new DocumentUI();
documentUI.selectObject(ambient);

export const simulator = new Simulator(documentUI);

new Input(canvasRenderer);

canvasRenderer.add(() => ctx!.clearRect(0, 0, can.width, can.height));
new Grid(1, canvasRenderer);

canvasRenderer.start();