// import { Response, NextFunction } from 'express';
// import User from '../models/User';
// import { CustomRequest } from '../types/CustomRequest';
// export const isAdmin = async ( req: CustomRequest, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.userId;
//     if (!userId) return res.status(401).json({ message: 'Unauthorized' });

//     const user = await User.findById(userId);
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ message: 'Admin access required' });
//     }

//     next();
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err });
//   }
// };

import { Response, NextFunction } from 'express';
import { AuthRequest } from './mysql.auth.middleware'
import { mysqlDB } from '../config/mysqldb';
import { RowDataPacket } from 'mysql2';

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user.id;

  mysqlDB.query('SELECT isAdmin FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    const rows = results as RowDataPacket[];
    if (rows.length === 0 || !rows[0].isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  });
};
