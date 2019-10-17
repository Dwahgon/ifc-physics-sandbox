import Vector2 from "./vector2";
import { VectorModulus } from "./types";

export default interface GenericCalculator<T> {
    sum(a: T, b: T): T;
    sub(a: T, b: T): T;
    mult(a: T, b: T): T;
    div(a: T, b: T): T;
}

export class Vector2Calculator implements GenericCalculator<Vector2>{
    public static readonly instance: GenericCalculator<any> = new Vector2Calculator();

    private constructor() { }

    sum(a: Vector2, b: Vector2): Vector2 {
        return a.add(b);
    }
    sub(a: Vector2, b: Vector2): Vector2 {
        return a.sub(b);
    }
    mult(a: Vector2, b: Vector2): Vector2 {
        return a.mult(b);
    }
    div(a: Vector2, b: Vector2): Vector2 {
        return a.div(b);
    }
}

export class NumberCalculator implements GenericCalculator<number>{
    public static readonly instance: GenericCalculator<any> = new NumberCalculator();

    private constructor() { }

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

export class VectorModulusCalculator implements GenericCalculator<VectorModulus> {
    public static readonly instance: GenericCalculator<any> = new VectorModulusCalculator();

    private constructor() { }

    sum(a: VectorModulus, b: VectorModulus): VectorModulus {
        return {
            modulus: a.modulus + b.modulus,
            vector: a.vector.add(b.vector)
        };
    }
    sub(a: VectorModulus, b: VectorModulus): VectorModulus {
        return {
            modulus: a.modulus - b.modulus,
            vector: a.vector.sub(b.vector)
        };
    }
    mult(a: VectorModulus, b: VectorModulus): VectorModulus {
        return {
            modulus: a.modulus * b.modulus,
            vector: a.vector.mult(b.vector)
        };
    }
    div(a: VectorModulus, b: VectorModulus): VectorModulus {
        return {
            modulus: a.modulus / b.modulus,
            vector: a.vector.div(b.vector)
        };
    }
}