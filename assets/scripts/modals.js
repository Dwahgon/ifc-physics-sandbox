var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "./document"], function (require, exports, Document) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Document = __importStar(Document);
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
            const header = Document.documentElements.get("header");
            const mainInterface = Document.documentElements.get("main-interface");
            mainInterface.style.filter = value ? "blur(3px)" : "none";
            header.style.filter = value ? "blur(3px)" : "none";
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
