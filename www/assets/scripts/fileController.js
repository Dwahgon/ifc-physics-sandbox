define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadJSON = function (data, filename, type) {
        const file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            const a = document.createElement("a");
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    };
    exports.loadJSON = function (onload) {
        const input = document.createElement("input");
        input.type = "file";
        input.addEventListener("change", () => {
            if (input.files) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.readAsText(file, "utf-8");
                reader.onload = ev => {
                    const result = ev.target.result;
                    onload(result);
                    input.remove();
                };
            }
        });
        input.click();
    };
});
