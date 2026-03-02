"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const busLocationController_1 = require("../controllers/busLocationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/update', auth_1.authenticate, (0, auth_1.authorize)('driver'), validation_1.validateBusLocation, busLocationController_1.updateBusLocation);
router.get('/:busId', busLocationController_1.getBusLocation);
router.get('/', busLocationController_1.getAllBusLocations);
router.get('/:busId/history', busLocationController_1.getBusLocationHistory);
router.get('/nearby/search', busLocationController_1.getNearbyBuses);
router.post('/driver/status', auth_1.authenticate, (0, auth_1.authorize)('driver'), validation_1.validateDriverStatus, busLocationController_1.setDriverOnlineStatus);
exports.default = router;
