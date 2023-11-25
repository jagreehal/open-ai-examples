import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
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
] as const;

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

const runner = await openai.beta.chat.completions
	.runFunctions({
		model: 'gpt-3.5-turbo',
		messages,
		functions,
	})
	.on('message', (message) => console.log(message))
	.on('content', (diff) => process.stdout.write(diff));

const result = await runner.finalChatCompletion();
console.log(result.choices[0].message.content); //2 add 2 is equal to 4
