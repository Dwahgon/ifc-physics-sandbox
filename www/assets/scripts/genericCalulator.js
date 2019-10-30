define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Vector2Calculator {
        constructor() {
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
    class VectorModulusCalculator {
        constructor() {
        }
        sum(a, b) {
            return {
                modulus: a.modulus + b.modulus,
                vector: a.vector.add(b.vector)
            };
        }
        sub(a, b) {
            return {
                modulus: a.modulus - b.modulus,
                vector: a.vector.sub(b.vector)
            };
        }
        mult(a, b) {
            return {
                modulus: a.modulus * b.modulus,
                vector: a.vector.mult(b.vector)
            };
        }
        div(a, b) {
            return {
                modulus: a.modulus / b.modulus,
                vector: a.vector.div(b.vector)
            };
        }
    }
    exports.VectorModulusCalculator = VectorModulusCalculator;
    VectorModulusCalculator.instance = new VectorModulusCalculator();
});
