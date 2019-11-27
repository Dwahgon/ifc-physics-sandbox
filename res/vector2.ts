console.log("Loading vector2");

interface Vector2JSON{
    x: number;
    y: number;
}

export default class Vector2 {
    constructor(public x: number, public y: number) { }

    toArray(): number[] {
        return [this.x, this.y];
    }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mult(v: Vector2 | number): Vector2 {
        if (typeof (v) == "object")
            return new Vector2(this.x * v.x, this.y * v.y);

        if (typeof (v) == "number")
            return new Vector2(this.x * v, this.y * v);

        throw "v is not a number, neither a vector2";
    }

    div(v: Vector2 | number): Vector2 {
        if (typeof (v) == "object")
            return new Vector2(this.x / v.x, this.y / v.y);

        if (typeof (v) == "number")
            return new Vector2(this.x / v, this.y / v);

        throw "v is not a number, neither a vector2";
    }

    magnitude(): number {
        return Math.hypot(this.x, this.y);
    }

    unit(): Vector2 {
        return this.div(this.magnitude());
    }

    inverse(): Vector2 {
        return this.mult(-1);
    }

    inverseX(): Vector2 {
        return this.mult(new Vector2(-1, 1));
    }

    inverseY(): Vector2 {
        return this.mult(new Vector2(1, -1));
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    static fromJSON(json: Vector2JSON){
        return new Vector2(json.x, json.y)
    }

    static get zero(): Vector2 {
        return new Vector2(0, 0);
    }

    static distance(a: Vector2, b: Vector2): number {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    static distanceSquared(a: Vector2, b: Vector2) {
        const dif = a.sub(b);
        return dif.x * dif.x + dif.y * dif.y;
    }

    static equals(a: Vector2, b: Vector2): boolean {
        return a.x == b.x && a.y == b.y;
    }

    static getVectorDeterminant(a: Vector2, b: Vector2, c: Vector2): number {
        return (a.x * b.y + a.y * c.x + b.x * c.y) - (b.y * c.x + a.x * c.y + a.y * b.x);
    }

    static dotProduct(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * Returns the angle between two vectors in radians
     * @param a Vector 1
     * @param b Vector 2
     */
    static angleBetween(a: Vector2, b: Vector2): number {
        return Math.acos(Vector2.dotProduct(a, b) / (a.magnitude() * b.magnitude()));
    }
}