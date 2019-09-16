console.log("Loading propertyEditor");

import { PhysicsObject } from "../physicsObjects";
import { ButtonColor, PropertyEditorRow, Selectable } from "../types";
import Vector2 from "../vector2";
import { Button } from "./buttons";

export class PropertyEditor {
    private rows: PropertyEditorRow[];

    constructor(private htmlElement: HTMLElement) {
        this.rows = [];

        this.htmlElement.addEventListener("change", this.onChanged.bind(this));
        this.htmlElement.addEventListener("click", this.onClicked.bind(this));
        this.htmlElement.addEventListener("mouseover", this.onMouseOver.bind(this));
        this.htmlElement.addEventListener("mouseout", this.onMouseOut.bind(this));
    }

    setEnabled(v: boolean) {
        this.rows.forEach(row => row.active = v);
    }

    build(object: Selectable): void {
        this.clear();

        if (!object.getPropertyEditorRows)
            return;

        //Get categories from the propertyPalleteRows of object, and store them on an array of {name, layoutOrder}. Then remove all of categories with the same name, leaving the ones with the minimal layoutOrder
        const propertyEditorRows = object.getPropertyEditorRows();
        let categories: { name: string, layoutOrder: number }[] = propertyEditorRows.map(el => { return { name: el.category, layoutOrder: el.layoutOrder } });
        categories = categories.sort((cat1, cat2) => cat1.layoutOrder - cat2.layoutOrder);
        categories = categories.filter((v) => categories.find(c => c.name == v.name) == v);

        //Append categories as h1 and propertyEditorRows
        categories.forEach(category => {
            let rowWithCategory = propertyEditorRows.filter(ppr => ppr.category == category.name);
            rowWithCategory = rowWithCategory.sort((row1, row2) => row1.layoutOrder - row2.layoutOrder);

            const categoryH1 = document.createElement("h1");
            categoryH1.innerHTML = category.name;

            this.htmlElement.append(categoryH1);
            rowWithCategory.forEach(row => row.appendTo(this.htmlElement));
        });

        this.htmlElement.style.display = this.htmlElement.childElementCount > 0 ? "block" : "none";

        this.rows = propertyEditorRows;
    }

    clear() {
        while (this.htmlElement.firstChild)
            this.htmlElement.removeChild(this.htmlElement.firstChild);

        this.rows = [];
    }

    private getRowFromEvent(ev: Event): PropertyEditorRow | undefined {
        const tgt = <HTMLElement>ev.target;
        if (!tgt) return;


        for (const row of this.rows) {
            if (row.element.contains(tgt))
                return row;
        }
    }

    private onChanged(ev: Event) {
        const row = this.getRowFromEvent(ev);

        if (row && row.onChanged)
            row.onChanged(ev);
    }

    private onClicked(ev: MouseEvent) {
        const row = this.getRowFromEvent(ev);

        if (row && row.onClicked)
            row.onClicked(ev);
    }

    private onMouseOver(ev: MouseEvent) {
        const row = this.getRowFromEvent(ev);

        if (row && row.onMouseOver)
            row.onMouseOver(ev);
    }

    private onMouseOut(ev: MouseEvent) {
        const row = this.getRowFromEvent(ev);

        if (row && row.onMouseOut)
            row.onMouseOut(ev);
    }
}

abstract class BasicPropertyEditorRow implements PropertyEditorRow {
    readonly element: HTMLElement;

    private _active: boolean;

    constructor(readonly category: string, readonly layoutOrder: number, protected changeable: boolean, descriptionId?: number) {
        this._active = changeable;
        this.element = document.createElement("li");

        this.element.setAttribute("class", changeable ? "active-row" : "inactive-row");

        if (descriptionId) {
            const descriptionButton = Button.createButtonElement({
                buttonName: `open-${descriptionId}-description-button`,
                buttonColor: ButtonColor.Dark,
                enabled: true,
                title: `Descrição`,
                imgSrc: "./assets/images/descriptionicon.svg",
                func: "openPropertyDescription",
                args: descriptionId.toString()
            });

            this.element.appendChild(descriptionButton);
        }
    }

    get active() {
        return this._active;
    }

    set active(v: boolean) {
        this._active = v && this.changeable;
        this.element.classList.replace(this.element.classList.contains("active-row") ? "active-row" : "inactive-row", this._active ? "active-row" : "inactive-row");
    }

    appendTo(target: HTMLElement) {
        target.appendChild(this.element);
    }
}

export abstract class PropertyEditorInput<T> extends BasicPropertyEditorRow {
    protected readonly input: HTMLInputElement;

    private nameLabel: HTMLLabelElement;
    private lastValue: string;

    constructor(protected readonly target: { doDrawGizmos: boolean, onUserInput(value: T): void; value: T }, name: string, unit: string, private readonly regExp: RegExp, category: string, layoutOrder: number, changeable: boolean, initialValue: T, descriptionId?: number) {
        super(category, layoutOrder, changeable, descriptionId);

        this.element.classList.add("input-row");
        this.input = document.createElement("input");
        this.lastValue = this.formatValue(initialValue);
        this.nameLabel = document.createElement("label");
        const unitLabel = document.createElement("label");

        this.nameLabel.innerHTML = name;
        unitLabel.innerHTML = unit;
        const inputId = `${name}-input`;
        this.nameLabel.setAttribute("for", inputId);
        this.input.disabled = !changeable;
        this.input.id = inputId;
        this.input.value = this.lastValue;

        this.element.append(this.nameLabel, this.input, unitLabel);
    }

    get active(): boolean {
        return super.active;
    }

    set active(v: boolean) {
        super.active = v;
        this.input.disabled = !v || !this.changeable;
    }

    updateValue(v: T): void {
        const formattedValue = this.formatValue(v);
        this.input.value = formattedValue;
        this.lastValue = formattedValue;
    }

    onChanged(): void {
        let match = this.input.value.match(this.regExp);

        if (!match) {
            this.resetToLastValue();
            return;
        }

        match = match.filter(el => { return el != "" });

        const matchResult = this.processMatch(match);

        if (!matchResult) {
            this.resetToLastValue();
            return;
        }

        this.target.onUserInput(matchResult);
    }

    onMouseOver(ev: MouseEvent): void {
        this.target.doDrawGizmos = true;
    }

    onMouseOut(ev: MouseEvent): void {
        this.target.doDrawGizmos = false;
    }

    protected resetToLastValue(): void {
        this.input.value = this.lastValue;
    }

    protected formatValue(value: T): string {
        return "NaN";
    }

    protected processMatch(match: RegExpMatchArray): T | undefined {
        return undefined;
    }
}

export class Vector2PropertyEditorInput extends PropertyEditorInput<Vector2>{
    constructor(target: { doDrawGizmos: boolean, onUserInput(value: Vector2): void, value: Vector2 }, name: string, unit: string, category: string, layoutOrder: number, changeable: boolean, initialValue: Vector2, descriptionId?: number, private modulusUnit?: string) {
        super(target, name, unit, /\-?\d*\.?\d*/g, category, layoutOrder, changeable, initialValue, descriptionId);
        this.updateInputTitle(initialValue);
    }

    onChanged() {
        super.onChanged();
        this.updateInputTitle(this.target.value);
    }

    protected formatValue(value: Vector2): string {
        return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
    }

    protected processMatch(match: RegExpMatchArray): Vector2 | undefined {
        if (!match[0] || !match[1]) {
            this.resetToLastValue();
            return undefined;
        }

        return new Vector2(Number(match[0]), Number(match[1]));
    }

    private updateInputTitle(value: Vector2) {
        if (this.modulusUnit)
            this.input.title = `Módulo: ${Vector2.distance(Vector2.zero, value)} ${this.modulusUnit}`;
    }
}

export class NumberPropertyEditorInput extends PropertyEditorInput<number>{
    constructor(target: { doDrawGizmos: boolean, onUserInput(value: number): void, value: number }, name: string, unit: string, category: string, layoutOrder: number, changeable: boolean, initialValue: number, descriptionId?: number) {
        super(target, name, unit, /\-?\d*\.?\d*/i, category, layoutOrder, changeable, initialValue, descriptionId);
    }

    protected formatValue(value: number): string {
        return value.toFixed(2);
    }

    protected processMatch(match: RegExpMatchArray): number | undefined {
        if (!match[0]) {
            this.resetToLastValue();
            return;
        }

        return Number(match[0]);
    }
}

export class ObjectLocatorPropertyEditorRow extends BasicPropertyEditorRow {
    private locateButton: HTMLElement;

    constructor(target: PhysicsObject, category: string, layoutOrder: number, descriptionId?: number) {
        super(category, layoutOrder, true, descriptionId);

        this.element.classList.add("object-locator-row");

        const nameLabel = document.createElement("label");
        this.locateButton = Button.createButtonElement({
            buttonColor: ButtonColor.Dark,
            buttonName: `locate-${target.name.replace(/\s+/g, '')}`,
            enabled: true,
            title: `Localizar objeto`,
            imgSrc: "./assets/images/centertooriginicon.svg",
            func: "locateObject",
            args: target.name
        });

        nameLabel.innerHTML = target.name;

        this.element.append(nameLabel, this.locateButton);
    }
}