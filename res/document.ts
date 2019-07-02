import { ambient, canvasRenderer, simulator, setAmbient } from "./main";
import { PhysicsObject, PhysicsObjectConfig } from "./physicsObjects";
import PhysicsProperty from "./physicsProperties";
import { propertyDescriptions } from './propertyDescriptions';
import Selectable from './selectable';
import { ButtonColor, DocumentButtonKind, PhysicsObjectType, PhysicsPropertyType } from './types';
import Vector2 from './vector2';
import { CanvasRenderer } from "./rendering";
import Ambient from "./ambient";

export class DocumentButton {
    public readonly element: HTMLButtonElement;

    constructor(parent: Element, public readonly id: string, public readonly kind: DocumentButtonKind, protected _enabled: boolean, public onClick: Function | null, private buttonColor: ButtonColor) {
        this.element = document.createElement("button");

        parent.appendChild(this.element);

        this.element.setAttribute("id", id);
        this.element.setAttribute("class", (this._enabled) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);

        this.setButtonKindToDescendants();
    }

    protected setButtonKindToDescendants() {
        this.element.setAttribute("button-kind", this.kind);
        this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-kind", this.kind));
    }

    protected setButtonIdToDescendants() {
        this.element.setAttribute("button-id", this.id);
        this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-id", this.id));
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        this.element.setAttribute("class", (value) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
    }
}

export class MiscImageButton extends DocumentButton {
    protected thumbImgElement: HTMLImageElement;

    constructor(parent: Element, id: string, protected thumbSrc: string, buttonColor: ButtonColor, title?: string) {
        super(parent, id, DocumentButtonKind.MiscButton, true, null, buttonColor);

        if (title)
            this.element.setAttribute("title", title);

        this.thumbImgElement = document.createElement("img");
        this.thumbImgElement.src = thumbSrc;

        this.element.appendChild(this.thumbImgElement);

        this.setButtonIdToDescendants();
        this.setButtonKindToDescendants();
    }
}

/**
 * A child class of @class MiscImageButton that contains two states: toggled and non-toggled. When it's non-toggled, it will display the thumbImg and the originalTitle,
 * but when it's toggled, it will display the toggledThumbImg and the toggledTitle. If toggleTitle is not specified, the button's title will always be the originalTitle.
 */
export class MiscToggleImageButton extends MiscImageButton {
    constructor(parent: Element, id: string, thumbSrc: string, private toggledThumbSrc: string, buttonColor: ButtonColor, private originalTitle?: string, private toggledTitle?: string){
        super(parent, id, thumbSrc, buttonColor, originalTitle);
    }

    set toggled(t: boolean){
        this.thumbImgElement.src = t ? this.toggledThumbSrc : this.thumbSrc;

        if(this.originalTitle)
            this.element.setAttribute("title", t && this.toggledTitle ? this.toggledTitle : this.originalTitle);
    }
}

export class MiscTextButton extends DocumentButton {
    constructor(parent: Element, id: string, text: string, buttonColor: ButtonColor, title?: string) {
        super(parent, id, DocumentButtonKind.MiscButton, true,  null, buttonColor);

        this.element.innerHTML = text;
        if (title)
            this.element.setAttribute("title", title);

        this.setButtonIdToDescendants();
        this.setButtonKindToDescendants();
    }
}

export class CreateObjectButton extends DocumentButton {
    constructor(public readonly name: string, thumbSrc: string, public readonly createObjectConfig: Function) {
        super(
            documentElements.get("object-list")!, 
            `create-${name}-button`, 
            DocumentButtonKind.CreateObjectButton, 
            true, 
            function (t: PhysicsObjectType, cR: CanvasRenderer, a: Ambient, c: PhysicsObjectConfig) { PhysicsObject.createPhysicsObject(t, cR, a, c) }, 
            ButtonColor.Dark
        );

        const parent = this.element.parentElement!;
        const li = document.createElement("li");
        const thumbImg = document.createElement("img");

        li.setAttribute("title", `Criar um ${name.toLowerCase()}`);

        thumbImg.src = thumbSrc;

        this.element.appendChild(thumbImg);
        parent.appendChild(li);
        li.appendChild(this.element);

        this.setButtonIdToDescendants();
        this.setButtonKindToDescendants();
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this.element.setAttribute("class", (!value) ? "dark-button inactive-button" : "dark-button button");
    }
}

export abstract class PropertyDescriptionUI {
    private static readonly element: HTMLDivElement = <HTMLDivElement>document.querySelector("#property-description-interface");

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

/**
 * Class that controls if the CreateObjectButtons are enabled or not
 */
export abstract class ObjectCreationController {
    private static _objectCreatable: boolean = true;

    public static set objectCreatable(value: boolean) {
        this._objectCreatable = value;
        objectCreationButtons.forEach(button => button.enabled = value)
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

        this.propertiesEnabled = this.propertiesEnabled;

        if (object.appendPropertyListItems)
            object.appendPropertyListItems(domPropertyUL, this.propertiesEnabled);

        const followButton = <MiscToggleImageButton>miscButtons.get("follow-button");
        const destroyButton = miscButtons.get("destroy-button");

        followButton.enabled = object.isFollowable;
        followButton.toggled = canvasRenderer.camera.objectBeingFollowed == this._selectedObject;

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
documentElements.set("property-panel", document.querySelector(".side-panel:first-child > div")!);
documentElements.set("object-interactor", document.querySelector("#object-interactor")!);
documentElements.set("property-list-title", documentElements.get("property-panel")!.querySelector("h1")!);
documentElements.set("property-list", document.querySelector("#property-list")!);
documentElements.set("simulation-controller-buttons", document.querySelector("#simulation-controller-buttons")!);
documentElements.set("object-list", document.querySelector("#object-list")!);
documentElements.set("property-description-interface", document.querySelector("#property-description-interface")!);
documentElements.set("property-description-header", documentElements.get("property-description-interface")!.querySelector("header")!);

/**
 * A map that contains all of the buttons that creates objects
 */
export const objectCreationButtons = new Map<PhysicsObjectType, CreateObjectButton>();
objectCreationButtons.set(PhysicsObjectType.Solid, new CreateObjectButton("Sólido", "./assets/images/solid.png",
    function () {
        return {
            position: canvasRenderer.camera.getWorldPosFromCanvas(
                new Vector2(canvasRenderer.context.canvas.width / 2, canvasRenderer.context.canvas.height / 2)
            ),
            size: new Vector2(1, 1)
        }
    }
));

/**
 * A map that contains all of the buttons that do various functions on the application.
 * @method get Gets a button. Current buttons: play-button, reset-button, follow-button, destroy-button, centralize-camera, close-property-description, new-button, save-button, load-button
 */
export const miscButtons = new Map<string, DocumentButton>();
miscButtons.set("play-button", new MiscImageButton(documentElements.get("simulation-controller-buttons")!, "play-button", "./assets/images/play.png", ButtonColor.Dark, "Iniciar simulação"));
miscButtons.set("reset-button", new MiscTextButton(documentElements.get("simulation-controller-buttons")!, "reset-button", "t=0", ButtonColor.Dark, "Definir tempo igual a 0"));
miscButtons.set("destroy-button", new MiscImageButton(documentElements.get("object-interactor")!, "destroy-button", "./assets/images/delete.png", ButtonColor.Dark, "Destruir objecto"));
miscButtons.set("follow-button", new MiscToggleImageButton(documentElements.get("object-interactor")!, "follow-button", "./assets/images/follow.png", "./assets/images/cancelfollow.png", ButtonColor.Dark, "Focar/seguir objeto", "Parar de focar/seguir objeto"));
miscButtons.set("centralize-camera", new MiscImageButton(documentElements.get("camera-buttons")!, "centralize-camera", "./assets/images/cameracenter.png", ButtonColor.InvisibleBackground, "Posicionar câmera na origem"));
miscButtons.set("close-property-description", new MiscImageButton(documentElements.get("property-description-header")!, "close-property-description", "./assets/images/closeicon.png", ButtonColor.White));
miscButtons.set("new-button", new MiscImageButton(documentElements.get("file-buttons")!, "new-button", "./assets/images/newfile.png", ButtonColor.InvisibleBackground, "Novo ambiente"));
miscButtons.set("save-button", new MiscImageButton(documentElements.get("file-buttons")!, "save-button", "./assets/images/save.png", ButtonColor.InvisibleBackground, "Salvar ambiente"));
miscButtons.set("load-button", new MiscImageButton(documentElements.get("file-buttons")!, "load-button", "./assets/images/load.png", ButtonColor.InvisibleBackground, "Abrir ambiente"));

//Event listeners
document.addEventListener("click", e => {
    const target = (<HTMLElement>e.target);
    const buttonId = target.getAttribute("button-id");

    switch (target.getAttribute("button-kind")) {
        case DocumentButtonKind.MiscButton:
            const button = miscButtons.get(buttonId!);
            if (button && button.onClick)
                button.onClick();

            break;
        case DocumentButtonKind.CreateObjectButton:
            if (!ObjectCreationController.objectCreatable)
                return;

            const objectCreationArray = Array.from(objectCreationButtons);
            const objectPair = objectCreationArray.find(el => { return el[1].element.getAttribute("button-id") == buttonId })!;
            const objectKind = objectPair[0];
            const objectButton = objectPair[1];

            objectButton.onClick!(objectKind, canvasRenderer, ambient, objectButton.createObjectConfig());
            break;
        case DocumentButtonKind.PropertyButton:
            const propertyKind: string | null = (<HTMLDivElement>e.target)!.getAttribute("property-kind");
            if (propertyKind)
                PropertyDescriptionUI.show(parseInt(propertyKind));
            return;
    }


});

//Configuration
miscButtons.get("destroy-button")!.onClick = function () {
    const selectedObject = ObjectSelectionController.selectedObject;
    if (!selectedObject || !selectedObject.destroy || simulator.time != 0)
        return;

    selectedObject.destroy();
    ObjectSelectionController.selectObject(ambient);
};

miscButtons.get("follow-button")!.onClick = function () {
    const selectedObject = ObjectSelectionController.selectedObject;
    if (!selectedObject || !selectedObject.isFollowable)
        return;

    const camera = canvasRenderer.camera;

    if (camera.objectBeingFollowed != selectedObject)
        camera.followObject(<PhysicsObject>selectedObject);
    else
        camera.unfollowObject();
}

miscButtons.get("close-property-description")!.onClick = PropertyDescriptionUI.hide.bind(PropertyDescriptionUI);
