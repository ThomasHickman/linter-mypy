"use strict";
const cp = require("child_process");
const path = require("path");
function getErrorPositionsFromStdout(text) {
    var lines = text.split("\n");
    var typeErrors = [];
    for (var line of lines) {
        var regExMatch = line.match(/^(.*):(\d*):(.*)/);
        if (regExMatch !== null) {
            typeErrors.push({
                lineNum: parseInt(regExMatch[2]),
                filePath: regExMatch[1],
                text: regExMatch[3]
            });
        }
    }
    return typeErrors;
}
module.exports = {
    provideLinter: () => {
        return {
            name: "linter-mypy",
            grammarScopes: ['source.python'],
            scope: "file",
            lint: (textEditor) => {
                return new Promise((resolve, reject) => {
                    var filePath = textEditor.getPath();
                    cp.exec(`mypy "${filePath}" -i`, (err, stdout, stderr) => {
                        if (err !== null) {
                            reject(err);
                            return;
                        }
                        if (stderr !== "") {
                            console.error(`<linter-gml>: STDERR: ${stderr}`);
                        }
                        var errors = getErrorPositionsFromStdout(stdout.toString());
                        resolve(errors.map(error => ({
                            type: "Error",
                            text: error.text,
                            range: [[error.lineNum - 1, 0], [error.lineNum, 0]],
                            filePath: path.resolve(path.dirname(filePath), error.filePath)
                        })));
                    });
                });
            }
        };
    }
};
