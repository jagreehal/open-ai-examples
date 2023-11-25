import OpenAI from 'openai';
import {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
} from 'openai/resources/index.mjs';

const openai = new OpenAI();

type NumberPair = {
	num1: number;
	num2: number;
};

const add = (object: NumberPair) => {
	return object.num1 + object.num2;
};

const subtract = (object: NumberPair) => {
	return object.num1 - object.num2;
};

const functions: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [
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
];

async function callFunction(
	function_call: ChatCompletionMessage.FunctionCall,
): Promise<any> {
	const arguments_ = JSON.parse(function_call.arguments!);
	switch (function_call.name) {
		case 'add': {
			return await add(arguments_);
		}

		case 'subtract': {
			return await subtract(arguments_);
		}

		default: {
			throw new Error('No function found');
		}
	}
}

const messages: ChatCompletionMessageParam[] = [
	{
		role: 'system',
		content: 'You are a smart calculator.',
	},
	{
		role: 'user',
		content: 'How much is 2 add 2?',
	},
];

console.log(messages[0]);
console.log(messages[1]);

// this is loop until there are no more function calls
while (true) {
	const response = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		temperature: 0,
		messages,
		functions,
	});

	const message = response.choices[0]!.message;
	messages.push(message);
	console.log(message);
	if (message.function_call) {
		const result = await callFunction(message.function_call);
		const secondMessage = {
			role: 'function' as const,
			name: message.function_call.name!,
			content: JSON.stringify(result),
		};
		messages.push(secondMessage);
	} else {
		console.log(`No function call, we're done`);
		console.log(messages.at(-1)?.content);

		break;
	}
}
