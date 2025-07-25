import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './route/mongoRouter/uesrRoute';
import mysqluserRoutes from './route/mysqlRouter/auth.user';
import mysqlproductRoutes from './route/mongoRouter/productRouter';
import { connectDB } from './config/mongodb';
import { errorHandler } from './middleware/erroMiddleware';
import productRoutes from './route/mongoRouter/productRouter';
import {checkMySQLConnection} from './config/mysqldb';

dotenv.config();
connectDB();
checkMySQLConnection();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', mysqluserRoutes);
app.use('/api/products', productRoutes);
app.use('/api/prod', mysqlproductRoutes);
app.use(errorHandler); 

export default app;
