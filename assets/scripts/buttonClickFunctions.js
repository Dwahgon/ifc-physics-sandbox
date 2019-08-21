var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "./ambient", "./buttons", "./document", "./fileController", "./main", "./modals", "./physicsObjects", "./vector2"], function (require, exports, ambient_1, Buttons, document_1, fileController_1, Main, Modals, physicsObjects_1, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ambient_1 = __importDefault(ambient_1);
    Buttons = __importStar(Buttons);
    Main = __importStar(Main);
    Modals = __importStar(Modals);
    vector2_1 = __importDefault(vector2_1);
    console.log("Loaded buttonClickFunctions");
    /*
        Button onClick setter
    */
    Buttons.getButtonById("destroy-button").onClick = () => {
        const selectedObject = document_1.ObjectSelectionController.selectedObject;
        if (!selectedObject || !selectedObject.destroy || Main.simulator.time != 0)
            return;
        selectedObject.destroy();
        document_1.ObjectSelectionController.selectObject(Main.ambient);
    };
    Buttons.getButtonById("follow-button").onClick = () => {
        const selectedObject = document_1.ObjectSelectionController.selectedObject;
        if (!selectedObject || !selectedObject.isFollowable)
            return;
        const camera = Main.canvasRenderer.camera;
        if (camera.objectBeingFollowed != selectedObject)
            camera.followObject(selectedObject);
        else
            camera.unfollowObject();
    };
    Buttons.getButtonById("new-file-button").onClick = function () {
        const isOKClicked = confirm("Você tem certeza que quer criar um novo ambiente? As alterações não salvas serão perdidas!");
        if (isOKClicked) {
            Main.setAmbient(new ambient_1.default());
            Main.simulator.reset();
            Main.canvasRenderer.camera.focusOrigin();
        }
    };
    Buttons.getButtonById("save-file-button").onClick = function () {
        fileController_1.downloadJSON(JSON.stringify(Main.ambient.toJSON()), "meuAmbiente.pha", "pha");
    };
    Buttons.getButtonById("load-file-button").onClick = function () {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", () => {
            if (input.files) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.readAsText(file, "utf-8");
                reader.onload = ev => {
                    const result = ev.target.result;
                    try {
                        Main.setAmbient(ambient_1.default.fromJSON(result));
                    }
                    catch (_a) {
                        document_1.Alert.throwAlert("Não foi possível carregar este arquivo!", document_1.Alert.ERROR);
                    }
                };
            }
        });
        input.click();
    };
    Buttons.getButtonById("center-camera-button").onClick = Main.canvasRenderer.camera.focusOrigin.bind(Main.canvasRenderer.camera);
    /*
        Predined click functions
    */
    Buttons.predefinedClickEvents.set("closeModal", (args) => Modals.getModalById(args).setVisible(false));
    Buttons.predefinedClickEvents.set("hideElement", (args) => document.getElementById(args).style.display = "none");
    Buttons.predefinedClickEvents.set("createObject", (args) => {
        if (Main.simulator.time > 0)
            return;
        physicsObjects_1.PhysicsObject.createPhysicsObject(parseInt(args), Main.ambient, {
            position: Main.canvasRenderer.camera.getWorldPosFromCanvas(new vector2_1.default(Main.canvasRenderer.context.canvas.width / 2, Main.canvasRenderer.context.canvas.height / 2)),
            size: new vector2_1.default(1, 1)
        });
    });
    Buttons.predefinedClickEvents.set("openPropertyDescription", (args) => document_1.PropertyDescriptionUI.show(parseInt(args)));
    Buttons.predefinedClickEvents.set("openModal", (args) => {
        const modal = Modals.getModalById(args);
        if (modal)
            modal.setVisible(true);
    });
});
