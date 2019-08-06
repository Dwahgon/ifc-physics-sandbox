console.log("Loading document");

import * as Buttons from "./buttons";
import { Graph } from "./graph";
import { canvasRenderer, simulator } from "./main";
import PhysicsProperty from "./physicsProperties";
import { propertyDescriptions } from './propertyDescriptions';
import { CanvasRenderer, CartesianPlane } from "./rendering";
import { PhysicsPropertyType, Selectable } from './types';
import Vector2 from "./vector2";

export abstract class PropertyDescriptionUI {
    private static readonly element: HTMLDivElement = <HTMLDivElement>document.querySelector("#property-description-modal");

    private static setElementVisible(isVisible: boolean): void {
        this.element.style.display = (isVisible) ? "flex" : "none";
    }

    static show(propertyKind: PhysicsPropertyType): void {
        this.setElementVisible(true);

        const description = propertyDescriptions.get(propertyKind);

        if (description)
            this.element.querySelector("article")!.innerHTML = description;
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

    static initialize() {
        this.panel = <HTMLDivElement>documentElements.get("graph-panel")!;
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
    private static _selectedObject: Selectable | null = null;
    private static _propertiesEnabled: boolean = true;

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
        console.log("Selected:", object);
        const domPropertyUL = <HTMLUListElement>documentElements.get("property-list")!;
        const domPropertyH1 = documentElements.get("property-list-title")!;

        this._selectedObject = object;

        while (domPropertyUL.firstChild)
            domPropertyUL.removeChild(domPropertyUL.firstChild);

        domPropertyH1.innerHTML = `Propriedades do ${object.name}`;

        if (object.appendPropertyListItems)
            object.appendPropertyListItems(domPropertyUL, this.propertiesEnabled);

        domPropertyUL.style.display = domPropertyUL.childElementCount > 0 ? "block" : "none";

        const followButton = Buttons.getButtonById("follow-button")!;
        const destroyButton = Buttons.getButtonById("destroy-button")!;

        followButton.enabled = object.isFollowable;
        if (canvasRenderer.camera.objectBeingFollowed == this._selectedObject)
            followButton.swapToAltImg();
        else
            followButton.swapToDefaultImg();

        destroyButton!.enabled = object.destroy != undefined && simulator.time == 0;
    }

    static get propertiesEnabled() {
        return this._propertiesEnabled;
    }

    static set propertiesEnabled(value: boolean) {
        if (!this._selectedObject)
            return

        this._propertiesEnabled = value;


        const physicsProperties = <PhysicsProperty<any>[]>this._selectedObject.getProperty(PhysicsPropertyType.All);

        if (physicsProperties) {
            physicsProperties.forEach(objectProperty => {
                if (objectProperty.propertyLI)
                    objectProperty.propertyLI.enabled = value;
            });
        }
    }
}

/**
 * A map that contains various Elements in the application HTML document.
 */
export const documentElements = new Map<string, Element>();
documentElements.set("header", document.querySelector("#buttons-header")!);
documentElements.set("file-buttons", documentElements.get("header")!.querySelector("#header-file-buttons")!);
documentElements.set("camera-buttons", documentElements.get("header")!.querySelector("#header-camera-buttons")!);
documentElements.set("graph-buttons", documentElements.get("header")!.querySelector("#header-graph-buttons")!);
documentElements.set("property-panel", document.querySelector("#property-side-panel")!);
documentElements.set("object-interactor", document.querySelector("#object-interactor")!);
documentElements.set("property-list-title", documentElements.get("property-panel")!.querySelector("h1")!);
documentElements.set("property-list", document.querySelector("#property-list")!);
documentElements.set("simulation-controller-buttons", document.querySelector("#simulation-controller-buttons")!);
documentElements.set("object-list", document.querySelector("#object-list")!);
documentElements.set("graph-config-form", document.querySelector("#graph-config-form")!);
documentElements.set("graph-panel", document.querySelector("#graph-panel")!);
GraphPanel.initialize();