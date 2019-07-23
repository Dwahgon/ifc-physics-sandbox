console.log("Loading ambient");

import { miscButtons } from './document';
import { AmbientJSON, downloadJSON, PhysicsObjectJSON } from './fileController';
import { ambient, canvasRenderer, setAmbient, simulator } from './main';
import { PhysicsObject } from './physicsObjects';
import { Camera } from './rendering';
import { Renderable, Selectable, Simulatable } from './types';
import Vector2 from './vector2';

export default class Ambient implements Selectable, Renderable, Simulatable {
    public readonly objects: PhysicsObject[];

    constructor() {
        this.objects = [];
    }

    toJSON(): AmbientJSON {
        let objectsArrayJson: PhysicsObjectJSON[] = [];
        this.objects.forEach(obj => objectsArrayJson.push(obj.toJSON()))
        return Object.assign({}, this, {
            objects: objectsArrayJson
        });
    }

    static fromJSON(json: AmbientJSON | string): Ambient {
        if (typeof json === "string") {
            return JSON.parse(
                json,
                function (key: string, value: any) {
                    return key === "" ? Ambient.fromJSON(value) : value
                }
            );
        } else {
            const loadedAmbient = new Ambient();
            json.objects.forEach(obj => PhysicsObject.fromJSON(obj, loadedAmbient));
            return loadedAmbient;
        }
    }

    getObjectOnPosition(pos: Vector2, convertToWorldPos?: boolean): PhysicsObject | null {
        if (convertToWorldPos)
            pos = canvasRenderer.camera.getWorldPosFromCanvas(pos);

        for (const obj of this.objects) {
            if (obj.isPositionInsideObject(pos))
                return obj;
        }

        return null;
    }

    addObject(obj: PhysicsObject): void {
        this.objects.push(obj);
    }

    get name(): string {
        return "Ambiente";
    }

    getProperty(): undefined {
        return undefined;
    }

    get isFollowable() {
        return false;
    }

    draw(cam: Camera, ctx: CanvasRenderingContext2D): void {
        this.objects.forEach(obj => obj.sprite.draw(cam, ctx));
    }

    simulate(step: number): void {
        this.objects.forEach(object => object.simulate(step));
    }

    reset(): void {
        this.objects.forEach(object => object.reset());
    }
}

miscButtons.get("new-button")!.onClick = function () {
    const isOKClicked = confirm("Você tem certeza que quer criar um novo ambiente? As alterações não salvas serão perdidas!");
    if (isOKClicked) {
        setAmbient(new Ambient());
        simulator.reset();
        canvasRenderer.camera.focusOrigin();
    }
};

miscButtons.get("save-button")!.onClick = function () {
    downloadJSON(JSON.stringify(ambient.toJSON()), "meuAmbiente.pha", "pha");
}

miscButtons.get("load-button")!.onClick = function () {
    const input = document.createElement("input");
    input.type = "file";

    input.addEventListener("change", () => {
        if (input.files) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.readAsText(file, "utf-8");

            reader.onload = ev => {
                const result = <string>(<FileReader>ev.target!).result;
                setAmbient(Ambient.fromJSON(result));
            };
        }
    })

    input.click();
};