export const checkUserExists = 'SELECT id FROM users WHERE email = ? OR username = ?';

export const insertUser = `
  INSERT INTO users (username, email, password, address, phone, age, role, isAdmin)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

export const getUserByEmail = 'SELECT * FROM users WHERE email = ?';

export const getAllUsersQuery = `
  SELECT id, username, email, role, isAdmin FROM users
`;
