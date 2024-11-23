declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			// user?: Require_id<IUser>; // uncomment this if you want to use user in your routes , note: IUser is the interface of your user model
			file?: Express.Multer.File;
		}
	}
}

export {};
