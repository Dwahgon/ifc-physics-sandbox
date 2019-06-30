import Vector2 from "./vector2";

export default interface GenericCalculator<T>{
    sum(a: T, b: T): T;
    sub(a: T, b: T): T;
    mult(a: T, b: T): T;
    div(a: T, b: T): T;
}

export class Vector2Calculator implements GenericCalculator<Vector2>{
    public static readonly instance: GenericCalculator<any> = new Vector2Calculator();

    private constructor(){}

    sum(a: Vector2, b: Vector2): Vector2 {
        return Vector2.sum(a, b);
    }    
    sub(a: Vector2, b: Vector2): Vector2 {
        return Vector2.sub(a, b);
    }
    mult(a: Vector2, b: Vector2): Vector2 {
        return Vector2.mult(a, b);
    }
    div(a: Vector2, b: Vector2): Vector2 {
        return Vector2.div(a, b);
    }
}

export class NumberCalculator implements GenericCalculator<number>{
    public static readonly instance: GenericCalculator<any> = new NumberCalculator();

    private constructor(){}

    sum(a: number, b: number): number {
        return a + b;
    }    
    sub(a: number, b: number): number {
        return a - b;
    }
    mult(a: number, b: number): number {
        return a * b;
    }
    div(a: number, b: number): number {
        return a / b;
    }
}