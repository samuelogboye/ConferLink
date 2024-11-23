export interface IEnvironment {
	APP: {
		NAME?: string;
		PORT: number;
		ENV?: string;
		CLIENT: string;
	};
	DB: {
		URL: string;
	};
}
