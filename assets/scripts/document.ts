import {canvasRenderer, simulator, ambient} from "main";
import {PhysicsPropertyType, PhysicsObjectType, CurrentButtons} from 'types';
import {CanvasRenderer} from 'rendering';
import Ambient from 'ambient';
import {Solid} from 'physicsObjects';
import PhysicsProperty from "physicsProperties";
import PhysicsObject from "physicsObjects";
import Selectable from 'selectable';
import ObjectLI from 'objectLI';
import Vector2 from 'vector2';
import {propertyDescriptions} from 'propertyDescriptions';

export class DocumentElement<T extends HTMLElement>{
    public readonly element: T;
    protected _enabled: boolean;

    constructor(selector: string, enabled: boolean){
        const query = document.querySelector(selector);
        if(!query)
            throw `Couldn't query select ${selector}`;
        
        this.element = <T>query;
        this._enabled = enabled;
    }
}

export class DocumentButton extends DocumentElement<HTMLButtonElement>{
    constructor(selector: string, enabled: boolean, public onClick: Function | null, private buttonColor: string){
        super(selector, enabled);

        const attributeValue = this.element.getAttribute("id");
        this.element.setAttribute("button-name", attributeValue!);
        this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-name", attributeValue!));
    }

    get enabled(){
        return this._enabled;
    }

    set enabled(value: boolean){
        this._enabled = value;
        this.element.setAttribute("class", (value) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
    }
}

export const buttons : Map<CurrentButtons, DocumentButton> = new Map<CurrentButtons, DocumentButton>();
buttons.set(CurrentButtons.ResetButton, new DocumentButton("#reset-button", false, null, "dark-button"));
buttons.set(CurrentButtons.FollowButton, new DocumentButton("#follow-button", false, null, "dark-button"));
buttons.set(CurrentButtons.DestroyButton, new DocumentButton("#destroy-button", false, null, "dark-button"));
buttons.set(CurrentButtons.PlayButton, new DocumentButton("#play-button", true, null, "dark-button"));
buttons.set(CurrentButtons.CentralizeCamera, new DocumentButton("#centralize-camera", true, null, "white-button"));

export const objectLIs : Map<PhysicsObjectType, ObjectLI> = new Map<PhysicsObjectType, ObjectLI>();
objectLIs.set(PhysicsObjectType.Solid, new ObjectLI("Sólido", "./assets/images/dwagao.png", 
    function(canvasRenderer: CanvasRenderer, ambient: Ambient){
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

export abstract class PropertyDescriptionInterface{
    private static readonly element: HTMLDivElement = <HTMLDivElement>document.querySelector("#property-description-interface");

    private static setElementVisible(isVisible: boolean): void{
        PropertyDescriptionInterface.element.style.display = (isVisible) ? "flex" : "none"; 
    }

    static show(propertyKind: PhysicsPropertyType): void{
        this.setElementVisible(true);

        const description = propertyDescriptions.get(propertyKind);

        if(description)
            this.element.querySelector("article")!.innerHTML = description;
        else
            this.hide();
        
    }

    static hide(): void{
        this.setElementVisible(false);
    }
}

export default class DocumentUI {
    private domObjectUL: HTMLUListElement;
    private domPropertyUL: HTMLUListElement;
    private domPropertyH1: HTMLHeadingElement;
    private _propertiesEnabled: boolean;
    private _objectCreatable: boolean;

    private _selectedObject: Selectable | null;

    constructor() {
        this.domObjectUL = <HTMLUListElement>document.querySelector("#object-list");
        this.domPropertyUL = <HTMLUListElement>document.querySelector("#property-list");
        this.domPropertyH1 = <HTMLHeadingElement>this.domPropertyUL.parentElement!.querySelector("h1");

        if (!this.domObjectUL || !this.domPropertyUL || !this.domPropertyH1)
            throw "Some elements are missing!";

        this._propertiesEnabled = true;
        this._objectCreatable = true;
        this._selectedObject = null;


        buttons.get(CurrentButtons.DestroyButton)!.onClick = this.destroySelectedObject.bind(this);
        buttons.get(CurrentButtons.FollowButton)!.onClick = this.followSelectedObject.bind(this);

        this.domObjectUL.addEventListener("click", e => this.createObject(e));
        document.addEventListener("click", e => {
            const buttonName: string | null = (<HTMLDivElement>e.target)!.getAttribute("button-name");
            if (buttonName){
                this.onDocumentButtonClick(buttonName);
                return;
            }

            const propertyKind: string | null = (<HTMLDivElement>e.target)!.getAttribute("property-kind");
            if (propertyKind)
                this.onPropertyClick(parseInt(propertyKind));
        });

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
        if(!this._selectedObject)
            return
            
        this._propertiesEnabled = value;
        
        
        const physicsProperties = <PhysicsProperty<any>[]>this._selectedObject.getProperty(PhysicsPropertyType.All);
        
        if(physicsProperties){
            physicsProperties.forEach(objectProperty => {
                if (objectProperty.propertyLI)
                    objectProperty.propertyLI.enabled = value;
            });
        }
    }

    //objectCreatable: boolean

    set objectCreatable(value: boolean) {
        this._objectCreatable = value;
        objectLIs.forEach(objectLI => objectLI.enabled = value)
    }

    get objectCreatable() {
        return this._objectCreatable;
    }

    //Methods

    selectObject(object: Selectable): void {
        console.log(`Selected ${object.name}`);
        this._selectedObject = object;

        while (this.domPropertyUL.firstChild)
            this.domPropertyUL.removeChild(this.domPropertyUL.firstChild);


        this.domPropertyH1.innerHTML = `Propriedades do ${object.name}`;
        object.appendPropertyListItems(this.domPropertyUL, this.propertiesEnabled);
        this.propertiesEnabled = this.propertiesEnabled;

        const followButton = buttons.get(CurrentButtons.FollowButton);
        const destroyButton = buttons.get(CurrentButtons.DestroyButton);

        followButton!.enabled = object.isFollowable;
        followButton!.element.innerHTML = (canvasRenderer.camera.objectBeingFollowed != this._selectedObject) ? "Seguir" : "Parar de seguir";

        destroyButton!.enabled = object.destroy != undefined && simulator.time == 0;
    }
    
    private createObject(e: Event): void {
        if (!this.objectCreatable)
            return;

        const objectType = (<HTMLDivElement>e.target).getAttribute("object-name");
        if (!objectType)
            return;

        objectLIs.forEach(objectLI => {
            if (objectLI.name == objectType)
                objectLI.createObject(canvasRenderer, ambient);
        })
    }


    private destroySelectedObject(): void {
        if (!this._selectedObject || !this._selectedObject.destroy)
            return;

        if (simulator.time != 0)
            throw "Attempted to delete object in simulation!"

        this._selectedObject.destroy();
        this.selectObject(ambient);
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

    private onDocumentButtonClick(buttonName: string){
        const buttonsArray = Array.from(buttons);
        const button: DocumentButton = buttonsArray.find(el => { return el[1].element.getAttribute("button-name") == buttonName })![1];
        if (button.onClick)
            button.onClick();
    }

    private onPropertyClick(propertyKind: PhysicsPropertyType){
        PropertyDescriptionInterface.show(propertyKind);
    }
}