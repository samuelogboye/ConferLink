import type { IEnvironment } from '@/common/interfaces';

export const ENVIRONMENT: IEnvironment = {
	APP: {
		NAME: process.env.APP_NAME,
		PORT: parseInt(process.env.PORT || process.env.APP_PORT || '3000'),
		ENV: process.env.NODE_ENV,
		CLIENT: process.env.FRONTEND_URL!,
	},
	DB: {
		URL: process.env.DB_URL!,
	},
};
