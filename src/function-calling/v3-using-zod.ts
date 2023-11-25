import OpenAI from 'openai';
import {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
} from 'openai/resources/index.mjs';
import { ZodSchema, z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const openai = new OpenAI();

const AddParameters = z.object({
	num1: z.number(),
	num2: z.number(),
});

const SubtractParameters = z.object({
	num1: z.number(),
	num2: z.number(),
});

function zodParseJSON<T>(schema: ZodSchema<T>) {
	return (input: string): T => schema.parse(JSON.parse(input));
}

const add = ({ num1, num2 }: z.infer<typeof AddParameters>) => {
	return num1 + num2;
};

const subtract = ({ num1, num2 }: z.infer<typeof SubtractParameters>) => {
	return num1 - num2;
};

const functions = [
	{
		name: 'add',
		description: 'Adds two numbers',
		parameters: zodToJsonSchema(AddParameters),
		parse: zodParseJSON(AddParameters),
		function: add,
	},
	{
		name: 'subtract',
		description: 'Subtracts two numbers',
		parameters: zodToJsonSchema(SubtractParameters),
		parse: zodParseJSON(SubtractParameters),
		function: subtract,
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
