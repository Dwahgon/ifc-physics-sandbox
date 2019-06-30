import { PhysicsObject } from './physicsObjects';
import Selectable from './selectable';
import Vector2 from './vector2';
import { CanvasRenderer, Renderable } from './rendering';
import { AmbientJSON, PhysicsObjectJSON, downloadJSON } from './fileController';
import { miscButtons } from './document';
import { setAmbient, canvasRenderer, ambient } from './main';

export default class Ambient implements Selectable, Renderable {
    public readonly objects: PhysicsObject[];

    constructor() {
        this.objects = [];
    }

    toJSON(): AmbientJSON{
        let objectsArrayJson: PhysicsObjectJSON[] = [];
        this.objects.forEach(obj => objectsArrayJson.push(obj.toJSON()))
        return Object.assign({}, this, {
            objects: objectsArrayJson
        });
    }

    static fromJSON(json: AmbientJSON | string, canvasRenderer: CanvasRenderer): Ambient{
        if(typeof json === "string"){
            return JSON.parse(
                json, 
                function(key: string, value: any){
                    return key === "" ? Ambient.fromJSON(value, canvasRenderer) : value
                }
            );
        }else{
            const loadedAmbient = new Ambient();
            json.objects.forEach(obj => PhysicsObject.fromJSON(obj, canvasRenderer, loadedAmbient));
            return loadedAmbient;
        }
    }

    getObjectOnPosition(pos: Vector2): PhysicsObject | null {
        for (const obj of this.objects) {
            if (obj.sprite.positionIsInsideSprite(pos))
                return obj;
        }

        return null;
    }

    addObject(obj: PhysicsObject): void{
        this.objects.push(obj);
    }

    /* Selectable */

    get name(): string {
        return "Ambiente";
    }

    getProperty(): undefined {
        return undefined;
    }

    get isFollowable(){
        return false;
    }

    draw(): void {
        this.objects.forEach(obj => obj.sprite.draw());
    }
}

miscButtons.get("new-button")!.onClick = function() {
    const isOKClicked = confirm("Você tem certeza que quer criar um novo ambiente? As alterações não salvas serão perdidas!");
    if(isOKClicked)
        setAmbient(new Ambient());
};

miscButtons.get("save-button")!.onClick = function() {
    downloadJSON(JSON.stringify(ambient.toJSON()), "meuAmbiente.pha", "pha");
}

miscButtons.get("load-button")!.onClick = function(){
    const input = document.createElement("input");
    input.type = "file";

    input.addEventListener("change", () => {
        if(input.files){
            const file = input.files[0];
            const reader = new FileReader();
            reader.readAsText(file, "utf-8");

            reader.onload = ev => {
                const result = <string>(<FileReader>ev.target!).result;
                setAmbient(Ambient.fromJSON(result, canvasRenderer));
            };
        }
    })

    input.click();
};