var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./vector2", "./document", "./types"], function (require, exports, vector2_1, document_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    console.log("Loading propertyLI");
    class PropertyLI {
        constructor(property, title, propertyUnit, regExp, initialValue) {
            this.property = property;
            this.regExp = regExp;
            this.li = document.createElement("li");
            this.input = document.createElement("input");
            this.domNameLabel = document.createElement("label");
            this.domUnitLabel = document.createElement("label");
            const descriptionButton = document.createElement("button");
            const descriptionIcon = document.createElement("img");
            descriptionIcon.src = "./assets/images/description.png";
            this.domNameLabel.innerHTML = title;
            this.domUnitLabel.innerHTML = propertyUnit;
            descriptionButton.appendChild(descriptionIcon);
            this.li.appendChild(descriptionButton);
            this.li.appendChild(this.domNameLabel);
            this.li.appendChild(this.input);
            this.li.appendChild(this.domUnitLabel);
            this.input.setAttribute("id", `${title}-property-input`);
            this.domNameLabel.setAttribute("for", `${title}-property-input`);
            descriptionButton.setAttribute("class", "button dark-button");
            descriptionButton.setAttribute("title", "Descrição");
            this.input.setAttribute("type", "text");
            descriptionButton.setAttribute("property-kind", this.property.kind.toString());
            descriptionButton.setAttribute("button-kind", types_1.DocumentButtonKind.PropertyButton);
            descriptionButton.querySelectorAll("*").forEach(el => {
                el.setAttribute("button-kind", types_1.DocumentButtonKind.PropertyButton);
                el.setAttribute("property-kind", this.property.kind.toString());
            });
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
        constructor(property, title, propertyUnit, initialValue) {
            super(property, title, propertyUnit, /\-?\d*\.?\d*/g, initialValue);
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
    }
    exports.PropertyLIVector2 = PropertyLIVector2;
    class PropertyLINumber extends PropertyLI {
        constructor(property, title, propertyUnit, initialValue) {
            super(property, title, propertyUnit, /\-?\d*\.?\d*/i, initialValue);
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
