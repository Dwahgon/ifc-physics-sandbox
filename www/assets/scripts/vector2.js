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
        toString() {
            return "(" + this.x + ", " + this.y + ")";
        }
        static get zero() {
            return new Vector2(0, 0);
        }
        static distance(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
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
        static areColinear(a, b, c) {
            return (a.x * b.y + a.y * c.x + b.x * c.y) - (b.y * c.x + a.x * c.y + a.y * b.x) == 0;
        }
    }
    exports.default = Vector2;
});
