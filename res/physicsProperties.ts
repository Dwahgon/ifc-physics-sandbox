console.log("Loading physicsProperties");

import { PropertyEditorForm, Vector2FormInput, NumberFormInput, FormInput } from './document/propertyEditor';
import { PhysicsPropertyJSON } from './fileController';
import GenericCalculator, { NumberCalculator, Vector2Calculator, VectorModulusCalculator } from './genericCalulator';
import { PhysicsObject } from './physicsObjects';
import { CanvasRenderer } from './rendering/canvasRenderer';
import Gizmos from './rendering/gizmos';
import { Simulatable, PhysicsPropertyName, VectorModulus } from './types';
import Vector2 from './vector2';

export default abstract class PhysicsProperty<T> implements Simulatable {
    public active: boolean;
    public propertyEditorInput: PropertyEditorForm | null = null;
    public doDrawGizmos: boolean;

    constructor(
        public readonly kind: PhysicsPropertyName,
        public readonly changeable: boolean,
        public readonly object: PhysicsObject,
        private iValue: T,
        private oValue: T,
        private genericCalculator: GenericCalculator<T>,
        public readonly simulationPriority: number = 0

    ) {
        this.active = true;
        this.doDrawGizmos = false;
    }

    get initialValue() {
        return this.iValue;
    }

    set initialValue(value: T) {
        this.iValue = value;
        this.updateInputValue(this.value);
    }

    get value() {
        return this.genericCalculator.sum(this.iValue, this.oValue);
    }

    set value(value: T) {
        this.oValue = this.genericCalculator.sub(value, this.iValue);
        this.updateInputValue(this.value);
    }

    onUserInput(formData: any[]) {
        this.initialValue = formData[0];
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
    }

    simulate(step: number): void {
    }

    reset(): void {
        this.value = this.initialValue;
    }

    toJSON(): PhysicsPropertyJSON<any> {
        return Object.assign({}, {
            kind: this.kind,
            iValue: this.iValue
        });
    }

    protected updateInputValue(value: T){
        if(this.propertyEditorInput)
            this.propertyEditorInput.getInput()!.updateValue(value);
    }
}

export class ObjectPosition extends PhysicsProperty<Vector2>{
    constructor(
        initialPosition: Vector2,
        object: PhysicsObject
    ) {
        super("position", true, object, initialPosition, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new PropertyEditorForm(this, "pos<sub>(x, y)</sub>", "Localização", 0, true, false, "Posição", 0);
        this.propertyEditorInput.addInput(new Vector2FormInput("position", "m", initialPosition, true, false));

        this.updateSpritePosition();
    }

    private updateSpritePosition(): void {
        this.object.sprite.drawPosition = this.value;
    }

    set initialValue(value: Vector2) {
        super.initialValue = value;
        this.updateSpritePosition();
    }

    get initialValue() {
        return super.initialValue;
    }

    get value(): Vector2 {
        return super.value;
    }

    set value(value: Vector2) {
        super.value = value;
        this.updateSpritePosition();
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos)
            Gizmos.drawPositionPoint(canvasRenderer, this.value, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, font: "italic 15px CMU Serif", pointRadius: 3 });
    }
}

export class ObjectSize extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;

    constructor(
        initialSize: Vector2,
        object: PhysicsObject
    ) {
        super("size", true, object, initialSize, Vector2.zero, Vector2Calculator.instance);

        this.propertyEditorInput = new PropertyEditorForm(this, "tam<sub>(x, y)</sub>", "Dimensões", 1, true, false, "Tamanho", 1);
        this.propertyEditorInput.addInput(new Vector2FormInput("size", "m", initialSize, true, false));

        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
        this.updateSpriteSize();
    }

    private updateSpriteSize(): void {
        this.object.sprite.drawSize = this.value;
    }

    set initialValue(value: Vector2) {
        super.initialValue = value;
        this.updateSpriteSize();

        // Change area
        const objArea = this.object.getProperty("area");
        if (objArea)
            (<PhysicsProperty<any>>objArea).initialValue = this.value.x * this.value.y;
    }

    get initialValue() {
        return super.initialValue;
    }

    get value(): Vector2 {
        return super.value;
    }

    set value(value: Vector2) {
        super.value = value;
        this.updateSpriteSize();
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = Vector2.sub(this.objectPosition.value, Vector2.div(this.value, 2));
            const to = Vector2.sum(this.objectPosition.value, Vector2.div(this.value, 2));
            Gizmos.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
        }
    }
}

export class ObjectArea extends PhysicsProperty<number>{
    constructor(object: PhysicsObject) {
        super("area", false, object, 0, 0, NumberCalculator.instance);
        
        const objectSize = <PhysicsProperty<any>>object.getProperty("size");
        const sizeVector2 = (objectSize) ? objectSize.initialValue : Vector2.zero;
        this.initialValue = sizeVector2.x * sizeVector2.y;

        this.propertyEditorInput = new PropertyEditorForm(this, "área", "Dimensões", 2, false, false, "Área", 2);
        this.propertyEditorInput.addInput(new NumberFormInput("area", "m", this.initialValue, false, false));
    }
}

export class ObjectVelocity extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;
    private objectAcceleration: ObjectAcceleration | null;

    constructor(object: PhysicsObject) {
        super("velocity", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance, 1);

        this.propertyEditorInput = new PropertyEditorForm(this, "vel", "Cinemática", 2, true, false, "Vetor velocidade", 3);
        this.propertyEditorInput.addInput(new Vector2FormInput("velocity", "<sup>m</sup>&frasl;<sub>s</sub>", this.initialValue, true, false, "m/s"));

        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
        this.objectAcceleration = <ObjectAcceleration>this.object.getProperty("acceleration");
    }

    simulate(step: 0): void {
        const currentVel = this.value;

        if (this.objectAcceleration)
            this.value = Vector2.sum(
                this.value, Vector2.mult(
                    this.objectAcceleration.value, step
                )
            );

        if (this.objectPosition && this.objectAcceleration) {

            this.objectPosition.value = Vector2.sum(
                this.objectPosition.value,
                Vector2.sum(
                    Vector2.mult(currentVel, step),
                    Vector2.div(
                        Vector2.mult(this.objectAcceleration.value, Math.pow(step, 2)),
                        2
                    )
                )
            );
        }
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.value;
            const to = Vector2.sum(from, this.value);
            Gizmos.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
        }
    }
}

export class ObjectDisplacement extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;

    constructor(object: PhysicsObject) {
        super("displacement", false, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        
        this.propertyEditorInput = new PropertyEditorForm(this, "des", "Cinemática", 5, false, false, "Vetor deslocamento", 4);
        this.propertyEditorInput.addInput(new Vector2FormInput("displacement", "m", this.initialValue, false, false, "m"));
        
        this.objectPosition = <ObjectPosition>this.object.getProperty("position")!;
    }

    simulate(step: 0): void {
        if (this.objectPosition)
            this.value = Vector2.sub(this.objectPosition.value, this.objectPosition.initialValue);
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.initialValue;
            const to = Vector2.sum(from, this.value);
            Gizmos.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
        }
    }
}

export class ObjectAcceleration extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;

    constructor(object: PhysicsObject) {
        super("acceleration", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new PropertyEditorForm(this, "acel", "Cinemática", 3, true, false, "Vetor aceleração", 5);
        this.propertyEditorInput.addInput(new Vector2FormInput("acceleration", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue, true, false, "m/s²"));


        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.value;
            const to = Vector2.sum(from, this.value);
            Gizmos.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
        }
    }
}

export class ObjectCentripetalAcceleration extends PhysicsProperty<VectorModulus> {
    private objectPosition: ObjectPosition | null;
    private objectAcceleration: ObjectAcceleration | null;

    constructor(object: PhysicsObject, active: boolean) {
        super("centripetalAcceleration", true, object, {vector: Vector2.zero, modulus: 0}, {vector: Vector2.zero, modulus: 0}, VectorModulusCalculator.instance, 2);
        
        this.propertyEditorInput = new PropertyEditorForm(this, "a<sub>c</sub>", "Cinemática", 4, true, true, "Vetor aceleração centrípeta", 6);
        this.propertyEditorInput.addInput(new NumberFormInput("módulo", "m", 0, true, true));
        this.propertyEditorInput.addInput(new Vector2FormInput("ponto", "m", Vector2.zero, true, true));

        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
        this.objectAcceleration = <ObjectAcceleration>this.object.getProperty("acceleration");

        this.active = active;
    }

    simulate() {
        if(this.objectAcceleration && this.active)
            this.objectAcceleration.value = Vector2.sub(Vector2.mult(this.value.vector.unit(), this.value.modulus), this.objectAcceleration.initialValue);
    }

    onUserInput(formData: any[]): void {
        this.initialValue = {
            modulus: formData[0],
            vector: formData[1]
        }
    }

    onUserToggle(v: boolean): void {
        this.active = v;
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.value;
            const to = Vector2.sum(from, Vector2.mult(Vector2.sub(this.value.vector, from).unit(), this.value.modulus));
            Gizmos.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
        }
    }

    protected updateInputValue(value: VectorModulus){
        if(this.propertyEditorInput){
            (<NumberFormInput>this.propertyEditorInput.getInput("módulo")!).updateValue(value.modulus);
            (<Vector2FormInput>this.propertyEditorInput.getInput("ponto")!).updateValue(value.vector);
        }
    }
}