import { IUser } from '@/common/interfaces';
import { UserModel } from '@/models';

export const getUserById = async (id: string) => {
	return await UserModel.findById(id);
};

export const getAllUsers = async () => {
	return await UserModel.find();
};

export const getUserByEmail = async (email: string) => {
	return await UserModel.findOne({ email });
};

export const getUserByUsername = async (username: string) => {
    return await UserModel.findOne({ username });
};

export const createUser = async (user: IUser) => {
	return await UserModel.create(user);
};
