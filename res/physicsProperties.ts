console.log("Loading physicsProperties");

import GenericCalculator, { NumberCalculator, Vector2Calculator } from './genericCalulator';
import { PhysicsObject } from './physicsObjects';
import PropertyLI from './propertyLI';
import { PhysicsPropertyType } from './types';
import Vector2 from './vector2';
import { PropertyLINumber, PropertyLIVector2 } from './propertyLI';
import { PhysicsPropertyJSON } from './fileController';

export default abstract class PhysicsProperty<T>{
    public active: boolean;
    public propertyLI: PropertyLI<T> | null = null;
    private onValueChangedCallbacks: Function[];
    
    constructor(
        public readonly kind: PhysicsPropertyType,
        public readonly changeable: boolean,
        public readonly object: PhysicsObject,
        private iValue: T,
        private oValue: T,
        private genericCalculator: GenericCalculator<T>
    ){
        this.active = true;
        this.onValueChangedCallbacks = [];
    }

    get initialValue(){
        return this.iValue;
    }

    set initialValue(value: T){
        this.iValue = value;
        this.propertyLI!.setValue(this.value);
        this.onValueChangedCallbacks.forEach(callback => callback());
    }

    get value(){
        return this.genericCalculator.sum(this.iValue, this.oValue);
    }

    set value(value: T){
        this.oValue = this.genericCalculator.sub(value, this.iValue);
        this.propertyLI!.setValue(this.value);
        this.onValueChangedCallbacks.forEach(callback => callback());
    }

    simulateStep(step: number): void{
    }

    reset(): void{
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
    ){
        super(PhysicsPropertyType.ObjectPosition, true, object, initialPosition, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "pos<sub>(x, y)</sub>", "m, m", initialPosition);
        this.updateSpritePosition();
    }

    private updateSpritePosition(): void{
        this.object.sprite.drawPosition = this.value;
    }

    set initialValue(value: Vector2){
        super.initialValue = value;
        this.updateSpritePosition();
    }

    get initialValue(){
        return super.initialValue;
    }

    get value(): Vector2{
        return super.value;
    }
    
    set value(value: Vector2){
        super.value = value;
        this.updateSpritePosition();
    }
}

export class ObjectSize extends PhysicsProperty<Vector2>{
    constructor(
        initialSize: Vector2,
        object: PhysicsObject
    ){
        super(PhysicsPropertyType.ObjectSize, true, object, initialSize, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "tam<sub>(x, y)</sub>", "m, m", initialSize);
        this.updateSpriteSize();
    }

    private updateSpriteSize(): void{
        this.object.sprite.drawSize = this.value;
    }

    set initialValue(value: Vector2){
        super.initialValue = value;
        this.updateSpriteSize();

        // Change area
        const objArea = this.object.getProperty(PhysicsPropertyType.ObjectArea);
        if(objArea)
            (<PhysicsProperty<any>>objArea).initialValue = this.value.x * this.value.y;
    }
    
    get initialValue(){
        return super.initialValue;
    }

    get value(): Vector2{
        return super.value;
    }

    set value(value: Vector2){
        super.value = value;
        this.updateSpriteSize();
    }
}

export class ObjectArea extends PhysicsProperty<number>{
    constructor(object: PhysicsObject){
        super(PhysicsPropertyType.ObjectArea, false, object, 0, 0, NumberCalculator.instance);
        this.propertyLI = new PropertyLINumber(this, "área", "m<sup>2</sup>", 0);
        
        const objectSize = <PhysicsProperty<any>> object.getProperty(PhysicsPropertyType.ObjectSize);
        const sizeVector2 = (objectSize) ? objectSize.initialValue : Vector2.zero;
        this.initialValue = sizeVector2.x * sizeVector2.y;
    }
}

export class ObjectVelocity extends PhysicsProperty<Vector2>{
    constructor(object: PhysicsObject){
        super(PhysicsPropertyType.ObjectVelocity, true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "velocidade", "<sup>m</sup>&frasl;<sub>s</sub>, <sup>m</sup>&frasl;<sub>s</sub>", Vector2.zero);
    }

    simulateStep(step: 0): void{
        const displacement = Vector2.mult(this.value, step);
        
        const objectPosition = this.object.getProperty(PhysicsPropertyType.ObjectPosition);
        const objectDisplacement = this.object.getProperty(PhysicsPropertyType.ObjectDisplacement);

        //add displacement to objectdisplacement
        if(objectDisplacement)
            (<ObjectDisplacement>objectDisplacement).value += Vector2.distance(Vector2.zero, displacement);

        //displace object
        if(objectPosition)
            (<ObjectPosition>objectPosition).value = Vector2.sum(displacement, (<ObjectPosition>objectPosition).value);
    }
}

export class ObjectDisplacement extends PhysicsProperty<number>{
    constructor(object: PhysicsObject){
        super(PhysicsPropertyType.ObjectDisplacement, false, object, 0, 0, NumberCalculator.instance);
        this.propertyLI = new PropertyLINumber(this, "deslocamento", "m", 0);
    }
}

export class ObjectAcceleration extends PhysicsProperty<Vector2>{
    constructor(object: PhysicsObject){
        super(PhysicsPropertyType.ObjectAcceleration, true, object, Vector2.zero, Vector2.zero, Vector2Calculator.instance);
        this.propertyLI = new PropertyLIVector2(this, "acel", "<sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>, <sup>m</sup>&frasl;<sub>s<sup>2</sup></sub>", this.initialValue);
    }

    simulateStep(step: 0): void{
        const objectVel = this.object.getProperty(PhysicsPropertyType.ObjectVelocity);
        const velDisplacement = Vector2.mult(this.value, step);

        if(objectVel)
            (<ObjectVelocity>objectVel).value = Vector2.sum(velDisplacement, (<ObjectVelocity>objectVel).value);
    }
}

