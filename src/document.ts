import Ambient from 'ambient';
import { ambient, canvasRenderer, simulator } from "main";
import PhysicsObject, { Solid } from "physicsObjects";
import PhysicsProperty from "physicsProperties";
import { propertyDescriptions } from 'propertyDescriptions';
import { CanvasRenderer } from 'rendering';
import Selectable from 'selectable';
import { ButtonColor, DocumentButtonKind, PhysicsObjectType, PhysicsPropertyType } from 'types';
import Vector2 from 'vector2';

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

    protected setButtonIdToDescendants(){
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
    constructor(parent: Element, id: string, thumbSrc: string, buttonColor: ButtonColor, onClick?: Function, title?: string) {
        super(parent, id, DocumentButtonKind.MiscButton, true, (onClick) ? onClick : null, buttonColor);

        if (title)
            this.element.setAttribute("title", title);

        const thumbImg = document.createElement("img");
        thumbImg.src = thumbSrc;

        this.element.appendChild(thumbImg);

        this.setButtonIdToDescendants();
        this.setButtonKindToDescendants();
    }
}

export class MiscTextButton extends DocumentButton {
    constructor(parent: Element, id: string, text: string, buttonColor: ButtonColor, onClick?: Function, title?: string) {
        super(parent, id, DocumentButtonKind.MiscButton, true, (onClick) ? onClick : null, buttonColor);

        this.element.innerHTML = text;
        if (title)
            this.element.setAttribute("title", title);
    }
}

export class CreateObjectButton extends DocumentButton {
    constructor(public readonly name: string, thumbSrc: string, createObject: Function) {
        super(documentElements.get("object-list")!, `create-${name}-button`, DocumentButtonKind.CreateObjectButton, true, createObject, ButtonColor.Dark);

        const parent = this.element.parentElement!;
        const li = document.createElement("li");

        li.appendChild(this.element);
        parent.appendChild(li);

        const thumbImg = document.createElement("img");
        thumbImg.src = thumbSrc;

        li.setAttribute("object-name", name);
        li.querySelectorAll("*").forEach(el => el.setAttribute("object-name", name));

        this.element.appendChild(thumbImg);

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
 * A map that contains various Elements in the application HTML document.
 */
export const documentElements = new Map<string, Element>();
documentElements.set("header", document.querySelector("#buttons-header")!);
documentElements.set("object-interactor", document.querySelector("#object-interactor")!);
documentElements.set("property-list", document.querySelector("#property-list")!);
documentElements.set("simulation-controller-buttons", document.querySelector("#simulation-controller-buttons")!);
documentElements.set("object-list", document.querySelector("#object-list")!);
documentElements.set("property-description-interface", document.querySelector("#property-description-interface")!);

/**
 * A map that contains all of the buttons that creates objects
 */
export const objectCreationButtons = new Map<PhysicsObjectType, CreateObjectButton>();
objectCreationButtons.set(PhysicsObjectType.Solid, new CreateObjectButton("Sólido", "./assets/images/dwagao.png",
    function (canvasRenderer: CanvasRenderer, ambient: Ambient) {
        new Solid(
            canvasRenderer,
            ambient,
            canvasRenderer.camera.getWorldPosFromCanvas(
                new Vector2(canvasRenderer.context.canvas.width / 2, canvasRenderer.context.canvas.height / 2)
            ),
            new Vector2(1, 1)
        )
    }
));

/**
 * A map that contains all of the buttons that do various functions on the application
 */
export const miscButtons = new Map<string, DocumentButton>();
miscButtons.set("play-button", new MiscImageButton(documentElements.get("simulation-controller-buttons")!, "play-button", "./assets/images/play.png", ButtonColor.Dark, undefined, "Iniciar simulação"));
miscButtons.set("reset-button", new MiscTextButton(documentElements.get("simulation-controller-buttons")!, "reset-button", "t=0", ButtonColor.Dark, undefined, "Definir tempo igual a 0"));
miscButtons.set("follow-button", new MiscTextButton(documentElements.get("object-interactor")!, "follow-button", "Seguir", ButtonColor.Dark));
miscButtons.set("destroy-button", new MiscTextButton(documentElements.get("object-interactor")!, "destroy-button", "Destruir", ButtonColor.Dark));
miscButtons.set("centralize-camera", new MiscImageButton(documentElements.get("header")!, "centralize-camera", "./assets/images/cameracenter.png", ButtonColor.White, undefined, "Posicionar câmera no centro do cenário"));

//Event listeners

document.addEventListener("click", e => {
    const target = (<HTMLElement>e.target);

    const id = target.getAttribute("button-id");
    let button: DocumentButton | null = null;

    switch (target.getAttribute("button-kind")) {
        case DocumentButtonKind.MiscButton:
            const miscArray = Array.from(miscButtons);
            button = miscArray.find(el => { return el[1].element.getAttribute("button-id") == id })![1];
            break;
        case DocumentButtonKind.CreateObjectButton:
            if (!ObjectCreationController.objectCreatable)
                return;

            const objectCreationArray = Array.from(objectCreationButtons);
            button = objectCreationArray.find(el => { return el[1].element.getAttribute("button-id") == id })![1];
            break;
        case DocumentButtonKind.PropertyButton:
            const propertyKind: string | null = (<HTMLDivElement>e.target)!.getAttribute("property-kind");
            if (propertyKind)
                this.onPropertyClick(parseInt(propertyKind));
            return;
    }

    if(button && button.onClick)
        button.onClick();
});

//Configuration
miscButtons.get("destory-button")!.onClick = function(){
    if (!this._selectedObject || !this._selectedObject.destroy)
            return;

        if (simulator.time != 0)
            throw "Attempted to delete object in simulation!"

        this._selectedObject.destroy();
        this.selectObject(ambient);
};
buttons.get(CurrentButtons.FollowButton)!.onClick = this.followSelectedObject.bind(this);


export abstract class old {
    private domObjectUL: HTMLUListElement = <HTMLUListElement>document.querySelector("#object-list");
    private domPropertyUL: HTMLUListElement = <HTMLUListElement>document.querySelector("#property-list");
    private domPropertyH1: HTMLHeadingElement = <HTMLHeadingElement>this.domPropertyUL.parentElement!.querySelector("h1");
    private _propertiesEnabled: boolean = true;

    private _selectedObject: Selectable | null = null;

    constructor() {
        

        objectLIs.forEach(objectLI => this.domObjectUL.appendChild(objectLI.li));
    }

    get selectedObject() {
        return this._selectedObject;
    }

    //propertiesEnabled: boolean

    get propertiesEnabled() {
        return this._propertiesEnabled;
    }

    set propertiesEnabled(value: boolean) {
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
    //Methods

    selectObject(object: Selectable): void {
        console.log(`Selected ${object.name}`);
        this._selectedObject = object;

        while (this.domPropertyUL.firstChild)
            this.domPropertyUL.removeChild(this.domPropertyUL.firstChild);
        this.domPropertyH1.innerHTML = `Propriedades do ${object.name}`;

        this.propertiesEnabled = this.propertiesEnabled;

        if (object.appendPropertyListItems)
            object.appendPropertyListItems(this.domPropertyUL, this.propertiesEnabled);

        const followButton = buttons.get(CurrentButtons.FollowButton);
        const destroyButton = buttons.get(CurrentButtons.DestroyButton);

        followButton!.enabled = object.isFollowable;
        followButton!.element.innerHTML = (canvasRenderer.camera.objectBeingFollowed != this._selectedObject) ? "Seguir" : "Parar de seguir";

        destroyButton!.enabled = object.destroy != undefined && simulator.time == 0;
    }

    private destroySelectedObject(): void {
        
    }

    private followSelectedObject(): void {
        if (!this._selectedObject || !this._selectedObject.isFollowable)
            return;

        const camera = canvasRenderer.camera;

        if (camera.objectBeingFollowed != this._selectedObject)
            camera.followObject(<PhysicsObject>this._selectedObject);
        else
            camera.unfollowObject();
    }

    private onDocumentButtonClick(buttonName: string) {
        const buttonsArray = Array.from(buttons);
        const button: DocumentButton = buttonsArray.find(el => { return el[1].element.getAttribute("button-name") == buttonName })![1];
        if (button.onClick)
            button.onClick();
    }

    private onPropertyClick(propertyKind: PhysicsPropertyType) {
        PropertyDescriptionInterface.show(propertyKind);
    }
}

