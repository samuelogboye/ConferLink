import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { AppResponse, logger } from '@/common/utils';
import { validateUserUpdate } from './userValidators';
import { getUserById } from '@/services/users';

export const getUsers = catchAsync(async (req, res) => {
	const users = await UserModel.find();

	return AppResponse(res, 200, users, 'Data retrieved successfully');
});

export const getUser = catchAsync(async (req, res) => {
	const { id } = req.params;

	const user = await getUserById(id);
	console.log(user);

	if (!user) {
		return AppResponse(res, 404, null, 'User not found');
	}

	return AppResponse(res, 200, user, 'Data retrieved successfully');
});

export const updateUser = catchAsync(async (req, res) => {
	const { id } = req.params;

	// Validate the request body
	const { error } = validateUserUpdate(req.body); // Use a validator for the schema
	logger.error(`error ${error}`);
	if (error) {
		logger.warn(`Validation failed for ID: ${id} - ${error.message}`);
		return AppResponse(res, 400, null, `Validation error: ${error.message}`);
	}

	// Find the user by ID
	const user = getUserById(id);
	if (!user) {
		logger.warn(`User with ID: ${id} not found`);
		return AppResponse(res, 404, null, 'User not found');
	}

	// Update the user with new data
	const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, { new: true });
	logger.info(`User with ID: ${id} updated successfully`);

	return AppResponse(res, 200, updatedUser, 'Data updated successfully');
});

export const deleteUser = catchAsync(async (req, res) => {
	const { id } = req.params;

	// Find the user by ID
	const user = await getUserById(id);
	if (!user) {
		return AppResponse(res, 404, null, 'User not found');
	}

	// Delete the user
	await UserModel.findByIdAndDelete(id);
	return AppResponse(res, 200, null, 'User deleted successfully');
});
