
'use server';
/**
 * @fileOverview A flow to generate product descriptions.
 *
 * - generateDescription - A function that generates a product description based on product details.
 * - GenerateDescriptionInput - The input type for the generateDescription function.
 * - GenerateDescriptionOutput - The return type for the generateDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  price: z.string().describe('The price of the product.'),
  stock: z.string().describe('The stock quantity of the product.'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description, written in a warm and inviting tone, limited to 2-3 sentences.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;


export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: { schema: GenerateDescriptionInputSchema },
  output: { schema: GenerateDescriptionOutputSchema },
  prompt: `You are a marketing expert for an online store.
Given the product details below, generate a compelling, warm, and inviting product description.
The description should be concise, ideally 2-3 sentences long.
If the stock is low (e.g., less than 20), you can add a sentence that creates a sense of urgency.
If the price is particularly low or a good value, you can mention it.

Product Details:
- Name: {{{name}}}
- Price: GHS {{{price}}}
- Stock: {{{stock}}}
`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
