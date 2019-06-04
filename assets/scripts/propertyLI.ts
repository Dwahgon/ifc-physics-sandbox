import PhysicsProperty from 'physicsProperties';

export default abstract class PropertyLI<T>{
    public readonly li: HTMLLIElement;
    protected readonly input: HTMLInputElement;
    private readonly ul: HTMLUListElement;
    private readonly domNameLabel: HTMLLabelElement;
    private readonly domUnitLabel: HTMLLabelElement;
    protected lastValue: string;

    constructor(private property: PhysicsProperty<T>, title: string, propertyUnit: string, private regExp: RegExp, initialValue: T){
        this.ul = <HTMLUListElement>document.querySelector("#property-list");
        this.li = document.createElement("li");
        this.input = document.createElement("input");
        this.domNameLabel = document.createElement("label");
        this.domUnitLabel = document.createElement("label");

        this.domNameLabel.innerHTML = title;
        this.domUnitLabel.innerHTML = propertyUnit;

        this.li.appendChild(this.domNameLabel);
        this.li.appendChild(this.input);
        this.li.appendChild(this.domUnitLabel);

        this.input.setAttribute("type", "text");

        this.lastValue = "";
        this.setValue(initialValue);

        this.input.addEventListener("change", this.onInputChanged.bind(this));

        this.enabled = this.property.changeable;
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
        this.ul.appendChild(this.li);
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
    constructor(property: PhysicsProperty<Vector2>, title: string, propertyUnit: string, initialValue: Vector2){
        super(property, title, propertyUnit, /\-?\d*\.?\d*/g, initialValue);
    }

    protected formatValue(value: Vector2): string{
        return `(${value.x.toFixed(2)}, ${value.y.toFixed(2)})`;
    }

    protected processMatch(match: RegExpMatchArray): Vector2 | undefined{
        if (!match[0] || !match[1]){
            this.resetToLastString();
            return undefined;
        }

        return new Vector2(Number(match[0]), Number(match[1]));
    }
}

export class PropertyLINumber extends PropertyLI<number>{
    constructor(property: PhysicsProperty<number>, title: string, propertyUnit: string, initialValue: number){
        super(property, title, propertyUnit, /\-?\d*\.?\d*/i, initialValue);
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