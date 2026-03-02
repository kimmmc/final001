import express from 'express';
import dotenv from 'dotenv';
import { specs, swaggerUi } from './config/swagger';

dotenv.config();

const app = express();
const SWAGGER_PORT = process.env.SWAGGER_PORT || 3002;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(SWAGGER_PORT, () => {
  console.log(`Swagger docs available at http://localhost:${SWAGGER_PORT}/api-docs`);
  console.log(`Production docs available at https://capstone1-60ax.onrender.com/api-docs`);
}); 