var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../types", "../vector2", "./buttons"], function (require, exports, types_1, vector2_1, buttons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading propertyEditor");
    class PropertyEditor {
        constructor(htmlElement) {
            this.htmlElement = htmlElement;
            this.rows = [];
            this.htmlElement.addEventListener("change", this.onChanged.bind(this));
            this.htmlElement.addEventListener("click", this.onClicked.bind(this));
            this.htmlElement.addEventListener("mouseover", this.onMouseOver.bind(this));
            this.htmlElement.addEventListener("mouseout", this.onMouseOut.bind(this));
        }
        setEnabled(v) {
            this.rows.forEach(row => row.active = v);
        }
        build(object) {
            this.clear();
            if (!object.getPropertyEditorRows)
                return;
            //Get categories from the propertyPalleteRows of object, and store them on an array of {name, layoutOrder}. Then remove all of categories with the same name, leaving the ones with the minimal layoutOrder
            const propertyEditorRows = object.getPropertyEditorRows();
            let categories = propertyEditorRows.map(el => { return { name: el.category, layoutOrder: el.layoutOrder }; });
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
        getRowFromEvent(ev) {
            const tgt = ev.target;
            if (!tgt)
                return;
            for (const row of this.rows) {
                if (row.element.contains(tgt))
                    return row;
            }
        }
        onChanged(ev) {
            const row = this.getRowFromEvent(ev);
            if (row && row.onChanged)
                row.onChanged(ev);
        }
        onClicked(ev) {
            const row = this.getRowFromEvent(ev);
            if (row && row.onClicked)
                row.onClicked(ev);
        }
        onMouseOver(ev) {
            const row = this.getRowFromEvent(ev);
            if (row && row.onMouseOver)
                row.onMouseOver(ev);
        }
        onMouseOut(ev) {
            const row = this.getRowFromEvent(ev);
            if (row && row.onMouseOut)
                row.onMouseOut(ev);
        }
    }
    exports.PropertyEditor = PropertyEditor;
    class BasicPropertyEditorRow {
        constructor(category, layoutOrder, changeable, descriptionId) {
            this.category = category;
            this.layoutOrder = layoutOrder;
            this.changeable = changeable;
            this._active = changeable;
            this.element = document.createElement("li");
            this.element.setAttribute("class", changeable ? "active-row" : "inactive-row");
            if (descriptionId) {
                const descriptionButton = buttons_1.Button.createButtonElement({
                    buttonName: `open-${descriptionId}-description-button`,
                    buttonColor: types_1.ButtonColor.Dark,
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
        set active(v) {
            this._active = v && this.changeable;
            this.element.classList.replace(this.element.classList.contains("active-row") ? "active-row" : "inactive-row", this._active ? "active-row" : "inactive-row");
        }
        appendTo(target) {
            target.appendChild(this.element);
        }
    }
    class PropertyEditorInput extends BasicPropertyEditorRow {
        constructor(target, name, unit, regExp, category, layoutOrder, changeable, initialValue, descriptionId) {
            super(category, layoutOrder, changeable, descriptionId);
            this.target = target;
            this.regExp = regExp;
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
        get active() {
            return super.active;
        }
        set active(v) {
            super.active = v;
            this.input.disabled = !v || !this.changeable;
        }
        updateValue(v) {
            const formattedValue = this.formatValue(v);
            this.input.value = formattedValue;
            this.lastValue = formattedValue;
        }
        onChanged() {
            let match = this.input.value.match(this.regExp);
            if (!match) {
                this.resetToLastValue();
                return;
            }
            match = match.filter(el => { return el != ""; });
            const matchResult = this.processMatch(match);
            if (!matchResult) {
                this.resetToLastValue();
                return;
            }
            this.target.onUserInput(matchResult);
        }
        onMouseOver(ev) {
            this.target.doDrawGizmos = true;
        }
        onMouseOut(ev) {
            this.target.doDrawGizmos = false;
        }
        resetToLastValue() {
            this.input.value = this.lastValue;
        }
        formatValue(value) {
            return "NaN";
        }
        processMatch(match) {
            return undefined;
        }
    }
    exports.PropertyEditorInput = PropertyEditorInput;
    class Vector2PropertyEditorInput extends PropertyEditorInput {
        constructor(target, name, unit, category, layoutOrder, changeable, initialValue, descriptionId, modulusUnit) {
            super(target, name, unit, /\-?\d*\.?\d*/g, category, layoutOrder, changeable, initialValue, descriptionId);
            this.modulusUnit = modulusUnit;
            this.updateInputTitle(initialValue);
        }
        onChanged() {
            super.onChanged();
            this.updateInputTitle(this.target.value);
        }
        formatValue(value) {
            return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
        }
        processMatch(match) {
            if (!match[0] || !match[1]) {
                this.resetToLastValue();
                return undefined;
            }
            return new vector2_1.default(Number(match[0]), Number(match[1]));
        }
        updateInputTitle(value) {
            if (this.modulusUnit)
                this.input.title = `Módulo: ${vector2_1.default.distance(vector2_1.default.zero, value)} ${this.modulusUnit}`;
        }
    }
    exports.Vector2PropertyEditorInput = Vector2PropertyEditorInput;
    class NumberPropertyEditorInput extends PropertyEditorInput {
        constructor(target, name, unit, category, layoutOrder, changeable, initialValue, descriptionId) {
            super(target, name, unit, /\-?\d*\.?\d*/i, category, layoutOrder, changeable, initialValue, descriptionId);
        }
        formatValue(value) {
            return value.toFixed(2);
        }
        processMatch(match) {
            if (!match[0]) {
                this.resetToLastValue();
                return;
            }
            return Number(match[0]);
        }
    }
    exports.NumberPropertyEditorInput = NumberPropertyEditorInput;
    class ObjectLocatorPropertyEditorRow extends BasicPropertyEditorRow {
        constructor(target, category, layoutOrder, descriptionId) {
            super(category, layoutOrder, true, descriptionId);
            this.element.classList.add("object-locator-row");
            const nameLabel = document.createElement("label");
            this.locateButton = buttons_1.Button.createButtonElement({
                buttonColor: types_1.ButtonColor.Dark,
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
    exports.ObjectLocatorPropertyEditorRow = ObjectLocatorPropertyEditorRow;
});
