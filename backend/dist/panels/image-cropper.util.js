"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampBoundingBox = clampBoundingBox;
exports.cropRegion = cropRegion;
const sharp_1 = __importDefault(require("sharp"));
function clampBoundingBox(bbox, imageWidth, imageHeight) {
    const x = Math.max(0, Math.min(Math.round(bbox.x), imageWidth - 1));
    const y = Math.max(0, Math.min(Math.round(bbox.y), imageHeight - 1));
    const width = Math.max(1, Math.min(Math.round(bbox.width), imageWidth - x));
    const height = Math.max(1, Math.min(Math.round(bbox.height), imageHeight - y));
    return { x, y, width, height };
}
async function cropRegion(buffer, bbox) {
    return (0, sharp_1.default)(buffer)
        .extract({
        left: bbox.x,
        top: bbox.y,
        width: bbox.width,
        height: bbox.height,
    })
        .png()
        .toBuffer();
}
//# sourceMappingURL=image-cropper.util.js.map