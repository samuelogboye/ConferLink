import { RegisterRequestBody } from '@/common/interfaces/auth';
import { AppResponse, hashPassword } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { createUser, getUserByEmail, getUserByUsername } from '@/services/users';

export const register = catchAsync(async (req, res) => {
	const { email, username, password } = req.body as RegisterRequestBody;

	// check if user already exists
	const emailExist = await getUserByEmail(email);
	if (emailExist) {
		return AppResponse(res, 400, null, 'User already exists');
	}

	// check if username already exists
	const usernameExist = await getUserByUsername(username);
	if (usernameExist) {
		return AppResponse(res, 400, null, 'Username already exists');
	}

	const hashedPassword = await hashPassword(password);
	console.log("hashedPassword", hashedPassword)

	const user = await createUser({ email, username, password: hashedPassword });

	// Exclude password from the response
	const { password: _, ...userWithoutPassword } = user.toJSON();

	return AppResponse(res, 201, userWithoutPassword, 'User created successfully');
});