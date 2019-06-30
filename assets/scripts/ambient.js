(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./physicsObjects", "./fileController", "./document", "./main"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const physicsObjects_1 = require("./physicsObjects");
    const fileController_1 = require("./fileController");
    const document_1 = require("./document");
    const main_1 = require("./main");
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
        static fromJSON(json, canvasRenderer) {
            if (typeof json === "string") {
                return JSON.parse(json, function (key, value) {
                    return key === "" ? Ambient.fromJSON(value, canvasRenderer) : value;
                });
            }
            else {
                const loadedAmbient = new Ambient();
                json.objects.forEach(obj => physicsObjects_1.PhysicsObject.fromJSON(obj, canvasRenderer, loadedAmbient));
                return loadedAmbient;
            }
        }
        getObjectOnPosition(pos) {
            for (const obj of this.objects) {
                if (obj.sprite.positionIsInsideSprite(pos))
                    return obj;
            }
            return null;
        }
        addObject(obj) {
            this.objects.push(obj);
        }
        /* Selectable */
        get name() {
            return "Ambiente";
        }
        getProperty() {
            return undefined;
        }
        get isFollowable() {
            return false;
        }
        draw() {
            this.objects.forEach(obj => obj.sprite.draw());
        }
    }
    exports.default = Ambient;
    document_1.miscButtons.get("new-button").onClick = function () {
        const isOKClicked = confirm("Você tem certeza que quer criar um novo ambiente? As alterações não salvas serão perdidas!");
        if (isOKClicked)
            main_1.setAmbient(new Ambient());
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
                    main_1.setAmbient(Ambient.fromJSON(result, main_1.canvasRenderer));
                };
            }
        });
        input.click();
    };
});
