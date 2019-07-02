var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./main", "./physicsObjects", "./propertyDescriptions", "./types", "./vector2"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const main_1 = require("./main");
    const physicsObjects_1 = require("./physicsObjects");
    const propertyDescriptions_1 = require("./propertyDescriptions");
    const types_1 = require("./types");
    const vector2_1 = __importDefault(require("./vector2"));
    class DocumentButton {
        constructor(parent, id, kind, _enabled, onClick, buttonColor) {
            this.id = id;
            this.kind = kind;
            this._enabled = _enabled;
            this.onClick = onClick;
            this.buttonColor = buttonColor;
            this.element = document.createElement("button");
            parent.appendChild(this.element);
            this.element.setAttribute("id", id);
            this.element.setAttribute("class", (this._enabled) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
            this.setButtonKindToDescendants();
        }
        setButtonKindToDescendants() {
            this.element.setAttribute("button-kind", this.kind);
            this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-kind", this.kind));
        }
        setButtonIdToDescendants() {
            this.element.setAttribute("button-id", this.id);
            this.element.querySelectorAll("*").forEach(el => el.setAttribute("button-id", this.id));
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value;
            this.element.setAttribute("class", (value) ? `${this.buttonColor} button` : `${this.buttonColor} inactive-button`);
        }
    }
    exports.DocumentButton = DocumentButton;
    class MiscImageButton extends DocumentButton {
        constructor(parent, id, thumbSrc, buttonColor, title) {
            super(parent, id, types_1.DocumentButtonKind.MiscButton, true, null, buttonColor);
            this.thumbSrc = thumbSrc;
            if (title)
                this.element.setAttribute("title", title);
            this.thumbImgElement = document.createElement("img");
            this.thumbImgElement.src = thumbSrc;
            this.element.appendChild(this.thumbImgElement);
            this.setButtonIdToDescendants();
            this.setButtonKindToDescendants();
        }
    }
    exports.MiscImageButton = MiscImageButton;
    /**
     * A child class of @class MiscImageButton that contains two states: toggled and non-toggled. When it's non-toggled, it will display the thumbImg and the originalTitle,
     * but when it's toggled, it will display the toggledThumbImg and the toggledTitle. If toggleTitle is not specified, the button's title will always be the originalTitle.
     */
    class MiscToggleImageButton extends MiscImageButton {
        constructor(parent, id, thumbSrc, toggledThumbSrc, buttonColor, originalTitle, toggledTitle) {
            super(parent, id, thumbSrc, buttonColor, originalTitle);
            this.toggledThumbSrc = toggledThumbSrc;
            this.originalTitle = originalTitle;
            this.toggledTitle = toggledTitle;
        }
        set toggled(t) {
            this.thumbImgElement.src = t ? this.toggledThumbSrc : this.thumbSrc;
            if (this.originalTitle)
                this.element.setAttribute("title", t && this.toggledTitle ? this.toggledTitle : this.originalTitle);
        }
    }
    exports.MiscToggleImageButton = MiscToggleImageButton;
    class MiscTextButton extends DocumentButton {
        constructor(parent, id, text, buttonColor, title) {
            super(parent, id, types_1.DocumentButtonKind.MiscButton, true, null, buttonColor);
            this.element.innerHTML = text;
            if (title)
                this.element.setAttribute("title", title);
            this.setButtonIdToDescendants();
            this.setButtonKindToDescendants();
        }
    }
    exports.MiscTextButton = MiscTextButton;
    class CreateObjectButton extends DocumentButton {
        constructor(name, thumbSrc, createObjectConfig) {
            super(exports.documentElements.get("object-list"), `create-${name}-button`, types_1.DocumentButtonKind.CreateObjectButton, true, function (t, cR, a, c) { physicsObjects_1.PhysicsObject.createPhysicsObject(t, cR, a, c); }, types_1.ButtonColor.Dark);
            this.name = name;
            this.createObjectConfig = createObjectConfig;
            const parent = this.element.parentElement;
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
        set enabled(value) {
            this.element.setAttribute("class", (!value) ? "dark-button inactive-button" : "dark-button button");
        }
    }
    exports.CreateObjectButton = CreateObjectButton;
    class PropertyDescriptionUI {
        static setElementVisible(isVisible) {
            this.element.style.display = (isVisible) ? "flex" : "none";
        }
        static show(propertyKind) {
            this.setElementVisible(true);
            const description = propertyDescriptions_1.propertyDescriptions.get(propertyKind);
            if (description)
                this.element.querySelector("article").innerHTML = description;
            else
                this.hide();
        }
        static hide() {
            this.setElementVisible(false);
        }
    }
    PropertyDescriptionUI.element = document.querySelector("#property-description-interface");
    exports.PropertyDescriptionUI = PropertyDescriptionUI;
    /**
     * Class that controls if the CreateObjectButtons are enabled or not
     */
    class ObjectCreationController {
        static set objectCreatable(value) {
            this._objectCreatable = value;
            exports.objectCreationButtons.forEach(button => button.enabled = value);
        }
        static get objectCreatable() {
            return this._objectCreatable;
        }
    }
    ObjectCreationController._objectCreatable = true;
    exports.ObjectCreationController = ObjectCreationController;
    /**
     * Controlls the selection of Selectable objects
     */
    class ObjectSelectionController {
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
            console.log("Selected:", object);
            const domPropertyUL = exports.documentElements.get("property-list");
            const domPropertyH1 = exports.documentElements.get("property-list-title");
            this._selectedObject = object;
            while (domPropertyUL.firstChild)
                domPropertyUL.removeChild(domPropertyUL.firstChild);
            domPropertyH1.innerHTML = `Propriedades do ${object.name}`;
            this.propertiesEnabled = this.propertiesEnabled;
            if (object.appendPropertyListItems)
                object.appendPropertyListItems(domPropertyUL, this.propertiesEnabled);
            const followButton = exports.miscButtons.get("follow-button");
            const destroyButton = exports.miscButtons.get("destroy-button");
            followButton.enabled = object.isFollowable;
            followButton.toggled = main_1.canvasRenderer.camera.objectBeingFollowed == this._selectedObject;
            destroyButton.enabled = object.destroy != undefined && main_1.simulator.time == 0;
        }
        static get propertiesEnabled() {
            return this._propertiesEnabled;
        }
        static set propertiesEnabled(value) {
            if (!this._selectedObject)
                return;
            this._propertiesEnabled = value;
            const physicsProperties = this._selectedObject.getProperty(types_1.PhysicsPropertyType.All);
            if (physicsProperties) {
                physicsProperties.forEach(objectProperty => {
                    if (objectProperty.propertyLI)
                        objectProperty.propertyLI.enabled = value;
                });
            }
        }
    }
    ObjectSelectionController._selectedObject = null;
    ObjectSelectionController._propertiesEnabled = true;
    exports.ObjectSelectionController = ObjectSelectionController;
    /**
     * A map that contains various Elements in the application HTML document.
     */
    exports.documentElements = new Map();
    exports.documentElements.set("header", document.querySelector("#buttons-header"));
    exports.documentElements.set("file-buttons", exports.documentElements.get("header").querySelector("#header-file-buttons"));
    exports.documentElements.set("camera-buttons", exports.documentElements.get("header").querySelector("#header-camera-buttons"));
    exports.documentElements.set("property-panel", document.querySelector(".side-panel:first-child > div"));
    exports.documentElements.set("object-interactor", document.querySelector("#object-interactor"));
    exports.documentElements.set("property-list-title", exports.documentElements.get("property-panel").querySelector("h1"));
    exports.documentElements.set("property-list", document.querySelector("#property-list"));
    exports.documentElements.set("simulation-controller-buttons", document.querySelector("#simulation-controller-buttons"));
    exports.documentElements.set("object-list", document.querySelector("#object-list"));
    exports.documentElements.set("property-description-interface", document.querySelector("#property-description-interface"));
    exports.documentElements.set("property-description-header", exports.documentElements.get("property-description-interface").querySelector("header"));
    /**
     * A map that contains all of the buttons that creates objects
     */
    exports.objectCreationButtons = new Map();
    exports.objectCreationButtons.set(types_1.PhysicsObjectType.Solid, new CreateObjectButton("Sólido", "./assets/images/solid.png", function () {
        return {
            position: main_1.canvasRenderer.camera.getWorldPosFromCanvas(new vector2_1.default(main_1.canvasRenderer.context.canvas.width / 2, main_1.canvasRenderer.context.canvas.height / 2)),
            size: new vector2_1.default(1, 1)
        };
    }));
    /**
     * A map that contains all of the buttons that do various functions on the application.
     * @method get Gets a button. Current buttons: play-button, reset-button, follow-button, destroy-button, centralize-camera, close-property-description, new-button, save-button, load-button
     */
    exports.miscButtons = new Map();
    exports.miscButtons.set("play-button", new MiscImageButton(exports.documentElements.get("simulation-controller-buttons"), "play-button", "./assets/images/play.png", types_1.ButtonColor.Dark, "Iniciar simulação"));
    exports.miscButtons.set("reset-button", new MiscTextButton(exports.documentElements.get("simulation-controller-buttons"), "reset-button", "t=0", types_1.ButtonColor.Dark, "Definir tempo igual a 0"));
    exports.miscButtons.set("destroy-button", new MiscImageButton(exports.documentElements.get("object-interactor"), "destroy-button", "./assets/images/delete.png", types_1.ButtonColor.Dark, "Destruir objecto"));
    exports.miscButtons.set("follow-button", new MiscToggleImageButton(exports.documentElements.get("object-interactor"), "follow-button", "./assets/images/follow.png", "./assets/images/cancelfollow.png", types_1.ButtonColor.Dark, "Focar/seguir objeto", "Parar de focar/seguir objeto"));
    exports.miscButtons.set("centralize-camera", new MiscImageButton(exports.documentElements.get("camera-buttons"), "centralize-camera", "./assets/images/cameracenter.png", types_1.ButtonColor.InvisibleBackground, "Posicionar câmera na origem"));
    exports.miscButtons.set("close-property-description", new MiscImageButton(exports.documentElements.get("property-description-header"), "close-property-description", "./assets/images/closeicon.png", types_1.ButtonColor.White));
    exports.miscButtons.set("new-button", new MiscImageButton(exports.documentElements.get("file-buttons"), "new-button", "./assets/images/newfile.png", types_1.ButtonColor.InvisibleBackground, "Novo ambiente"));
    exports.miscButtons.set("save-button", new MiscImageButton(exports.documentElements.get("file-buttons"), "save-button", "./assets/images/save.png", types_1.ButtonColor.InvisibleBackground, "Salvar ambiente"));
    exports.miscButtons.set("load-button", new MiscImageButton(exports.documentElements.get("file-buttons"), "load-button", "./assets/images/load.png", types_1.ButtonColor.InvisibleBackground, "Abrir ambiente"));
    //Event listeners
    document.addEventListener("click", e => {
        const target = e.target;
        const buttonId = target.getAttribute("button-id");
        switch (target.getAttribute("button-kind")) {
            case types_1.DocumentButtonKind.MiscButton:
                const button = exports.miscButtons.get(buttonId);
                if (button && button.onClick)
                    button.onClick();
                break;
            case types_1.DocumentButtonKind.CreateObjectButton:
                if (!ObjectCreationController.objectCreatable)
                    return;
                const objectCreationArray = Array.from(exports.objectCreationButtons);
                const objectPair = objectCreationArray.find(el => { return el[1].element.getAttribute("button-id") == buttonId; });
                const objectKind = objectPair[0];
                const objectButton = objectPair[1];
                objectButton.onClick(objectKind, main_1.canvasRenderer, main_1.ambient, objectButton.createObjectConfig());
                break;
            case types_1.DocumentButtonKind.PropertyButton:
                const propertyKind = e.target.getAttribute("property-kind");
                if (propertyKind)
                    PropertyDescriptionUI.show(parseInt(propertyKind));
                return;
        }
    });
    //Configuration
    exports.miscButtons.get("destroy-button").onClick = function () {
        const selectedObject = ObjectSelectionController.selectedObject;
        if (!selectedObject || !selectedObject.destroy || main_1.simulator.time != 0)
            return;
        selectedObject.destroy();
        ObjectSelectionController.selectObject(main_1.ambient);
    };
    exports.miscButtons.get("follow-button").onClick = function () {
        const selectedObject = ObjectSelectionController.selectedObject;
        if (!selectedObject || !selectedObject.isFollowable)
            return;
        const camera = main_1.canvasRenderer.camera;
        if (camera.objectBeingFollowed != selectedObject)
            camera.followObject(selectedObject);
        else
            camera.unfollowObject();
    };
    exports.miscButtons.get("close-property-description").onClick = PropertyDescriptionUI.hide.bind(PropertyDescriptionUI);
});
