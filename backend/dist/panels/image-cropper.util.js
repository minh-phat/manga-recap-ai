"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDegenerateNormalizedBox = isDegenerateNormalizedBox;
exports.isDegenerateBox = isDegenerateBox;
exports.clampBoundingBox = clampBoundingBox;
exports.cropRegion = cropRegion;
const sharp_1 = __importDefault(require("sharp"));
const MIN_BOX_FRACTION = 0.015;
const MIN_BOX_PIXELS = 8;
function isDegenerateNormalizedBox(box) {
    const { x, y, width, height } = box;
    if (!Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height)) {
        return true;
    }
    if (width <= MIN_BOX_FRACTION || height <= MIN_BOX_FRACTION) {
        return true;
    }
    if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) {
        return true;
    }
    return false;
}
function isDegenerateBox(bbox) {
    return bbox.width < MIN_BOX_PIXELS || bbox.height < MIN_BOX_PIXELS;
}
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