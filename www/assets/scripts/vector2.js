define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading vector2");
    class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        toArray() {
            return [this.x, this.y];
        }
        add(v) {
            return new Vector2(this.x + v.x, this.y + v.y);
        }
        sub(v) {
            return new Vector2(this.x - v.x, this.y - v.y);
        }
        mult(v) {
            if (typeof (v) == "object")
                return new Vector2(this.x * v.x, this.y * v.y);
            if (typeof (v) == "number")
                return new Vector2(this.x * v, this.y * v);
            throw "v is not a number, neither a vector2";
        }
        div(v) {
            if (typeof (v) == "object")
                return new Vector2(this.x / v.x, this.y / v.y);
            if (typeof (v) == "number")
                return new Vector2(this.x / v, this.y / v);
            throw "v is not a number, neither a vector2";
        }
        magnitude() {
            return Math.hypot(this.x, this.y);
        }
        unit() {
            return this.div(this.magnitude());
        }
        inverse() {
            return this.mult(-1);
        }
        inverseX() {
            return this.mult(new Vector2(-1, 1));
        }
        inverseY() {
            return this.mult(new Vector2(1, -1));
        }
        toString() {
            return "(" + this.x + ", " + this.y + ")";
        }
        static fromJSON(json) {
            return new Vector2(json.x, json.y);
        }
        static get zero() {
            return new Vector2(0, 0);
        }
        static distance(a, b) {
            return Math.hypot(a.x - b.x, a.y - b.y);
        }
        static distanceSquared(a, b) {
            const dif = a.sub(b);
            return dif.x * dif.x + dif.y * dif.y;
        }
        static equals(a, b) {
            return a.x == b.x && a.y == b.y;
        }
        static getVectorDeterminant(a, b, c) {
            return (a.x * b.y + a.y * c.x + b.x * c.y) - (b.y * c.x + a.x * c.y + a.y * b.x);
        }
        static dotProduct(a, b) {
            return a.x * b.x + a.y * b.y;
        }
        /**
         * Returns the angle between two vectors in radians
         * @param a Vector 1
         * @param b Vector 2
         */
        static angleBetween(a, b) {
            return Math.acos(Vector2.dotProduct(a, b) / (a.magnitude() * b.magnitude()));
        }
    }
    exports.default = Vector2;
});
