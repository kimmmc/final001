"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pickupPointController_1 = require("../controllers/pickupPointController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), validation_1.validatePickupPoint, pickupPointController_1.createPickupPoint);
router.get('/', pickupPointController_1.getAllPickupPoints);
router.get('/:id', pickupPointController_1.getPickupPointById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), pickupPointController_1.updatePickupPoint);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), pickupPointController_1.deletePickupPoint);
exports.default = router;
