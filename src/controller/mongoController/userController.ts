import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserType } from '../../models/User';
import dotenv from 'dotenv';
import { ApiError } from '../../utils/apiError';
import { MESSAGES } from '../../constants/messages';
import { STATUS_CODES } from '../../constants/statusCodes';
import redisClient from '../../config/redis';

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET!;

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, address, phone, age, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.AUTH.USER_EXISTS));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      age,
      role,
      isAdmin: role === UserType.ADMIN,
    });

    await newUser.save();

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return next(new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.AUTH.USER_NOT_FOUND));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return next(new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.AUTH.INVALID_CREDENTIALS));

    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: '1d',
    });

    await redisClient.set(`token:${user._id}`, token, {
      EX: 60 * 60 * 24, 
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      token,
    });
  } catch (error) {
    next(error);
  }
};
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = req as Request & { userId: string; role: string };

  try {
    if (role === 'admin') {
      const users = await User.find().select('-password');
      return res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'All users fetched successfully',
        users,
      });
    } else {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return next(new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.AUTH.USER_NOT_FOUND));
      }

      return res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.AUTH.PROFILE_SUCCESS,
        user,
      });
    }
  } catch (error) {
    next(error);
  }
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