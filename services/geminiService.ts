
import { GoogleGenAI, Type } from "@google/genai";
import { Answer } from '../types';
import { FALLBACK_PART_2_QUESTIONS, FALLBACK_PART_3_QUESTIONS } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatAnswers = (answers: Answer[]): string => {
  return answers.map(a => `Q: ${a.question}\nA: ${a.value ? 'Yes' : 'No'}`).join('\n');
};

const getRandomQuestions = (questions: string[], count: number): string[] => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateQuestions = async (previousAnswers: Answer[]): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `You are a psychometric test designer for a surrealist academic experiment. 
  Based on the following user responses defining a character named 'Bob' (answered with 'Yes' or 'No'), generate exactly 10 new, increasingly absurd and philosophical questions to probe deeper.
  The questions must be direct Yes/No questions.
  The absurdity should be subtle at first, then escalate. Touch on themes of existence, consciousness, and the mundane.
  
  Previous answers:
  ${formatAnswers(previousAnswers)}
  
  Generate the next 10 questions.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions.slice(0, 10); // Ensure we only return 10
    }
    throw new Error("Invalid response format from API.");
  } catch (error) {
    console.warn("AI question generation failed. Using fallback questions.", error);
    // Determine which part we're generating for based on number of answers
    // 10 answers means we are generating for part 2
    // 20 answers means we are generating for part 3
    const partNumber = (previousAnswers.length / 10) + 1;

    if (partNumber === 2) {
      return getRandomQuestions(FALLBACK_PART_2_QUESTIONS, 10);
    } else if (partNumber === 3) {
      return getRandomQuestions(FALLBACK_PART_3_QUESTIONS, 10);
    } else {
      // This should not happen in the current app flow, but it's a good safeguard
      console.error("Attempted to generate fallback questions for an invalid part number:", partNumber);
      throw new Error("Failed to generate new questions. Please try again.");
    }
  }
};

export const generateSummary = async (allAnswers: Answer[]): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = `You are a research psychologist from a strange, esoteric university, writing a final report.
  Analyze the following personality quiz answers that define a character named 'Bob'. The answers are 'Yes' or 'No'.
  Write a detailed, analytical, and slightly absurd summary of Bob's personality.
  Use academic jargon, invent some pseudo-scientific concepts, and create some fictional statistics based on the provided answer patterns to make it sound official.
  The tone should be serious, but the subject matter is the user's definition of this fictional entity. Conclude with a definitive-sounding, yet ambiguous statement about Bob.

  Here are the complete answers:
  ${formatAnswers(allAnswers)}
  
  Produce the final psychometric profile for Bob.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate the final summary. Please try again.");
  }
};
