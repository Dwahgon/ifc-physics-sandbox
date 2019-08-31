var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./vector2", "./document", "./buttons", "./types"], function (require, exports, vector2_1, document_1, buttons_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading propertyLI");
    class PropertyLI {
        constructor(property, name, propertyUnit, regExp, initialValue, title) {
            this.property = property;
            this.regExp = regExp;
            this.li = document.createElement("li");
            this.input = document.createElement("input");
            this.domNameLabel = document.createElement("label");
            this.domUnitLabel = document.createElement("label");
            const descriptionButton = buttons_1.Button.createButtonElement({
                buttonName: `open-${property.kind}-description-button`,
                buttonColor: types_1.ButtonColor.Dark,
                enabled: true,
                title: `Descrição do(a) ${title.toLowerCase()}`,
                imgSrc: "./assets/images/descriptionicon.svg",
                func: "openPropertyDescription",
                args: this.property.kind.toString()
            });
            this.domNameLabel.innerHTML = name;
            this.domUnitLabel.innerHTML = propertyUnit;
            this.li.appendChild(descriptionButton);
            this.li.appendChild(this.domNameLabel);
            this.li.appendChild(this.input);
            this.li.appendChild(this.domUnitLabel);
            this.input.setAttribute("id", `${name}-property-input`);
            this.domNameLabel.setAttribute("for", `${name}-property-input`);
            this.domNameLabel.setAttribute("title", title);
            this.input.setAttribute("type", "text");
            this.lastValue = "";
            this.enabled = this.property.changeable;
            this.setValue(initialValue);
            this.input.addEventListener("change", this.onInputChanged.bind(this));
        }
        setValue(value) {
            const formattedValue = this.formatValue(value);
            this.input.value = formattedValue;
            this.lastValue = formattedValue;
        }
        onInputChanged() {
            let match = this.input.value.match(this.regExp);
            if (!match) {
                this.resetToLastString();
                return;
            }
            match = match.filter(el => { return el != ""; });
            let matchResult = this.processMatch(match);
            if (!matchResult) {
                this.resetToLastString();
                return;
            }
            this.property.initialValue = matchResult;
        }
        formatValue(value) {
            throw "formatValue(value: T) has not been implemented";
        }
        processMatch(match) {
            throw "processMatch(match: RegExpMatchArray): T has not been implemented";
        }
        resetToLastString() {
            this.input.value = this.lastValue;
        }
        appendToPropertyUL() {
            document_1.documentElements.get("property-list").appendChild(this.li);
        }
        set enabled(value) {
            const isDisabled = !value || !this.property.changeable;
            this.input.disabled = isDisabled;
            this.li.style.backgroundColor = (isDisabled) ? "#474747" : "#282828";
            const textColor = (isDisabled) ? "#a0a0a0" : "#ffffff";
            this.input.style.color = textColor;
            this.domNameLabel.style.color = textColor;
            this.domUnitLabel.style.color = textColor;
        }
    }
    exports.default = PropertyLI;
    class PropertyLIVector2 extends PropertyLI {
        constructor(property, name, propertyUnit, initialValue, title, showModulus, modulusUnit) {
            super(property, name, propertyUnit, /\-?\d*\.?\d*/g, initialValue, title);
            this.showModulus = showModulus;
            this.modulusUnit = modulusUnit;
            this.updateInputTitle(initialValue);
        }
        formatValue(value) {
            return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
        }
        processMatch(match) {
            if (!match[0] || !match[1]) {
                this.resetToLastString();
                return undefined;
            }
            return new vector2_1.default(Number(match[0]), Number(match[1]));
        }
        setValue(value) {
            super.setValue(value);
            this.updateInputTitle(value);
        }
        updateInputTitle(newValue) {
            if (this.showModulus)
                this.input.title = `Módulo: ${vector2_1.default.distance(vector2_1.default.zero, newValue)} ${this.modulusUnit}`;
        }
    }
    exports.PropertyLIVector2 = PropertyLIVector2;
    class PropertyLINumber extends PropertyLI {
        constructor(property, name, propertyUnit, initialValue, title) {
            super(property, name, propertyUnit, /\-?\d*\.?\d*/i, initialValue, title);
        }
        formatValue(value) {
            return value.toFixed(2);
        }
        processMatch(match) {
            if (!match[0]) {
                this.resetToLastString();
                return;
            }
            return Number(match[0]);
        }
    }
    exports.PropertyLINumber = PropertyLINumber;
});
