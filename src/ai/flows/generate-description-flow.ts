
'use server';
/**
 * @fileOverview A flow to generate product descriptions.
 *
 * - generateDescription - A function that generates a product description based on a product name.
 * - GenerateDescriptionInput - The input type for the generateDescription function.
 * - GenerateDescriptionOutput - The return type for the generateDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDescriptionInputSchema = z.string();
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description, written in a warm and inviting tone, limited to 2-3 sentences.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;


export async function generateDescription(productName: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(productName);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: { schema: GenerateDescriptionInputSchema },
  output: { schema: GenerateDescriptionOutputSchema },
  prompt: `You are a marketing expert for an online store.
Given the product name below, generate a compelling, warm, and inviting product description.
The description should be concise, ideally 2-3 sentences long.

Product Name: {{{_value}}}
`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (productName) => {
    const { output } = await prompt(productName);
    return output!;
  }
);
