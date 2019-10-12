define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        toArray() {
            return [this.x, this.y];
        }
        clone() {
            return new Vector2(this.x, this.y);
        }
        magnitude() {
            return Math.hypot(this.x, this.y);
        }
        unit() {
            return Vector2.div(this, this.magnitude());
        }
        invert() {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        }
        invertX() {
            this.x = -this.x;
            return this;
        }
        invertY() {
            this.y = -this.y;
            return this;
        }
        toString() {
            return "(" + this.x + ", " + this.y + ")";
        }
        static get zero() {
            return new Vector2(0, 0);
        }
        static distance(a, b) {
            return Math.hypot(a.x - b.x, a.y - b.y);
        }
        static distanceSquared(a, b) {
            const dif = Vector2.sub(a, b);
            return dif.x * dif.x + dif.y * dif.y;
        }
        static sum(a, b) {
            return new Vector2(a.x + b.x, a.y + b.y);
        }
        static sub(a, b) {
            return new Vector2(a.x - b.x, a.y - b.y);
        }
        static mult(a, b) {
            if (typeof (a) == "number" && typeof (b) == "object")
                return new Vector2(a * b.x, a * b.y);
            if (typeof (a) == "object" && typeof (b) == "number")
                return new Vector2(a.x * b, a.y * b);
            if (typeof (a) == "object" && typeof (b) == "object")
                return new Vector2(a.x * b.x, a.y * b.y);
            throw "arguments 'a' and 'b' are either both numbers";
        }
        static div(a, b) {
            if (typeof (a) == "number" && typeof (b) == "object")
                return new Vector2(a / b.x, a / b.y);
            if (typeof (a) == "object" && typeof (b) == "number")
                return new Vector2(a.x / b, a.y / b);
            if (typeof (a) == "object" && typeof (b) == "object")
                return new Vector2(a.x / b.x, a.y / b.y);
            throw "arguments 'a' and 'b' are either both numbers";
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
        static inverse(a) {
            return Vector2.mult(a, -1);
        }
    }
    exports.default = Vector2;
});
