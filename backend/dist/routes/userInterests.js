"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userInterestController_1 = require("../controllers/userInterestController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, validation_1.validateUserInterest, userInterestController_1.createUserInterest);
router.get('/', auth_1.authenticate, userInterestController_1.getUserInterests);
router.put('/:id', validation_1.validateInterestStatus, userInterestController_1.updateUserInterest);
router.delete('/:id', auth_1.authenticate, userInterestController_1.deleteUserInterest);
exports.default = router;
