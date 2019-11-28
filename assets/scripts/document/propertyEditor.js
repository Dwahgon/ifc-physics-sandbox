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
            this.enabled = true;
            this.htmlElement.addEventListener("change", this.onChanged.bind(this));
            this.htmlElement.addEventListener("click", this.onClicked.bind(this));
            this.htmlElement.addEventListener("mouseover", this.onMouseOver.bind(this));
            this.htmlElement.addEventListener("mouseout", this.onMouseOut.bind(this));
        }
        setEnabled(v) {
            this.rows.forEach(row => row.active = v);
            this.enabled = v;
        }
        build(object) {
            this.clear();
            if (!object.getPropertyEditorOptions)
                return;
            //Get categories from the propertyPalleteRows of object, and store them on an array of {name, layoutOrder}. Then remove all of categories with the same name, leaving the ones with the minimal layoutOrder
            const PropertyEditorOptions = object.getPropertyEditorOptions();
            let categories = PropertyEditorOptions.map(el => { return { name: el.category, layoutOrder: el.layoutOrder }; });
            categories = categories.sort((cat1, cat2) => cat1.layoutOrder - cat2.layoutOrder);
            categories = categories.filter((v) => categories.find(c => c.name == v.name) == v);
            //Append categories as h1 and PropertyEditorOptions
            categories.forEach(category => {
                let rowWithCategory = PropertyEditorOptions.filter(ppr => ppr.category == category.name);
                rowWithCategory = rowWithCategory.sort((row1, row2) => row1.layoutOrder - row2.layoutOrder);
                const categoryH1 = document.createElement("h1");
                categoryH1.innerHTML = category.name;
                this.htmlElement.append(categoryH1);
                rowWithCategory.forEach(row => {
                    row.appendTo(this.htmlElement);
                    row.active = this.enabled;
                });
            });
            this.htmlElement.style.display = this.htmlElement.childElementCount > 0 ? "block" : "none";
            this.rows = PropertyEditorOptions;
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
    class BasicPropertyEditorOption {
        constructor(category, layoutOrder, changeable, descriptionId) {
            this.category = category;
            this.layoutOrder = layoutOrder;
            this.changeable = changeable;
            this._active = changeable;
            this.element = document.createElement("li");
            this.element.setAttribute("class", changeable ? "active-row" : "inactive-row");
            if (descriptionId != undefined) {
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
    class PropertyEditorInputList extends BasicPropertyEditorOption {
        constructor(target, name, category, layoutOrder, changeable, toggleable, title, descriptionId) {
            super(category, layoutOrder, changeable, descriptionId);
            this.target = target;
            this.inputList = [];
            this.element.classList.add("input-row");
            this.inputWrapper = document.createElement("div");
            this.nameLabel = document.createElement("label");
            this.nameLabel.innerHTML = name;
            this.nameLabel.title = title;
            if (toggleable) {
                this.toggleElement = document.createElement("input");
                this.toggleElement.type = "checkbox";
                this.toggleElement.classList.add("toggle-input");
                this._toggled = true;
                this.element.appendChild(this.toggleElement);
            }
            this.element.append(this.nameLabel, this.inputWrapper);
        }
        get active() {
            return super.active;
        }
        set active(v) {
            super.active = v;
            this.inputList.forEach(input => input.active = v && this.changeable);
            if (this.toggleElement)
                this.toggleElement.disabled = !v || !this.changeable;
        }
        get toggled() {
            return this._toggled;
        }
        set toggled(v) {
            this._toggled = v;
            this.toggleElement.checked = v || false;
        }
        addInput(input) {
            this.inputList.push(input);
            input.appendTo(this.inputWrapper);
        }
        removeInput(name) {
            let inputToRemove = this.inputList.find(i => i.name === name);
            if (!inputToRemove)
                return;
            this.inputList.splice(this.inputList.indexOf(inputToRemove), 1);
            inputToRemove.element.remove();
        }
        getInput(name) {
            if (name)
                return this.inputList.find(el => el.name == name);
            return this.inputList.length > 0 ? this.inputList[0] : undefined;
        }
        onChanged(ev) {
            const tgt = ev.target;
            if (tgt.classList.contains("toggle-input")) {
                this.toggled = tgt.checked;
                if (this.target.onUserToggle)
                    this.target.onUserToggle(this.toggled);
            }
            else {
                const map = new Map();
                this.inputList.forEach(i => {
                    const result = i.onChanged();
                    if (result)
                        map.set(i.name, result);
                });
                this.target.onUserInput(map);
            }
        }
        onMouseOver(ev) {
            this.target.doDrawGizmos = true;
        }
        onMouseOut(ev) {
            this.target.doDrawGizmos = false;
        }
    }
    exports.PropertyEditorInputList = PropertyEditorInputList;
    class InputListRow {
        constructor(name, unit, initialValue, regExp, changeable, createNameLabel) {
            this.name = name;
            this.regExp = regExp;
            this.changeable = changeable;
            this._active = changeable;
            this.lastValue = initialValue;
            this.element = document.createElement("div");
            this.input = document.createElement("input");
            const unitLabel = document.createElement("label");
            unitLabel.innerHTML = unit;
            this.input.value = this.formatValue(initialValue);
            this.input.type = "text";
            this.active = changeable;
            if (createNameLabel) {
                const nameLabel = document.createElement("label");
                nameLabel.innerHTML = name;
                this.element.appendChild(nameLabel);
            }
            this.element.append(this.input, unitLabel);
        }
        get active() {
            return this._active;
        }
        set active(v) {
            this._active = v && this.changeable;
            this.input.disabled = !v || !this.changeable;
        }
        appendTo(element) {
            element.appendChild(this.element);
        }
        resetToLastValue() {
            this.input.value = this.formatValue(this.lastValue);
        }
        onChanged() {
            const reset = () => {
                const lastValue = this.lastValue;
                this.resetToLastValue();
                return lastValue;
            };
            let match = this.input.value.match(this.regExp);
            if (!match)
                return reset();
            match = match.filter(el => { return el != ""; });
            const matchResult = this.processMatch(match);
            if (matchResult == undefined)
                return reset();
            return matchResult;
        }
        updateValue(v) {
            this.lastValue = v;
            this.input.value = this.formatValue(v);
        }
        formatValue(value) {
            return "NaN";
        }
        processMatch(match) {
            return undefined;
        }
    }
    exports.InputListRow = InputListRow;
    class Vector2InputListRow extends InputListRow {
        constructor(name, unit, initialValue, changeable, createNameLabel, modulusUnit) {
            super(name, unit, initialValue, /\-?\d*\.?\d*/g, changeable, createNameLabel);
            this.modulusUnit = modulusUnit;
            this.updateInputTitle(initialValue);
        }
        updateValue(v) {
            super.updateValue(v);
            this.updateInputTitle(v);
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
        updateInputTitle(v) {
            if (this.modulusUnit)
                this.input.title = `Módulo: ${v.magnitude()} ${this.modulusUnit}`;
        }
    }
    exports.Vector2InputListRow = Vector2InputListRow;
    class NumberInputListRow extends InputListRow {
        constructor(name, unit, initialValue, changeable, createNameLabel) {
            super(name, unit, initialValue, /\-?\d*\.?\d*/i, changeable, createNameLabel);
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
    exports.NumberInputListRow = NumberInputListRow;
    class ButtonInputListRow {
        constructor(name, button, createNameLabel = true) {
            this.name = name;
            this.button = button;
            this._active = true;
            this.element = document.createElement("div");
            if (createNameLabel) {
                const nameLabel = document.createElement("label");
                nameLabel.innerHTML = name;
                this.element.appendChild(nameLabel);
            }
            this.element.appendChild(button.element);
        }
        get active() {
            return this._active;
        }
        set active(v) {
            this._active = v;
            this.button.enabled = v;
        }
        appendTo(target) {
            target.appendChild(this.element);
        }
        onChanged() { return null; }
        resetToLastValue() { }
        updateValue(v) { }
    }
    exports.ButtonInputListRow = ButtonInputListRow;
    class ObjectLocatorPropertyEditorOption extends BasicPropertyEditorOption {
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
    exports.ObjectLocatorPropertyEditorOption = ObjectLocatorPropertyEditorOption;
});
