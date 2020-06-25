"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createEventMessage({ template, variables }) {
    return variables.reduce((result, variable) => {
        return result.replace(new RegExp(`{{${variable.name}}}`), variable.value);
    }, template);
}
module.exports = {
    createEventMessage
};
