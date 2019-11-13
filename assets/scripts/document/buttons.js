define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loaded buttons");
    const buttons = [];
    /*
        Class Definitions
    */
    class Button {
        constructor(element) {
            this.element = element;
            this._enabled = element.classList.contains("active-button");
            this.onClick = null;
            this.defaultTitle = element.getAttribute("title");
            this.altTitle = element.getAttribute("alt-title");
            const imgElement = element.querySelector("img");
            if (imgElement) {
                this.imgElement = imgElement;
                this.defaultImgSrc = imgElement.getAttribute("src");
            }
            else {
                this.imgElement = null;
                this.defaultImgSrc = null;
            }
            this.altImgSrc = element.getAttribute("alt-img");
            this.buttonName = element.id;
            element.setAttribute("button-name", this.buttonName);
            element.querySelectorAll("*").forEach((element) => element.setAttribute("button-name", this.buttonName));
            buttons.push(this);
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this.element.classList.replace(this._enabled ? "active-button" : "inactive-button", //old token
            value ? "active-button" : "inactive-button" //new token
            );
            this._enabled = value;
        }
        static createButtonElement(buttonConfig) {
            const button = document.createElement("button");
            buttonConfig.buttonName = buttonConfig.buttonName.replace(" ", "-").toLowerCase();
            button.setAttribute("id", buttonConfig.buttonName);
            button.setAttribute("class", `${buttonConfig.buttonColor} ${buttonConfig.enabled ? "active-button" : "inactive-button"}`);
            button.setAttribute("button-name", buttonConfig.buttonName);
            if (buttonConfig.func)
                button.setAttribute("func", buttonConfig.func);
            if (buttonConfig.args)
                button.setAttribute("args", buttonConfig.args);
            if (buttonConfig.title)
                button.setAttribute("title", buttonConfig.title);
            if (buttonConfig.altTitle)
                button.setAttribute("alt-title", buttonConfig.altTitle);
            if (buttonConfig.imgSrc) {
                const imgElement = document.createElement("img");
                imgElement.src = buttonConfig.imgSrc;
                button.appendChild(imgElement);
            }
            if (buttonConfig.altImgSrc)
                button.setAttribute("alt-img", buttonConfig.altImgSrc);
            button.querySelectorAll("*").forEach(element => element.setAttribute("button-name", buttonConfig.buttonName));
            return button;
        }
        swapToAltImg() {
            this.swapImg(this.altImgSrc);
        }
        swapToDefaultImg() {
            this.swapImg(this.defaultImgSrc);
        }
        swapToDefaultTitle() {
            this.setTitle(this.defaultTitle);
        }
        swapToAltTitle() {
            this.setTitle(this.altTitle);
        }
        click() {
            if (this.onClick && this.enabled)
                this.onClick();
        }
        swapImg(src) {
            if (this.imgElement && src)
                this.imgElement.setAttribute("src", src);
        }
        setTitle(title) {
            if (title)
                this.element.setAttribute("title", title);
        }
    }
    exports.Button = Button;
    /*
        Query Buttons
    */
    document.querySelectorAll("button").forEach(element => new Button(element));
    /*
        Export functions
    */
    exports.getButtonById = (id) => {
        return buttons.find(button => { return button.element.id == id; });
    };
    exports.getButtonByHTMLElement = (element) => {
        return buttons.find(button => { return button.element == element; });
    };
    exports.pushButtonElement = (element) => {
        if (!exports.getButtonByHTMLElement(element))
            buttons.push(new Button(element));
    };
    exports.removeButtonElement = (element) => {
        const btn = exports.getButtonByHTMLElement(element);
        if (btn)
            buttons.splice(buttons.indexOf(btn));
    };
    /*
        Predefined onClick functions
    */
    exports.predefinedClickEvents = new Map();
    /*
        Click event
    */
    document.addEventListener("click", ev => {
        const target = ev.target;
        if (!target || !target.getAttribute("button-name"))
            return;
        const buttonObject = exports.getButtonById(target.getAttribute("button-name"));
        const buttonElement = document.querySelector(`button#${target.getAttribute("button-name")}`);
        if (buttonObject && buttonObject.onClick)
            buttonObject.click();
        if (buttonElement && buttonElement.getAttribute("func")) {
            const func = exports.predefinedClickEvents.get(buttonElement.getAttribute("func"));
            if (func)
                func(buttonElement.getAttribute("args"));
        }
    });
});
