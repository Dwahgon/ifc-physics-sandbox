var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./vector2"], function (require, exports, vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    vector2_1 = __importDefault(vector2_1);
    class Vector2Calculator {
        constructor() {
        }
        sum(a, b) {
            return vector2_1.default.sum(a, b);
        }
        sub(a, b) {
            return vector2_1.default.sub(a, b);
        }
        mult(a, b) {
            return vector2_1.default.mult(a, b);
        }
        div(a, b) {
            return vector2_1.default.div(a, b);
        }
    }
    exports.Vector2Calculator = Vector2Calculator;
    Vector2Calculator.instance = new Vector2Calculator();
    class NumberCalculator {
        constructor() {
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
    }
    exports.NumberCalculator = NumberCalculator;
    NumberCalculator.instance = new NumberCalculator();
});
