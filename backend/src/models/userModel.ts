import type { IUser, UserMethods } from '@/common/interfaces';
import bcrypt from 'bcryptjs';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { hashPassword } from '@/common/utils';

type UserModel = Model<IUser, unknown, UserMethods>;

const userSchema = new mongoose.Schema<IUser, unknown, UserMethods>(
	{
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
		},
		email: {
			type: String,
			required: [true, 'Email field is required'],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			min: [8, 'Password must be at least 8 characters long'],
			required: [true, 'Password field is required'],
			select: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
			select: false,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * hash password before saving to the database only if the password is modified
 */
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await hashPassword(this.password as string);
	}

	next();
});

/**
 * Verify user password method
 * @param {HydratedDocument<IUser>} this - The hydrated document.
 * @param {string} enteredPassword - The entered password.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the password is valid.
 */
userSchema.method('verifyPassword', async function (this: HydratedDocument<IUser>, enteredPassword: string) {
	if (!this.password) {
		return false;
	}

	return await bcrypt.compare(enteredPassword, this.password);
});

export const UserModel = mongoose.model<IUser, UserModel>('User', userSchema);
