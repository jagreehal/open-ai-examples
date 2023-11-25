module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'plugin:unicorn/all',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	ignorePatterns: ['**/dist/*'],
	rules: {
		'unicorn/filename-case': 'off',
		'unicorn/prefer-top-level-await': 'off',
	},
	env: {
		node: true,
	},
};
