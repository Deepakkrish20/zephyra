import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token containing the payload.
 * @param {object} payload - The data to sign into the token.
 * @param {string} [expiresIn='24h'] - Expiration time.
 * @returns {string} The signed JWT token.
 */
export const generateToken = (payload, expiresIn = '24h') => {
  const secret = process.env.JWT_SECRET || 'development_fallback_secret_key_zephyra_123';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token.
 * @param {string} token - The token to verify.
 * @returns {object} The decoded token payload.
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'development_fallback_secret_key_zephyra_123';
  return jwt.verify(token, secret);
};
