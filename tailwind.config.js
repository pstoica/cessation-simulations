/** @type {import('tailwindcss').Config} */
module.exports ={
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'selector',
	theme: {
		extend: {},
		fontFamily: {
			sans: [
				'ui-sans-serif',
				'system-ui',
				'-apple-system',
				'BlinkMacSystemFont',
				'Segoe UI',
        'sans-serif'
			]
		}
	},
	future: {
		purgeLayersByDefault: true,
		removeDeprecatedGapUtilities: true
	},
	plugins: [require('@tailwindcss/typography')]
};
