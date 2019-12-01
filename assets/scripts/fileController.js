define(["require", "exports", "./document/documentUtilities"], function (require, exports, documentUtilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadJSON = function (data, filename, type) {
        const file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        //@ts-ignore
        else if (typeof cordova !== 'undefined' && cordova.platformId === "android") {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                fs.root.getDirectory('PIFisica', { create: true }, function (dirEntry) {
                    dirEntry.getFile(filename, { create: true, exclusive: false }, function (fileEntry) {
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onwriteend = function () {
                                documentUtilities_1.Alert.throwAlert("Ambiente salvo com sucesso! Você pode encontrá la em " + fileEntry.fullPath, documentUtilities_1.Alert.SUCCESS);
                            };
                            fileWriter.onerror = function (e) {
                                documentUtilities_1.Alert.throwAlert("Erro ao salvar ambiente: " + e.toString(), documentUtilities_1.Alert.ERROR);
                            };
                            fileWriter.write(file);
                        });
                    }, () => documentUtilities_1.Alert.throwAlert("Não foi possível criar arquivo", documentUtilities_1.Alert.ERROR));
                }, () => documentUtilities_1.Alert.throwAlert("Não foi possível criar diretório", documentUtilities_1.Alert.ERROR));
            }, () => documentUtilities_1.Alert.throwAlert("Não foi possível carregar sistema de arquvos", documentUtilities_1.Alert.ERROR));
        }
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
