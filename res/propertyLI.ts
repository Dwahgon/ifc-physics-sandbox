console.log("Loading propertyLI");

import PhysicsProperty from './physicsProperties';
import Vector2 from './vector2';
import { documentElements } from './document';
import { Button } from './buttons';
import { ButtonColor } from './types';

export default abstract class PropertyLI<T>{
    public readonly li: HTMLLIElement;
    protected readonly input: HTMLInputElement;
    private readonly domNameLabel: HTMLLabelElement;
    private readonly domUnitLabel: HTMLLabelElement;
    protected lastValue: string;

    constructor(private property: PhysicsProperty<T>, name: string, propertyUnit: string, private regExp: RegExp, initialValue: T, title: string){
        this.li = document.createElement("li");
        this.input = document.createElement("input");
        this.domNameLabel = document.createElement("label");
        this.domUnitLabel = document.createElement("label");
        const descriptionButton = Button.createButtonElement({
            buttonName: `open-${property.kind}-description-button`, 
            buttonColor: ButtonColor.Dark, 
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

    setValue(value: T): void{
        const formattedValue = this.formatValue(value);
        this.input.value = formattedValue;
        this.lastValue = formattedValue;
    }

    private onInputChanged(): void{
        let match = this.input.value.match(this.regExp);
        
        if (!match){
            this.resetToLastString();
            return;
        }
        
        match = match.filter(el => {return el != ""});
        
        let matchResult = this.processMatch(match);
        
        if(!matchResult){
            this.resetToLastString();
            return;
        }
        
        this.property.initialValue = matchResult;
    }
    
    protected formatValue(value: T): string{
        throw "formatValue(value: T) has not been implemented";
    }

    protected processMatch(match: RegExpMatchArray): T | undefined{
        throw "processMatch(match: RegExpMatchArray): T has not been implemented"; 
    }

    resetToLastString(): void{
        this.input.value = this.lastValue;
    }

    appendToPropertyUL(): void{
        documentElements.get("property-list")!.appendChild(this.li);
    }

    set enabled(value: boolean){
        const isDisabled = !value || !this.property.changeable;

        this.input.disabled = isDisabled;
        this.li.style.backgroundColor = (isDisabled) ? "#474747" : "#282828";

        const textColor = (isDisabled) ? "#a0a0a0" : "#ffffff";
        this.input.style.color = textColor;
        this.domNameLabel.style.color = textColor;
        this.domUnitLabel.style.color = textColor;
    }
}

export class PropertyLIVector2 extends PropertyLI<Vector2>{
    constructor(property: PhysicsProperty<Vector2>, name: string, private propertyUnit: string, initialValue: Vector2, title: string, private showModulus: boolean, private modulusUnit?: string){
        super(property, name, `${propertyUnit}, ${propertyUnit}`, /\-?\d*\.?\d*/g, initialValue, title);
        this.updateInputTitle(initialValue);
    }

    protected formatValue(value: Vector2): string{
        return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
    }

    protected processMatch(match: RegExpMatchArray): Vector2 | undefined{
        if (!match[0] || !match[1]){
            this.resetToLastString();
            return undefined;
        }

        const vector2 = new Vector2(Number(match[0]), Number(match[1]));

        this.updateInputTitle(vector2);

        return vector2;
    }

    private updateInputTitle(newValue: Vector2){
        if(this.showModulus)
            this.input.title = `Módulo: ${Vector2.distance(Vector2.zero, newValue)} ${this.modulusUnit}`;
    }
}

export class PropertyLINumber extends PropertyLI<number>{
    constructor(property: PhysicsProperty<number>, name: string, propertyUnit: string, initialValue: number, title: string){
        super(property, name, propertyUnit, /\-?\d*\.?\d*/i, initialValue, title);
    }

    protected formatValue(value: number): string{
        return value.toFixed(2);
    }

    protected processMatch(match: RegExpMatchArray): number | undefined{
        if(!match[0]){
            this.resetToLastString();
            return;
        }

        return Number(match[0]);
    }
}