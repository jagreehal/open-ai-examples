import OpenAI from 'openai';
const openai = new OpenAI();

type ArithmeticOperations = {
	[key: string]: (object: NumberPair) => void;
};

type NumberPair = {
	num1: number;
	num2: number;
};

const functions: ArithmeticOperations = {
	add: (object: NumberPair) => {
		const sum = object.num1 + object.num2;
		console.log('Sum is', sum);
	},
	subtract: (object: NumberPair) => {
		const difference = object.num1 - object.num2;
		console.log('Difference is', difference);
	},
};

const response = await openai.chat.completions.create({
	model: 'gpt-3.5-turbo',
	temperature: 0,
	messages: [
		{
			role: 'system',
			content: 'You are a smart calculator.',
		},
		{
			role: 'user',
			content: 'How much is 2 add 2?',
		},
	],
	functions: [
		{
			name: 'add',
			description: 'Adds two numbers',
			parameters: {
				type: 'object',
				properties: {
					num1: {
						type: 'number',
					},
					num2: {
						type: 'number',
					},
				},
			},
		},
		{
			name: 'subtract',
			description: 'Subtracts two numbers',
			parameters: {
				type: 'object',
				properties: {
					num1: {
						type: 'number',
					},
					num2: {
						type: 'number',
					},
				},
			},
		},
	],
});

console.log(response.choices[0]);
const function_call = response.choices[0].message.function_call;

if (function_call) {
	const name = function_call.name;
	const arguments_ = JSON.parse(function_call.arguments);
	const fnc = functions[name];
	fnc(arguments_);
}
