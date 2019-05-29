interface Selectable {
    isFollowable: boolean;
    name: string;
    appendPropertyListItems(ul: HTMLUListElement, enabled: boolean): void;
    getObjectProperties(): PhysicsProperty<any>[];
    destroy?(): void;
}

class DocumentUI {
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
        
        new DocumentButton(this, "#reset-button", false, null, "dark-button");
        new DocumentButton(this, "#follow-button", false, this.followSelectedObject.bind(this), "dark-button");
        new DocumentButton(this, "#destroy-button", false, this.destroySelectedObject.bind(this), "dark-button");
        new DocumentButton(this, "#play-button", true, null, "dark-button");
        new DocumentButton(this, "#centralize-camera", true, System.canvasRenderer.camera.centralize.bind(System.canvasRenderer.camera), "white-button");
        
        this.domObjectUL.addEventListener("click", e => this.createObject(e));
        document.addEventListener("click", e => {
            const buttonName: string | null = (<HTMLDivElement>e.target)!.getAttribute("button-name");
            if (!buttonName)
                return;

            const button = this.buttons.filter(el => { return el.element.getAttribute("button-name") == buttonName })[0];
            if (button.onClick)
                button.onClick();
        });

        ObjectLI.objectLIs.forEach(objectLI => {
            this.domObjectUL.appendChild(objectLI.li);
        });
    }

    get selectedObject(){
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

    private createObject(e: Event): void {
        if (!this.objectCreatable)
            return;

        const objectType = (<HTMLDivElement>e.target)!.getAttribute("object-name");
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

    private followSelectedObject(): void{
        const selectedObj = <Selectable>this._selectedObject;
        if(!selectedObj || selectedObj.isFollowable)
            return;

        const camera = System.canvasRenderer.camera;

        if(camera.objectBeingFollowed != this._selectedObject)
            camera.followObject(<PhysicsObject>this._selectedObject);
        else
            camera.unfollowObject();
    }

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
}