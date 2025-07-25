export const countAllProducts = `
  SELECT COUNT(*) AS total FROM products
`;

export const paginatedProductList = `
  SELECT 
    p.id, p.name, p.description, p.price, p.category, p.in_stock, p.created_at,
    u.username AS created_by
  FROM products p
  JOIN users u ON p.user_id = u.id
  ORDER BY p.created_at DESC
  LIMIT ? OFFSET ?
`;

export const insertProduct = `
  INSERT INTO products (name, description, price, category, in_stock, user_id)
  VALUES (?, ?, ?, ?, ?, ?)
`;
