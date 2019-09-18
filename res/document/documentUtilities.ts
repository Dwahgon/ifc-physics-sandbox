console.log("Loading document");

import { canvasRenderer, simulator } from "../main";
import propertyDescriptions from '../propertyDescriptions';
import { CanvasRenderer } from "../rendering/canvasRenderer";
import { CartesianPlane } from "../rendering/cartesianPlane";
import { Graph } from "../rendering/graph";
import { PhysicsPropertyType, Selectable } from '../types';
import Vector2 from "../vector2";
import * as Buttons from "./buttons";
import documentElements from "./documentElements";
import * as Modals from "./modals";
import { PropertyEditor } from "./propertyEditor";

export abstract class PropertyDescriptionUI {
    private static readonly modal: Modals.Modal = Modals.getModalById("property-description-modal")!;

    private static setElementVisible(isVisible: boolean): void {
        this.modal.setVisible(isVisible);
    }

    static show(propertyKind: PhysicsPropertyType): void {
        this.setElementVisible(true);

        const description = propertyDescriptions.get(propertyKind);

        if (description)
            this.modal.element.querySelector("article")!.innerHTML = description;
        else
            this.hide();
    }

    static hide(): void {
        this.setElementVisible(false);
    }
}

export abstract class GraphPanel {
    public static onClose: Function | null;
    private static panel: HTMLDivElement;
    private static title: HTMLHeadingElement;
    private static canvasRenderer: CanvasRenderer;
    private static cartesianPlane: CartesianPlane;
    private static graph: Graph | null;

    static initialize(element: HTMLDivElement) {
        this.panel = element!;
        this.title = this.panel.querySelector("h1")!;

        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        this.panel.querySelector(".panel-content")!.appendChild(canvas);

        this.canvasRenderer = new CanvasRenderer(canvas.getContext("2d")!);
        this.canvasRenderer.camera.pos = new Vector2(150, 150);
        this.cartesianPlane = new CartesianPlane(1);
        this.canvasRenderer.add(this.cartesianPlane);
    }

    static setElementVisible(v: boolean, title: string = "Gráfico") {
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

    static renderGraph(graph: Graph) {
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

/**
 * Class that controls if the CreateObjectButtons are enabled or not
 */
export abstract class ObjectCreationController {
    private static _objectCreatable: boolean = true;
    private static objectListElement: Element | null = null;

    public static set objectCreatable(value: boolean) {
        this._objectCreatable = value;

        if (!this.objectListElement)
            this.objectListElement = documentElements.get("object-list")!;

        this.objectListElement.querySelectorAll("button").forEach(element => Buttons.getButtonByHTMLElement(element)!.enabled = value);
    }

    public static get objectCreatable() {
        return this._objectCreatable;
    }
}

/**
 * Controlls the selection of Selectable objects
 */
export abstract class ObjectSelectionController {
    public static propertyEditor: PropertyEditor | null;
    private static _selectedObject: Selectable | null = null;

    static initialize(propertyEditor: PropertyEditor) {
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
    static selectObject(object: Selectable): void {
        if (object == this.selectedObject)
            return;

        console.log("Selected:", object);
        const domPropertyH1 = documentElements.get("property-list-title")!;

        this._selectedObject = object;
        this.propertyEditor!.build(object);

        domPropertyH1.innerHTML = `Propriedades do ${object.name}`;

        const followButton = Buttons.getButtonById("follow-button")!;
        const destroyButton = Buttons.getButtonById("destroy-button")!;

        followButton.enabled = (<any>object).locate;
        if (canvasRenderer.camera.objectBeingFollowed == <any>this._selectedObject)
            followButton.swapToAltImg();
        else
            followButton.swapToDefaultImg();

        destroyButton!.enabled = object.destroy != undefined && simulator.time == 0;
    }
}

export abstract class Alert {
    public static readonly WARNING: string = "alert-warning";
    public static readonly ERROR: string = "alert-error";

    private static element: HTMLDivElement;

    static initialize(element: HTMLDivElement) {
        this.element = element;
    }

    static throwAlert(text: string, style: string) {
        this.element.classList.replace(this.element.classList[1], style);
        this.element.querySelector("p")!.innerHTML = text;
        this.element.style.display = "flex";
    }
}



//Initialize static classes

GraphPanel.initialize(<HTMLDivElement>documentElements.get("graph-panel")!);
Alert.initialize(<HTMLDivElement>documentElements.get("alert")!);
ObjectSelectionController.initialize(new PropertyEditor(<HTMLElement>documentElements.get("property-list")));