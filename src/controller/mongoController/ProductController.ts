import { NextFunction, Request, Response } from "express";
import Product from "../../models/Products";
import { STATUS_CODES } from "../../constants/statusCodes";
import { MESSAGES } from "../../constants/messages";
import { CustomRequest } from "../../types/CustomRequest";
import redisClient from '../../config/redis';

export const createProduct = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const userId = req.userId;

    const product = new Product({
      name,
      description,
      price,
      category,
      inStock,
      createdBy: userId,
    });

    await product.save();


    await redisClient.del('products:all');

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'products:all';
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res
        .status(STATUS_CODES.OK)
        .json({ success: true, products: JSON.parse(cached), source: 'cache' });
    }

    const products = await Product.find().populate("createdBy", "username email");

    await redisClient.set(cacheKey, JSON.stringify(products), { EX: 60 }); 

    res.status(STATUS_CODES.OK).json({ success: true, products, source: 'db' });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const cacheKey = `products:${productId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, product: JSON.parse(cached), source: 'cache' });
    }

    const product = await Product.findById(productId).populate("createdBy", "username email");

    if (!product) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: MESSAGES.PRODUCT.NOT_FOUND });
    }

    await redisClient.set(cacheKey, JSON.stringify(product), { EX: 60 });

    res.json({ success: true, product, source: 'db' });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: MESSAGES.PRODUCT.NOT_FOUND });
    }

    await redisClient.del(`products:${productId}`);
    await redisClient.del('products:all');

    res.json({ success: true, message: MESSAGES.PRODUCT.DELETED });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, error });
  }
};


export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    const updated = await Product.findByIdAndUpdate(productId, req.body, {
      new: true,
    });

    if (!updated) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ success: false, message: MESSAGES.PRODUCT.NOT_FOUND });
    }

    await redisClient.del(`products:${productId}`);
    await redisClient.del('products:all');

    res.json({
      success: true,
      message: MESSAGES.PRODUCT.UPDATED,
      product: updated,
    });
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, error });
  }
};
