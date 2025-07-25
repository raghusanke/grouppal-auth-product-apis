import { Request, Response } from 'express';
import { mysqlDB } from '../../config/mysqldb';
import { AuthRequest } from '../../middleware/mysql.auth.middleware';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { STATUS_CODES } from '../../constants/statusCodes';
import { MESSAGES } from '../../constants/messages';
import { getPagination } from '../../utils/pagination';
import { countAllProducts, paginatedProductList, insertProduct } from '../../mysqlQueries/product.queries';

export const addProduct = (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Only admins can add products' });
  }

  const { name, description, price, category, in_stock = true } = req.body;

  if (!name || !price) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Name and price are required' });
  }

  const values = [name, description, price, category, in_stock, req.user.id];

  mysqlDB.query(insertProduct, values, (err, result) => {
    if (err) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER.ERROR,
        error: err,
      });
    }

    res.status(STATUS_CODES.CREATED).json({
      message: MESSAGES.PRODUCT.CREATED,
    });
  });
};

export const getAllProducts = (req: Request, res: Response) => {
  const { page, limit, offset } = getPagination(req.query.page as string, req.query.limit as string);

  mysqlDB.query(countAllProducts, (countErr, countResults) => {
    if (countErr) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.SERVER.ERROR,
        error: countErr,
      });
    }

    const total = (countResults as RowDataPacket[])[0].total;

    mysqlDB.query(paginatedProductList, [limit, offset], (err, results) => {
      if (err) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          success: false,
          message: MESSAGES.SERVER.ERROR,
          error: err,
        });
      }

      const products = results as RowDataPacket[];

      res.status(STATUS_CODES.OK).json({
        success: true,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    });
  });
};
