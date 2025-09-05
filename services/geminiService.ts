import { GoogleGenAI, Type } from "@google/genai";

const COMIC_SYSTEM_INSTRUCTION = `You are the wise Headmaster of the Animal Academy, an institution where animal experts explain complex concepts to learners of all ages. Your goal is to be clear, educational, and engaging.
For any given topic, you must produce a single JSON object with two main properties: "explanation" and "comic_script".

1.  **explanation**:
    *   This should be a well-structured, encyclopedic overview of the topic, written in clear and accessible language using plain text with newline characters for paragraphs and lists.
    *   It MUST include the following details where applicable:
        *   A brief, one-sentence summary.
        *   The origin and history of the concept.
        *   The core meaning and definition.
        *   The key person or group who created or popularized it.
        *   Important related concepts or context.

2.  **comic_script**:
    *   This must be a script for a comic strip that visually demonstrates or explores a deeper aspect of the topic. It should feature animals teaching or illustrating the concept in a metaphorical or literal way (e.g., a beaver explaining engineering, a chameleon demonstrating adaptation).
    *   The script must be an array of JSON objects, with each object representing one panel.
    *   You must decide the number of panels based on the topic's complexity, using between 4 and 8 panels. A simple topic might need 4, while a complex one might need 8.
    *   Each object must have two properties:
        a. "narrative": A very short, insightful caption for the panel (under 15 words).
        b. "image_prompt": A detailed description for an image generator. The prompt MUST start with 'clean, minimalist, educational vector illustration of...'. It should describe a clear scene featuring animals that visually explains the panel's point.

The final output MUST be a single JSON object that strictly follows the provided schema. The tone should be educational, clear, and charming.`;

interface ComicPanelScript {
  narrative: string;
  image_prompt: string;
}

export interface ComicPanelData {
    narrative: string;
    imageUrl: string;
}

export interface ConceptExplanation {
    explanation: string;
    comicPanels: ComicPanelData[];
}

export const generateAcademyLesson = async (topic: string): Promise<ConceptExplanation> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Step 1: Generate the explanation and comic script in one call
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please create an explanation and comic script about: ${topic}.`,
            config: {
                systemInstruction: COMIC_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        explanation: { type: Type.STRING },
                        comic_script: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    narrative: { type: Type.STRING },
                                    image_prompt: { type: Type.STRING },
                                },
                                required: ['narrative', 'image_prompt'],
                            },
                        },
                    },
                    required: ['explanation', 'comic_script'],
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr);
        const { explanation, comic_script } = parsedResponse;

        if (!explanation || !comic_script) {
            throw new Error("Invalid response structure from the text model.");
        }

        // Step 2: Generate images for each panel
        const comicPanels: ComicPanelData[] = await Promise.all(
            comic_script.map(async (panel: ComicPanelScript) => {
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: panel.image_prompt,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/png',
                      aspectRatio: '1:1',
                    },
                });

                if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
                    throw new Error(`Image generation failed for prompt: ${panel.image_prompt}`);
                }
                const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                
                return {
                    narrative: panel.narrative,
                    imageUrl: imageUrl,
                };
            })
        );

        return { explanation, comicPanels };

    } catch (error) {
        console.error("Error generating concept comic:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate the lesson: ${error.message}`);
        }
        throw new Error("An unknown error occurred during lesson generation.");
    }
};
