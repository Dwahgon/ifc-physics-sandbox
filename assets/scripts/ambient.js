define(["require", "exports", "./document", "./fileController", "./main", "./physicsObjects"], function (require, exports, document_1, fileController_1, main_1, physicsObjects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading ambient");
    class Ambient {
        constructor() {
            this.objects = [];
        }
        toJSON() {
            let objectsArrayJson = [];
            this.objects.forEach(obj => objectsArrayJson.push(obj.toJSON()));
            return Object.assign({}, this, {
                objects: objectsArrayJson
            });
        }
        static fromJSON(json) {
            if (typeof json === "string") {
                return JSON.parse(json, function (key, value) {
                    return key === "" ? Ambient.fromJSON(value) : value;
                });
            }
            else {
                const loadedAmbient = new Ambient();
                json.objects.forEach(obj => physicsObjects_1.PhysicsObject.fromJSON(obj, loadedAmbient));
                return loadedAmbient;
            }
        }
        getObjectOnPosition(pos, convertToWorldPos) {
            if (convertToWorldPos)
                pos = main_1.canvasRenderer.camera.getWorldPosFromCanvas(pos);
            for (const obj of this.objects) {
                if (obj.isPositionInsideObject(pos))
                    return obj;
            }
            return null;
        }
        addObject(obj) {
            this.objects.push(obj);
        }
        get name() {
            return "Ambiente";
        }
        getProperty() {
            return undefined;
        }
        get isFollowable() {
            return false;
        }
        draw(cam, ctx) {
            this.objects.forEach(obj => obj.sprite.draw(cam, ctx));
        }
        simulate(step) {
            this.objects.forEach(object => object.simulate(step));
        }
        reset() {
            this.objects.forEach(object => object.reset());
        }
    }
    exports.default = Ambient;
    document_1.miscButtons.get("new-button").onClick = function () {
        const isOKClicked = confirm("Você tem certeza que quer criar um novo ambiente? As alterações não salvas serão perdidas!");
        if (isOKClicked) {
            main_1.setAmbient(new Ambient());
            main_1.simulator.reset();
            main_1.canvasRenderer.camera.focusOrigin();
        }
    };
    document_1.miscButtons.get("save-button").onClick = function () {
        fileController_1.downloadJSON(JSON.stringify(main_1.ambient.toJSON()), "meuAmbiente.pha", "pha");
    };
    document_1.miscButtons.get("load-button").onClick = function () {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", () => {
            if (input.files) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.readAsText(file, "utf-8");
                reader.onload = ev => {
                    const result = ev.target.result;
                    main_1.setAmbient(Ambient.fromJSON(result));
                };
            }
        });
        input.click();
    };
});
