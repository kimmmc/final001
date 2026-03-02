"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = require("./config/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const SWAGGER_PORT = process.env.SWAGGER_PORT || 3002;
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
app.listen(SWAGGER_PORT, () => {
    console.log(`Swagger docs available at http://localhost:${SWAGGER_PORT}/api-docs`);
    console.log(`Production docs available at https://capstone1-60ax.onrender.com/api-docs`);
});
