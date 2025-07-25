import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mysqlDB } from '../../config/mysqldb';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../../middleware/mysql.auth.middleware';
import { MESSAGES } from '../../constants/messages';
import { STATUS_CODES } from '../../constants/statusCodes';
import {
  checkUserExists,
  insertUser,
  getUserByEmail,
  getAllUsersQuery,
} from '../../mysqlQueries/user.queries';
import redisClient from '../../config/redis';
import User from '../../models/User';
import { ApiError } from '../../utils/apiError';

export const register = (req: Request, res: Response) => {
  const { username, email, password, address, phone, age, role = 'user' } = req.body;
  const isAdmin = role === 'admin';

  mysqlDB.query(checkUserExists, [email, username], (err, results) => {
    if (err) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: MESSAGES.SERVER.ERROR });
    }

    if ((results as RowDataPacket[]).length > 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH.USER_EXISTS });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({ message: 'Password hashing failed' });
      }

      const values = [username, email, hashedPassword, address, phone, age, role, isAdmin];
      mysqlDB.query(insertUser, values, (err, result) => {
        if (err) {
          return res.status(STATUS_CODES.SERVER_ERROR).json({ message: MESSAGES.SERVER.ERROR });
        }

        res.status(STATUS_CODES.CREATED).json({
          message: MESSAGES.AUTH.REGISTER_SUCCESS,
          role,
          isAdmin,
        });
      });
    });
  });
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  mysqlDB.query(getUserByEmail, [email], (err, results) => {
    if (err) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: MESSAGES.SERVER.ERROR });
    }

    const users = results as RowDataPacket[];
    if (users.length === 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
    }

    const user = users[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
      );

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.AUTH.LOGIN_SUCCESS,
        token,
      });
    });
  });
};

export const getAllUsers = (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Access denied. Admins only.' });
  }

  mysqlDB.query(getAllUsersQuery, (err, results) => {
    if (err) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({ message: MESSAGES.SERVER.ERROR });
    }

    const users = results as RowDataPacket[];
    res.status(STATUS_CODES.OK).json({
      success: true,
      users,
      count: users.length,
    });
  });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;

    await redisClient.del(`token:${userId}`);
    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.AUTH.LOGOUT_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;

    const user = await User.findById(userId).select('-password');
    if (!user)
      return next(new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.AUTH.USER_NOT_FOUND));

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.AUTH.PROFILE_SUCCESS,
      user,
    });
  } catch (error) {
    next(error);
  }
};