console.log("Loading physicsProperties");

import { PropertyEditorInputList, Vector2InputListRow, NumberInputListRow } from './document/propertyEditor';
import { PhysicsPropertyJSON } from './fileController';
import GenericCalculator, { NumberCalculator, Vector2Calculator, VectorModulusCalculator } from './genericCalulator';
import { PhysicsObject } from './physicsObjects';
import { CanvasRenderer } from './rendering/canvasRenderer';
import { Simulatable, PhysicsPropertyName, VectorModulus, VectorStyle } from './types';
import Vector2 from './vector2';

export default abstract class PhysicsProperty<T> implements Simulatable {
    public active: boolean;
    public propertyEditorInput: PropertyEditorInputList | null = null;
    public doDrawGizmos: boolean;

    protected static readonly DEFAULT_VECTOR_STYLE: VectorStyle = {
        style: "lightblue",
        strokeStyle: "black",
        strokeWidth: 2,
        
        lineWidth: 3,
        headAngle: Math.PI / 6,
        headLength: 10,
        
        rectDashOffset: [5, 5],
        rectStyle: "grey",
        rectThickness: 2
    }

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

    protected updateInputValue(value: T) {
        if (this.propertyEditorInput)
            this.propertyEditorInput.getInput()!.updateValue(value);
    }
}

export class ObjectPosition extends PhysicsProperty<Vector2>{
    constructor(
        initialPosition: Vector2,
        object: PhysicsObject
    ) {
        super("position", true, object, initialPosition, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new PropertyEditorInputList(this, "pos<sub>(x, y)</sub>", "Localização", 0, true, false, "Posição", 0);
        this.propertyEditorInput.addInput(new Vector2InputListRow("position", "m", initialPosition, true, false));

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
            canvasRenderer.drawingTools.drawVector(Vector2.zero, this.value, PhysicsProperty.DEFAULT_VECTOR_STYLE);
    }
}

export class ObjectSize extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;

    constructor(
        initialSize: Vector2,
        object: PhysicsObject
    ) {
        super("size", true, object, initialSize, Vector2.zero, Vector2Calculator.instance);

        this.propertyEditorInput = new PropertyEditorInputList(this, "tam<sub>(x, y)</sub>", "Dimensões", 1, true, false, "Tamanho", 1);
        this.propertyEditorInput.addInput(new Vector2InputListRow("size", "m", initialSize, true, false));

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
            const from = this.objectPosition.value.sub(this.value.div(2));    //from = objectPosition - objectSize / 2
            const to = this.objectPosition.value.add(this.value.div(2));      //to = objectPosition + objectSize / 2
            canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }
}

export class ObjectArea extends PhysicsProperty<number>{
    constructor(object: PhysicsObject) {
        super("area", false, object, 0, 0, NumberCalculator.instance);

        const objectSize = <PhysicsProperty<any>>object.getProperty("size");
        const sizeVector2 = (objectSize) ? objectSize.initialValue : Vector2.zero;
        this.initialValue = sizeVector2.x * sizeVector2.y;

        this.propertyEditorInput = new PropertyEditorInputList(this, "área", "Dimensões", 2, false, false, "Área", 2);
        this.propertyEditorInput.addInput(new NumberInputListRow("area", "m", this.initialValue, false, false));
    }
}

export class ObjectVelocity extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;
    private objectAcceleration: ObjectAcceleration | null;
    private objectCentripitalAcceleration: ObjectCentripetalAcceleration | null;

    constructor(object: PhysicsObject) {
        super("velocity", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance, 1);

        this.propertyEditorInput = new PropertyEditorInputList(this, "vel", "Cinemática", 2, true, false, "Vetor velocidade", 3);
        this.propertyEditorInput.addInput(new Vector2InputListRow("velocity", "<sup>m</sup>&frasl;<sub>s</sub>", this.initialValue, true, false, "m/s"));

        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
        this.objectAcceleration = <ObjectAcceleration>this.object.getProperty("acceleration");
        this.objectCentripitalAcceleration = <ObjectCentripetalAcceleration>this.object.getProperty("centripetalAcceleration");
    }

    simulate(step: 0): void {
        const posn = this.objectPosition ? this.objectPosition.value : null;
        const vn = this.value
        const an = this.objectAcceleration ? this.objectAcceleration.value : null;

        if (this.objectPosition && this.objectAcceleration)
            //objectPosition = posn + vn * step + (an * step ^ 2 / 2)
            this.objectPosition.value = posn!.add(vn.mult(step).add(an!.mult(step * step).div(2)));
            
            
        
        if (this.objectAcceleration){
            //Update the acceleration
            if(this.objectCentripitalAcceleration)
                this.objectCentripitalAcceleration.simulate();
            
            const anplus1 = this.objectAcceleration.value;
            const avgA = an!.add(anplus1).div(2);   //avgA = (an + anplus1) / 2

            //objectVelocity = vn + avgA * step
            this.value = vn.add(avgA.mult(step));
        }
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.value;
            const to = from.add(this.value);
            canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }
}

export class ObjectDisplacement extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;

    constructor(object: PhysicsObject) {
        super("displacement", false, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);

        this.propertyEditorInput = new PropertyEditorInputList(this, "des", "Cinemática", 5, false, false, "Vetor deslocamento", 4);
        this.propertyEditorInput.addInput(new Vector2InputListRow("displacement", "m", this.initialValue, false, false, "m"));

        this.objectPosition = <ObjectPosition>this.object.getProperty("position")!;
    }

    simulate(step: 0): void {
        if (this.objectPosition)
            this.value = this.objectPosition.value.sub(this.objectPosition.initialValue);
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.initialValue;
            const to = from.add(this.value);
            canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }
}

export class ObjectAcceleration extends PhysicsProperty<Vector2>{
    private objectPosition: ObjectPosition | null;

    constructor(object: PhysicsObject) {
        super("acceleration", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyEditorInput = new PropertyEditorInputList(this, "acel", "Cinemática", 3, true, false, "Vetor aceleração", 5);
        this.propertyEditorInput.addInput(new Vector2InputListRow("acceleration", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue, true, false, "m/s²"));


        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
    }

    drawGizmos(canvasRenderer: CanvasRenderer) {
        if (this.doDrawGizmos && this.objectPosition) {
            const from = this.objectPosition.value;
            const to = from.add(this.value);
            canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }
}

export class ObjectCentripetalAcceleration extends PhysicsProperty<VectorModulus> {
    private objectPosition: ObjectPosition | null;
    private objectAcceleration: ObjectAcceleration | null;

    constructor(object: PhysicsObject) {
        super("centripetalAcceleration", true, object, { vector: Vector2.zero, modulus: 0 }, { vector: Vector2.zero, modulus: 0 }, VectorModulusCalculator.instance, 2);

        this.propertyEditorInput = new PropertyEditorInputList(this, "acel<sub>c</sub>", "Cinemática", 4, true, false, "Vetor aceleração centrípeta", 6);
        this.propertyEditorInput.addInput(new NumberInputListRow("módulo", "m", 0, true, true));
        this.propertyEditorInput.addInput(new Vector2InputListRow("ponto", "m", Vector2.zero, true, true));

        this.objectPosition = <ObjectPosition>this.object.getProperty("position");
        this.objectAcceleration = <ObjectAcceleration>this.object.getProperty("acceleration");
    }

    simulate() {
        if (this.objectAcceleration && this.objectPosition && this.value.modulus != 0) {
            const pos = this.objectPosition.value;
            const dir = this.value.vector.sub(pos).unit();

            this.objectAcceleration.value = this.objectAcceleration.initialValue.add(dir.mult(this.value.modulus)); //objectAcceleration = objectAccelerationi + dir * modulus
        }
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
            const dir = this.value.vector.sub(from).unit();
            const to = from.add(dir.mult(this.value.modulus));
            canvasRenderer.drawingTools.drawVector(from, to, PhysicsProperty.DEFAULT_VECTOR_STYLE);
        }
    }

    protected updateInputValue(value: VectorModulus) {
        if (this.propertyEditorInput) {
            (<NumberInputListRow>this.propertyEditorInput.getInput("módulo")!).updateValue(value.modulus);
            (<Vector2InputListRow>this.propertyEditorInput.getInput("ponto")!).updateValue(value.vector);
        }
    }
}

export class ObjectMass extends PhysicsProperty<Number>{
    constructor(object: PhysicsObject){
        super("mass", true, object, 0, 0, NumberCalculator.instance);
        this.propertyEditorInput = new PropertyEditorInputList(this, "massa", "Geral", 3,  true, false, "Massa");
        this.propertyEditorInput.addInput(new NumberInputListRow("mass", "g", 0, true, false));
    }
}

// export class NetForce extends PhysicsProperty<Vector2>{
//     constructor(object: PhysicsObject){
//         super("netForce", true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
//         this.propertyEditorInput = new PropertyEditorInputList(this, "força<sub>t</sub>", "Cinemática", 4, true, false, "Vetor aceleração centrípeta", 6);
//         this.propertyEditorInput.addInput(new NumberInputListRow("módulo", "m", 0, true, true));
//     }
// }