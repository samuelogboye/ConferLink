import jwt from 'jsonwebtoken';
import { ENVIRONMENT } from '../config';
import { logger } from './logger';

// Function to sign a JWT token
export const signToken = (payload: object, expiresIn: string = '1h'): string => {
	logger.info('jwtUtils.signToken(): Signing token');
	const token = jwt.sign(payload, ENVIRONMENT.APP.SECRET, { expiresIn });
	logger.info('jwtUtils.signToken(): Token signed successfully');
	return token;
};

// Function to decode a JWT token
export const decodeToken = (token: string): any => {
	try {
		logger.info('jwtUtils.decodeToken(): Decoding token');
		const decoded = jwt.verify(token, ENVIRONMENT.APP.SECRET);
		logger.info('jwtUtils.decodeToken(): Token decoded successfully');
		return decoded;
	} catch (error) {
		const err = error as Error;
		logger.error(`jwtUtils.decodeToken(): Error decoding token - ${err.message}`);
		throw new Error('Invalid or expired token');
	}
};
