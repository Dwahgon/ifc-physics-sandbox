var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./documentElements"], function (require, exports, documentElements_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    documentElements_1 = __importDefault(documentElements_1);
    console.log("Loaded modal");
    /*
        Class Definitions
    */
    class Modal {
        constructor(element) {
            this.element = element;
            this.onOpen = null;
        }
        setVisible(value) {
            this.element.style.display = value ? "flex" : "none";
            const application = documentElements_1.default.get("application-wrapper");
            application.style.filter = value ? "blur(3px)" : "none";
            if (value && this.onOpen)
                this.onOpen();
        }
    }
    exports.Modal = Modal;
    /*
        Query modals
    */
    const modals = [];
    document.querySelectorAll(".modal").forEach(element => modals.push(new Modal(element)));
    /*
        Export functions
    */
    exports.getModalById = (id) => {
        return modals.find(modal => { return modal.element.id == id; });
    };
    exports.getModalByHTMLElement = (element) => {
        return modals.find(modal => { return modal.element == element; });
    };
    exports.pushModalElement = (element) => {
        if (!exports.getModalByHTMLElement(element))
            modals.push(new Modal(element));
    };
    exports.removeModalElement = (element) => {
        const btn = exports.getModalByHTMLElement(element);
        if (btn)
            modals.splice(modals.indexOf(btn));
    };
});
