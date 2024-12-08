// A type for the request body when registering a user
export interface RegisterRequestBody {
	username: string;
	email: string;
	password: string;
}

// A type for the request body when logging in a user
export interface LoginRequestBody {
	email: string;
	password: string;
}


export interface DecodeTokenResponse {
	userId: string;
	iat: number;
	exp: number;
}