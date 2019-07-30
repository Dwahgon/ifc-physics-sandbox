define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("Loading types");
    var ButtonColor;
    (function (ButtonColor) {
        ButtonColor["Dark"] = "dark-button";
        ButtonColor["White"] = "white-button";
        ButtonColor["InvisibleBackground"] = "invisible-bg-button";
    })(ButtonColor = exports.ButtonColor || (exports.ButtonColor = {}));
    var PhysicsPropertyType;
    (function (PhysicsPropertyType) {
        PhysicsPropertyType[PhysicsPropertyType["All"] = 0] = "All";
        PhysicsPropertyType[PhysicsPropertyType["ObjectPosition"] = 1] = "ObjectPosition";
        PhysicsPropertyType[PhysicsPropertyType["ObjectAcceleration"] = 2] = "ObjectAcceleration";
        PhysicsPropertyType[PhysicsPropertyType["ObjectSize"] = 3] = "ObjectSize";
        PhysicsPropertyType[PhysicsPropertyType["ObjectArea"] = 4] = "ObjectArea";
        PhysicsPropertyType[PhysicsPropertyType["ObjectVelocity"] = 5] = "ObjectVelocity";
        PhysicsPropertyType[PhysicsPropertyType["ObjectDisplacement"] = 6] = "ObjectDisplacement";
    })(PhysicsPropertyType = exports.PhysicsPropertyType || (exports.PhysicsPropertyType = {}));
    var PhysicsObjectType;
    (function (PhysicsObjectType) {
        PhysicsObjectType[PhysicsObjectType["Solid"] = 0] = "Solid";
    })(PhysicsObjectType = exports.PhysicsObjectType || (exports.PhysicsObjectType = {}));
});
