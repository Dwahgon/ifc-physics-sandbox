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
    constructor(documentUI: DocumentUI, selector: string, enabled: boolean, public onClick: Function | null, private buttonColor: string){
        super(selector, enabled);

        const attributeValue = this.element.getAttribute("id");
        this.element.setAttribute("button-name", attributeValue!);
        this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-name", attributeValue!));

        documentUI.buttons.push(this);
    }

    get enabled(){
        return this._enabled;
    }

    set enabled(value: boolean){
        this._enabled = value;
        this.element.setAttribute("class", (value) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
    }
}