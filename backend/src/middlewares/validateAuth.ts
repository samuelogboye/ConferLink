import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppResponse, logger } from '@/common/utils';
import { decodeToken } from '@/common/utils/jwtUtils';
import { getUserById } from '@/services/users';
import { LoginRequestBody, RegisterRequestBody } from '@/common/interfaces/auth';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	logger.info('validateAuth.authenticate(): Function Entry');

	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		logger.warn('Authorization header missing');
		return AppResponse(res, 401, null, 'Authorization header missing');
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		logger.warn('Token missing in authorization header');
		return AppResponse(res, 401, null, 'Token missing in authorization header');
	}

	try {
		const decoded = decodeToken(token);
		logger.info(`Token verified, decoding user ID: ${decoded.userId}`);

		const user = await getUserById(decoded.userId);
		if (!user) {
			logger.warn(`User with ID ${decoded.userId} not found`);
			return AppResponse(res, 404, null, 'User not found');
		}

		logger.info(`User with ID ${decoded.userId} authenticated successfully`);
		next();
	} catch (error) {
		const err = error as Error;
		logger.error(`Error during authentication: ${err.message}`);
		return AppResponse(res, 401, null, err.message);
	} finally {
		logger.info('validateAuth.authenticate(): Function Exit');
	}
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
	const schema = Joi.object<RegisterRequestBody>({
		username: Joi.string().min(3).max(30).required().messages({
			'string.min': 'Username must be at least 3 characters long',
			'string.max': 'Username cannot exceed 30 characters',
			'any.required': 'Username is required',
		}),
		email: Joi.string().email().required().messages({
			'string.email': 'Invalid email format',
			'any.required': 'Email is required',
		}),
		password: Joi.string().pattern(passwordRegex).required().messages({
			'string.pattern.base':
				'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character',
			'any.required': 'Password is required',
		}),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return AppResponse(res, 400, null, error.details[0].message);
	}
	next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
	const schema = Joi.object<LoginRequestBody>({
		email: Joi.string().email().required().messages({
			'string.email': 'Invalid email format',
			'any.required': 'Email is required',
		}),
		password: Joi.string().min(6).max(30).required().messages({
			'string.min': 'Password must be at least 6 characters long',
			'string.max': 'Password cannot exceed 30 characters',
			'any.required': 'Password is required',
		}),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return AppResponse(res, 400, null, error.details[0].message);
	}
	next();
};
