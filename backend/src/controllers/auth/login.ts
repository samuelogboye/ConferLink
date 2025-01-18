import { AppResponse, logger } from '@/common/utils';
import { signToken } from '@/common/utils/jwtUtils';
import { catchAsync } from '@/middlewares';
import { getUserByEmail } from '@/services/users';

export const login = catchAsync(async (req, res) => {
	const { email, password } = req.body;

	// check if user exists
	const user = await getUserByEmail(email);
	if (!user) {
		return AppResponse(res, 404, null, 'User not found');
	}

	// check if password is correct
	const isPasswordCorrect = await user.verifyPassword(password);
	console.log("isPasswordCorrect", isPasswordCorrect)
	if (!isPasswordCorrect) {
		return AppResponse(res, 401, null, 'Invalid credentials');
	}

	logger.info('Generating JWT token');
	const token = signToken({ userId: user.id });

	return AppResponse(res, 200, { token }, 'Login successful');
});
