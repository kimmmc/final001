"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const predictionController_1 = require("../controllers/predictionController");
const router = express_1.default.Router();
router.post('/predict-traffic', predictionController_1.predictTraffic);
exports.default = router;
