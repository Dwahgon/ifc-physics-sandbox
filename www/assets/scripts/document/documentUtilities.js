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
define(["require", "exports", "../main", "../propertyDescriptions", "../rendering/canvasRenderer", "../rendering/cartesianPlane", "../vector2", "./buttons", "./documentElements", "./modals", "./propertyEditor"], function (require, exports, main_1, propertyDescriptions_1, canvasRenderer_1, cartesianPlane_1, vector2_1, Buttons, documentElements_1, Modals, propertyEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    propertyDescriptions_1 = __importDefault(propertyDescriptions_1);
    vector2_1 = __importDefault(vector2_1);
    Buttons = __importStar(Buttons);
    documentElements_1 = __importDefault(documentElements_1);
    Modals = __importStar(Modals);
    console.log("Loading document");
    class PropertyDescriptionUI {
        static setElementVisible(isVisible) {
            this.modal.setVisible(isVisible);
        }
        static show(propertyKind) {
            this.setElementVisible(true);
            const description = propertyDescriptions_1.default.get(propertyKind);
            if (description)
                this.modal.element.querySelector("article").innerHTML = description;
            else
                this.hide();
        }
        static hide() {
            this.setElementVisible(false);
        }
    }
    exports.PropertyDescriptionUI = PropertyDescriptionUI;
    PropertyDescriptionUI.modal = Modals.getModalById("property-description-modal");
    class GraphPanel {
        static initialize(element, closeGraphButton) {
            this.panel = element;
            this.title = this.panel.querySelector("h1");
            const canvas = document.createElement("canvas");
            canvas.width = 10;
            canvas.height = 10;
            this.panel.querySelector(".panel-content").appendChild(canvas);
            this.canvasRenderer = new canvasRenderer_1.CanvasRenderer(canvas.getContext("2d"));
            this.canvasRenderer.camera.pos = new vector2_1.default(150, 150);
            this.cartesianPlane = new cartesianPlane_1.CartesianPlane(1);
            this.canvasRenderer.add(this.cartesianPlane);
            closeGraphButton.onClick = () => this.stopRenderingGraph();
        }
        static setElementVisible(v, title = "Gráfico") {
            this.panel.style.display = v ? "flex" : "none";
            this.title.innerHTML = title;
            if (!v) {
                this.stopRenderingGraph();
                if (this.onClose) {
                    this.onClose();
                    this.onClose = null;
                }
            }
        }
        static renderGraph(graph) {
            this.stopRenderingGraph();
            this.canvasRenderer.add(graph);
            this.graph = graph;
            this.cartesianPlane.xAxisName = graph.valueGetterX.name;
            this.cartesianPlane.yAxisName = graph.valueGetterY.name;
            this.canvasRenderer.start();
        }
        static stopRenderingGraph() {
            if (this.graph) {
                this.canvasRenderer.remove(this.graph);
                this.graph = null;
            }
            this.canvasRenderer.stop();
        }
    }
    exports.GraphPanel = GraphPanel;
    /**
     * Class that controls if the CreateObjectButtons are enabled or not
     */
    class ObjectCreationController {
        static set objectCreatable(value) {
            this._objectCreatable = value;
            if (!this.objectListElement)
                this.objectListElement = documentElements_1.default.get("object-list");
            this.objectListElement.querySelectorAll("button").forEach(element => Buttons.getButtonByHTMLElement(element).enabled = value);
        }
        static get objectCreatable() {
            return this._objectCreatable;
        }
    }
    exports.ObjectCreationController = ObjectCreationController;
    ObjectCreationController._objectCreatable = true;
    ObjectCreationController.objectListElement = null;
    /**
     * Controlls the selection of Selectable objects
     */
    class ObjectSelectionController {
        static initialize(propertyEditor) {
            this.propertyEditor = propertyEditor;
        }
        /**
         * @returns the currently selected object
         */
        static get selectedObject() {
            return this._selectedObject;
        }
        /**
         * Selects an object, displaying it's properties in the properties list
         * @param object the object to be selected
         */
        static selectObject(object) {
            if (object == this.selectedObject)
                return;
            console.log("Selected:", object);
            const domPropertyH1 = documentElements_1.default.get("property-list-title");
            this._selectedObject = object;
            this.propertyEditor.build(object);
            domPropertyH1.innerHTML = `Propriedades do ${object.name}`;
            const followButton = Buttons.getButtonById("follow-button");
            const destroyButton = Buttons.getButtonById("destroy-button");
            followButton.enabled = object.locate;
            if (main_1.canvasRenderer.camera.objectBeingFollowed == this._selectedObject)
                followButton.swapToAltImg();
            else
                followButton.swapToDefaultImg();
            destroyButton.enabled = object.destroy != undefined && main_1.simulator.time == 0;
        }
    }
    exports.ObjectSelectionController = ObjectSelectionController;
    ObjectSelectionController._selectedObject = null;
    class Alert {
        static initialize(element) {
            this.element = element;
        }
        static throwAlert(text, style) {
            this.element.classList.replace(this.element.classList[1], style);
            this.element.querySelector("p").innerHTML = text;
            this.element.style.display = "flex";
        }
    }
    exports.Alert = Alert;
    Alert.WARNING = "alert-warning";
    Alert.ERROR = "alert-error";
    //Initialize static classes
    GraphPanel.initialize(documentElements_1.default.get("graph-panel"), Buttons.getButtonById("close-graph-panel-button"));
    Alert.initialize(documentElements_1.default.get("alert"));
    ObjectSelectionController.initialize(new propertyEditor_1.PropertyEditor(documentElements_1.default.get("property-list")));
});
