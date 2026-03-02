"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routeController_1 = require("../controllers/routeController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), validation_1.validateRoute, routeController_1.createRoute);
router.get('/', routeController_1.getAllRoutes);
router.get('/:id', routeController_1.getRouteById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), routeController_1.updateRoute);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), routeController_1.deleteRoute);
exports.default = router;
