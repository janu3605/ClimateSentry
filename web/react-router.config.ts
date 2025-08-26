type Config = {
	appDirectory: string;
	ssr: boolean;
	prerender: string[];
};

export default {
	appDirectory: './src/app',
	ssr: true,
	prerender: ['/*?'],
} satisfies Config;
