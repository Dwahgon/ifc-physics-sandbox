var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    class Vector2Calculator {
        constructor() { }
        get zero() {
            return vector2_1.default.zero;
        }
        sum(a, b) {
            return a.add(b);
        }
        sub(a, b) {
            return a.sub(b);
        }
        mult(a, b) {
            return a.mult(b);
        }
        div(a, b) {
            return a.div(b);
        }
        fromJSON(json) {
            return new vector2_1.default(json.x, json.y);
        }
    }
    Vector2Calculator.instance = new Vector2Calculator();
    exports.Vector2Calculator = Vector2Calculator;
    class NumberCalculator {
        constructor() { }
        get zero() {
            return 0;
        }
        sum(a, b) {
            return a + b;
        }
        sub(a, b) {
            return a - b;
        }
        mult(a, b) {
            return a * b;
        }
        div(a, b) {
            return a / b;
        }
        fromJSON(json) {
            return json;
        }
    }
    NumberCalculator.instance = new NumberCalculator();
    exports.NumberCalculator = NumberCalculator;
    class TrackingVectorCalculator {
        constructor() { }
        get zero() {
            return {
                magnitude: 0,
                target: vector2_1.default.zero
            };
        }
        sum(a, b) {
            return {
                magnitude: a.magnitude + b.magnitude,
                target: a.target.add(b.target)
            };
        }
        sub(a, b) {
            return {
                magnitude: a.magnitude - b.magnitude,
                target: a.target.sub(b.target)
            };
        }
        mult(a, b) {
            return {
                magnitude: a.magnitude * b.magnitude,
                target: a.target.mult(b.target)
            };
        }
        div(a, b) {
            return {
                magnitude: a.magnitude / b.magnitude,
                target: a.target.div(b.target)
            };
        }
        fromJSON(json) {
            return { magnitude: json.magnitude, target: Vector2Calculator.instance.fromJSON(json.target) };
        }
    }
    TrackingVectorCalculator.instance = new TrackingVectorCalculator();
    exports.TrackingVectorCalculator = TrackingVectorCalculator;
});
