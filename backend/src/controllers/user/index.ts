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

	if (!user) {
		return AppResponse(res, 404, null, 'User not found');
	}

	return AppResponse(res, 200, user, 'Data retrieved successfully');
});

export const getMe = catchAsync(async (req, res) => {
	const id  = req.user?._id as string;

	const user = await getUserById(id);

	if (!user) {
		return AppResponse(res, 404, null, 'User not found');
	}

	return AppResponse(res, 200, user, 'Data retrieved successfully');
});

export const updateUser = catchAsync(async (req, res) => {
	const { id } = req.params;

	// Validate the request body
	const { error } = validateUserUpdate(req.body); // Use a validator for the schema
	if (error) {
		logger.warn(`controller.user.updateUser(): Validation failed for ID: ${id} - ${error.message}`);
		return AppResponse(res, 400, null, `Validation error: ${error.message}`);
	}

	// Find the user by ID
	const user = await getUserById(id);
	if (!user) {
		logger.warn(`controller.user.updateUser(): User with ID: ${id} not found`);
		return AppResponse(res, 404, null, 'User not found');
	}

	logger.info(`controller.user.updateUser():  User ${user} with ID: ${id} about to be updated`);

	// Update the user with new data
	const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, { new: true });
	logger.info(`controller.user.updateUser():  User with ID: ${id} updated successfully`);

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
