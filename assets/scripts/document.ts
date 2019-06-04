class DocumentElement<T extends HTMLElement>{
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

class DocumentButton extends DocumentElement<HTMLButtonElement>{
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

export const buttons = [
    new DocumentButton("#reset-button", false, null, "dark-button"),
    new DocumentButton("#follow-button", false, this.followSelectedObject.bind(this), "dark-button"),
    new DocumentButton("#destroy-button", false, this.destroySelectedObject.bind(this), "dark-button"),
    new DocumentButton("#play-button", true, null, "dark-button"),
    new DocumentButton("#centralize-camera", true, System.canvasRenderer.camera.centralize.bind(System.canvasRenderer.camera), "white-button")
];


export default class DocumentUI {
    public readonly buttons: DocumentButton[];

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

        this.buttons = [];
        this._propertiesEnabled = true;
        this._objectCreatable = true;
        this._selectedObject = null;

        this.domObjectUL.addEventListener("click", e => this.createObject(e));
        document.addEventListener("click", e => {
            const buttonName: string | null = (<HTMLDivElement>e.target)!.getAttribute("button-name");
            if (buttonName){
                this.onDocumentButtonClick(buttonName);
                return;
            }

            const propertyName: string | null = (<HTMLDivElement>e.target)!.getAttribute("property-name");
            if (propertyName) {
                this.
            }
            
        });

        ObjectLI.objectLIs.forEach(objectLI => {
            this.domObjectUL.appendChild(objectLI.li);
        });
    }

    get selectedObject() {
        return this._selectedObject;
    }

    //propertiesEnabled: boolean

    get propertiesEnabled() {
        return this._propertiesEnabled;
    }

    set propertiesEnabled(value: boolean) {
        const selectedObj = <Selectable>this._selectedObject;
        this._propertiesEnabled = value;

        if (this._selectedObject && selectedObj.getObjectProperties) {
            selectedObj.getObjectProperties().forEach(objectProperty => {
                if (objectProperty.propertyLI)
                    objectProperty.propertyLI.enabled = value;
            });
        }
    }

    //objectCreatable: boolean

    set objectCreatable(value: boolean) {
        this._objectCreatable = value;
        ObjectLI.objectLIs.forEach(objectLI => objectLI.enabled = value)
    }

    get objectCreatable() {
        return this._objectCreatable;
    }

    //Methods

    getButton(buttonId: string): DocumentButton {
        return this.buttons.filter(el => { return el.element.getAttribute("id") == buttonId })[0];
    }

    selectObject(object: Selectable): void {
        console.log(`Selected ${object.name}`);
        this._selectedObject = object;

        while (this.domPropertyUL.firstChild)
            this.domPropertyUL.removeChild(this.domPropertyUL.firstChild);


        this.domPropertyH1.innerHTML = `Propriedades do ${object.name}`;
        object.appendPropertyListItems(this.domPropertyUL, this.propertiesEnabled);
        this.propertiesEnabled = this.propertiesEnabled;

        const followButton = this.getButton("follow-button");
        const destroyButton = this.getButton("destroy-button");

        followButton.enabled = object.isFollowable;
        followButton.element.innerHTML = (System.canvasRenderer.camera.objectBeingFollowed != this._selectedObject) ? "Seguir" : "Parar de seguir";

        destroyButton.enabled = object.destroy != undefined && System.simulator.time == 0;
    }
    
    private createObject(e: Event): void {
        if (!this.objectCreatable)
            return;

        const objectType = (<HTMLDivElement>e.target).getAttribute("object-name");
        if (!objectType)
            return;

        ObjectLI.objectLIs.forEach(objectLI => {
            if (objectLI.name == objectType)
                objectLI.createObject(System.canvasRenderer, System.ambient);
        })
    }


    private destroySelectedObject(): void {
        if (!this._selectedObject || !this._selectedObject.destroy)
            return;

        if (System.simulator.time != 0)
            throw "Attempted to delete object in simulation!"

        this._selectedObject.destroy();
        this.selectObject(System.ambient);
    }

    private followSelectedObject(): void {
        const selectedObj = <Selectable>this._selectedObject;
        if (!selectedObj || selectedObj.isFollowable)
            return;

        const camera = System.canvasRenderer.camera;

        if (camera.objectBeingFollowed != this._selectedObject)
            camera.followObject(<PhysicsObject>this._selectedObject);
        else
            camera.unfollowObject();
    }

    private onDocumentButtonClick(buttonName: string){
        const button = this.buttons.filter(el => { return el.element.getAttribute("button-name") == buttonName })[0];
        if (button.onClick)
            button.onClick();
    }

    private onPropertyClick(propertyName: string){
        if(!this._selectedObject)
            throw "There's no selected object";

        const physicsProperty = this._selectedObject.getObjectProperties().find(el => {return el.name == propertyName});
        if(!physicsProperty){

        }
    }
}