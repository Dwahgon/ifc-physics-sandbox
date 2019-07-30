/*
    Class Definitions
*/

export class Modal {
    constructor(public readonly element: HTMLElement) {
    }

    setVisible(value: boolean) {
        this.element.style.display = value ? "flex" : "none";
    }
}

/*
    Query modals
*/

const modals: Modal[] = [];
document.querySelectorAll(".modal").forEach(element => modals.push(new Modal(<HTMLElement>element)));

/*
    Export functions
*/

export const getModalById = (id: string) => {
    return modals.find(modal => { return modal.element.id == id });
}

export const getModalByHTMLElement = (element: HTMLElement) => {
    return modals.find(modal => { return modal.element == element });
}

export const pushModalElement = (element: HTMLElement) => {
    if (!getModalByHTMLElement(element))
        modals.push(new Modal(element));
}

export const removeModalElement = (element: HTMLElement) => {
    const btn = getModalByHTMLElement(element);
    if (btn) 
        modals.splice(modals.indexOf(btn));
}