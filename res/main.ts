console.log("Loading main");

import Ambient from './ambient';
import * as Buttons from "./document/buttons";
import { ObjectSelectionController } from './document/document';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { CartesianPlane } from './rendering/cartesianPlane';
import { FPSCounter } from './rendering/fpsCounter';
import Simulator from './simulator';
import Vector2 from './vector2';

let can = document.createElement('canvas');
let ctx = can.getContext('2d');
document.body.querySelector("#canvas-holder")!.appendChild(can);

export const canvasRenderer = new CanvasRenderer(ctx!, Vector2.zero, 100, 5, 500);
export let ambient = new Ambient();
export const simulator = new Simulator(Buttons.getButtonById("play-button")!, Buttons.getButtonById("reset-button")!, Buttons.getButtonById("destroy-button")!);

import("./document/buttonClickFunctions");
import("./rendering/graph");

export const setAmbient = function (a: Ambient) {
    canvasRenderer.remove(ambient);
    simulator.remove(ambient);
    ambient = a;
    canvasRenderer.add(ambient);
    simulator.add(ambient);
    ObjectSelectionController.selectObject(ambient);
}

ObjectSelectionController.selectObject(ambient);

simulator.add(ambient);

canvasRenderer.add(new CartesianPlane(1, CartesianPlane.ENVIRONMENT_STYLE));
canvasRenderer.add(ambient);
canvasRenderer.add(new FPSCounter(100));

canvasRenderer.start();

