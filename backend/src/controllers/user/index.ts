import { catchAsync } from '@/middlewares';
import { UserModel } from '@/models';
import { AppResponse } from '@/common/utils';

export const getUsers = catchAsync(async (req, res) => {
	const users = await UserModel.find();

	return AppResponse(res, 200, users, 'Data retrieved successfully');
});
