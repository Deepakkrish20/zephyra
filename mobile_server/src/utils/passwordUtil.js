import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The bcrypt hashed password.
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password.
 * @param {string} password - The plain text password to check.
 * @param {string} hashedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} True if matching, false otherwise.
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
