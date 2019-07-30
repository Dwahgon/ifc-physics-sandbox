export default class Vector2{
    constructor(public x:number, public y: number){}

    toArray(): number[]{
        return [this.x, this.y];
    }

    clone(): Vector2{
        return new Vector2(this.x, this.y);
    }

    toString(){
        return "("+this.x+", "+this.y+")";
    }

    static get zero(): Vector2{
        return new Vector2(0, 0);
    }

    static distance(a: Vector2, b: Vector2): number{
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    static sum(a: Vector2, b: Vector2): Vector2{
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    static sub(a: Vector2, b: Vector2): Vector2{
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    static mult(a: Vector2 | number, b: Vector2 | number): Vector2{
        if(typeof(a) == "number" && typeof(b) == "object")
            return new Vector2(a * b.x, a * b.y);

        if(typeof(a) == "object" && typeof(b) == "number")
            return new Vector2(a.x * b, a.y * b);

        if(typeof(a) == "object" && typeof(b) == "object")
            return new Vector2(a.x * b.x, a.y * b.y);

        throw "arguments 'a' and 'b' are either both numbers";
    }

    static div(a: Vector2 | number, b: Vector2 | number): Vector2{
        if(typeof(a) == "number" && typeof(b) == "object")
            return new Vector2(a / b.x, a / b.y);

        if(typeof(a) == "object" && typeof(b) == "number")
            return new Vector2(a.x / b, a.y / b);

        if(typeof(a) == "object" && typeof(b) == "object")
            return new Vector2(a.x / b.x, a.y / b.y);
        
        throw "arguments 'a' and 'b' are either both numbers";
    }

    static equals(a: Vector2, b: Vector2): boolean{
        return a.x == b.x && a.y == b.y;
    }

    static areColinear(a: Vector2, b: Vector2, c: Vector2): boolean{
        return (a.x * b.y + a.y * c.x + b.x * c.y) - (b.y * c.x + a.x * c.y + a.y * b.x) == 0;
    }
}