import Joi from 'joi';

/**
 * Validate user update data.
 *
 * @param {Object} data - The update data object.
 * @returns {Joi.ValidationResult} - The Joi validation result object.
 *
 * @example
 * const data = { name: 'Jane Doe', email: 'jane@example.com', age: 33 };
 * const result = validateUserUpdate(data);
 * console.log(result.error); // null
 * console.log(result.value); // { name: 'Jane Doe', email: 'jane@example.com', age: 33 }
 */
export const validateUserUpdate = (data) => {
	const schema = Joi.object({
		username: Joi.string().min(3).max(30),
	});

	return schema.validate(data);
};
