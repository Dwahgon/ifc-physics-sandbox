var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./vector2"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const vector2_1 = __importDefault(require("./vector2"));
    class Vector2Calculator {
        constructor() { }
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
    Vector2Calculator.instance = new Vector2Calculator();
    exports.Vector2Calculator = Vector2Calculator;
    class NumberCalculator {
        constructor() { }
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
    NumberCalculator.instance = new NumberCalculator();
    exports.NumberCalculator = NumberCalculator;
});
