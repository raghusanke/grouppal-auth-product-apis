import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './route/uesrRoute';
import userRoutes from './route/auth.user';
import prodRoute from './route/product.route';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/erroMiddleware';
import productRoutes from './route/productRouter';
import {checkMySQLConnection} from './config/mysqldb';

dotenv.config();
connectDB();
checkMySQLConnection();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes); //using mysql
app.use('/api', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/prod', prodRoute);
app.use(errorHandler); // using mysql

export default app;
