import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    const storedToken = await redisClient.get(`token:${decoded.userId}`);
    if (!storedToken || storedToken !== token) {
      return res.status(403).json({ message: 'Invalid or expired session' });
    }

    (req as Request & { userId: string; role: string }).userId = decoded.userId;
    (req as Request & { userId: string; role: string }).role = decoded.role;

    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
