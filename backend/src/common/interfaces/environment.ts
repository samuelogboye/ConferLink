export interface IEnvironment {
	APP: {
		NAME?: string;
		PORT: number;
		ENV?: string;
		CLIENT: string;
		SECRET: string;
	};
	DB: {
		URL: string;
	};
}
