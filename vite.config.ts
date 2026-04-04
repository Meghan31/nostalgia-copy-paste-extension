import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{ src: 'src/chrome-extension/manifest.json', dest: '.' },
				{ src: 'src/chrome-extension/public/16.png', dest: './public' },
				{ src: 'src/chrome-extension/public/32.png', dest: './public' },
				{ src: 'src/chrome-extension/public/48.png', dest: './public' },
				{ src: 'src/chrome-extension/public/192.png', dest: './public' },
				{ src: 'src/chrome-extension/public/pin-icon.png', dest: './public' },
				{
					src: 'src/chrome-extension/public/black-pin-icon.png',
					dest: './public',
				},
				{
					src: 'src/chrome-extension/public/white-pin-icon.png',
					dest: './public',
				},
				{ src: 'src/chrome-extension/public/black-copy.png', dest: './public' },
				{ src: 'src/chrome-extension/public/white-copy.png', dest: './public' },
				{ src: 'src/chrome-extension/public/delete.png', dest: './public' },
			],
		}),
	],
	server: {
		open: '/popup-local.html',
	},
	build: {
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'popup.html'),
				options: resolve(__dirname, 'options.html'),
			},
			output: {
				entryFileNames: '[name].js',
			},
		},
	},
});
