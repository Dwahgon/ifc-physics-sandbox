console.log("Loading physicsProperties");

import { NumberPropertyEditorInput, PropertyEditorInput, Vector2PropertyEditorInput } from './document/propertyEditor';
import { PhysicsPropertyJSON } from './fileController';
import GenericCalculator, { NumberCalculator, Vector2Calculator } from './genericCalulator';
import { PhysicsObject } from './physicsObjects';
import { CanvasRenderer } from './rendering/canvasRenderer';
import Gizmos from './rendering/gizmos';
import { PhysicsPropertyType, Simulatable } from './types';
import Vector2 from './vector2';

export default abstract class PhysicsProperty<T> implements Simulatable {
    public active: boolean;
    public propertyEditorInput: PropertyEditorInput<T> | null = null;
    public doDrawGizmos: boolean;
    private onValueChangedCallbacks: Function[];

    constructor(
        public readonly kind: PhysicsPropertyType,
        public readonly changeable: boolean,
        public readonly object: PhysicsObject,
        private iValue: T,
        private oValue: T,
        private genericCalculator: GenericCalculator<T>,
        public readonly simulationPriority: number = 0

    ) {
        this.active = true;
        this.onValueChangedCallbacks = [];
        this.doDrawGizmos = false;
    }

    get initialValue() {
        return this.iValue;
    }

    set initialValue(value: T) {
        this.iValue = value;
        this.propertyEditorInput!.updateValue(this.value);
        this.onValueChangedCallbacks.forEach(callback => callback());
    }

    get value() {
        return this.genericCalculator.sum(this.iValue, this.oValue);
    }

    set value(value: T) {
        this.oValue = this.genericCalculator.sub(value, this.iValue);
        this.propertyEditorInput!.updateValue(this.value);
        this.onValueChangedCallbacks.forEach(callback => callback());
    }

    onUserInput(value: T) {
        this.initialValue = value;
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
}

export class ObjectPosition extends PhysicsProperty<Vector2>{
    constructor(
        initialPosition: Vector2,
        object: PhysicsObject
    ) {
        super(PhysicsPropertyType.ObjectPosition, true, object, initialPosition, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new Vector2PropertyEditorInput(this, "pos<sub>(x, y)</sub>", "m", "Localização", 0, true, initialPosition, "Posição",this.kind);
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
        super(PhysicsPropertyType.ObjectSize, true, object, initialSize, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new Vector2PropertyEditorInput(this, "tam<sub>(x, y)</sub>", "m", "Dimensões", 1, true, initialSize, "Tamanho", this.kind);
        this.objectPosition = <ObjectPosition>this.object.getProperty(PhysicsPropertyType.ObjectPosition);
        this.updateSpriteSize();
    }

    private updateSpriteSize(): void {
        this.object.sprite.drawSize = this.value;
    }

    set initialValue(value: Vector2) {
        super.initialValue = value;
        this.updateSpriteSize();

        // Change area
        const objArea = this.object.getProperty(PhysicsPropertyType.ObjectArea);
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
        super(PhysicsPropertyType.ObjectArea, false, object, 0, 0, NumberCalculator.instance);
        this.propertyEditorInput = new NumberPropertyEditorInput(this, "área", "m", "Dimensões", 2, false, 0, "Área", this.kind);

        const objectSize = <PhysicsProperty<any>>object.getProperty(PhysicsPropertyType.ObjectSize);
        const sizeVector2 = (objectSize) ? objectSize.initialValue : Vector2.zero;
        this.initialValue = sizeVector2.x * sizeVector2.y;
    }
}

export class ObjectVelocity extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;
    private objectAcceleration: ObjectAcceleration | null;

    constructor(object: PhysicsObject) {
        super(PhysicsPropertyType.ObjectVelocity, true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance, 1);

        this.propertyEditorInput = new Vector2PropertyEditorInput(this, "vel", "<sup>m</sup>&frasl;<sub>s</sub>", "Cinemática", 2, true, Vector2.zero,  "Vetor velocidade", this.kind, "m/s");

        this.objectPosition = <ObjectPosition>this.object.getProperty(PhysicsPropertyType.ObjectPosition);
        this.objectAcceleration = <ObjectAcceleration>this.object.getProperty(PhysicsPropertyType.ObjectAcceleration);
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
        super(PhysicsPropertyType.ObjectDisplacement, false, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new Vector2PropertyEditorInput(this, "des", "m", "Cinemática", 4, false, Vector2.zero, "Vetor deslocamento", this.kind, "m");
        this.objectPosition = <ObjectPosition>this.object.getProperty(PhysicsPropertyType.ObjectPosition)!;
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
        super(PhysicsPropertyType.ObjectAcceleration, true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new Vector2PropertyEditorInput(this, "acel", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", "Cinemática", 3, true, this.initialValue, "Vetor aceleração", this.kind, "m/s²");

        this.objectPosition = <ObjectPosition>this.object.getProperty(PhysicsPropertyType.ObjectPosition);
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.value;
            const to = Vector2.sum(from, this.value);
            Gizmos.drawVector(canvasRenderer, from, to, { style: "lightblue", strokeStyle: "black", strokeThickness: 2, lineThickness: 2, headLength: 10 });
        }
    }
}

