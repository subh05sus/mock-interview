import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { IQuestion } from '../models/Question';

dotenv.config();

interface AIFeedback {
  review: string;
  suggestions: string[];
  betterSolution?: string;
  explanation?: string;
}

export async function getAIFeedback(
  code: string,
  language: string,
  question: IQuestion
): Promise<AIFeedback> {
  try {
    const prompt = `
You are a senior software engineer reviewing code for a coding interview question.

QUESTION:
${question.title}

DESCRIPTION:
${question.description}

CONSTRAINTS:
${question.constraints.join('\n')}

SUBMITTED CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. A brief review of the code
2. 3-5 specific suggestions for improvement (performance, readability, etc.)
3. If a significantly better solution exists, provide it with an explanation

Format your response as JSON with the following structure:
{
  "review": "Your overall review here",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "betterSolution": "Better solution code here (if applicable)",
  "explanation": "Explanation of the better solution (if applicable)"
}
`;

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt
    });

    // Parse the JSON response
    try {
      const feedback = JSON.parse(text) as AIFeedback;
      return feedback;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback if parsing fails
      return {
        review: "We couldn't generate a detailed review at this time.",
        suggestions: ["Try optimizing your solution for better time complexity."],
      };
    }
  } catch (error) {
    console.error('AI feedback error:', error);
    return {
      review: "We couldn't generate a detailed review at this time.",
      suggestions: ["Try optimizing your solution for better time complexity."],
    };
  }
}
