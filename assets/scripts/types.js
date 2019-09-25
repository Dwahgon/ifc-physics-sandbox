define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading types");
    /* Enums */
    var ButtonColor;
    (function (ButtonColor) {
        ButtonColor["Dark"] = "dark-button";
        ButtonColor["White"] = "white-button";
        ButtonColor["InvisibleBackground"] = "invisible-bg-button";
    })(ButtonColor = exports.ButtonColor || (exports.ButtonColor = {}));
    var PhysicsObjectType;
    (function (PhysicsObjectType) {
        PhysicsObjectType[PhysicsObjectType["Solid"] = 0] = "Solid";
    })(PhysicsObjectType = exports.PhysicsObjectType || (exports.PhysicsObjectType = {}));
});
