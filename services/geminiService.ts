import { GoogleGenAI, Type } from "@google/genai";

interface ComicPanelScript {
  narrative: string;
  image_prompt: string;
}

export interface ComicPanelData {
    narrative: string;
    imageUrl: string;
}

export interface MindMapNode {
    title: string;
    children?: MindMapNode[];
}

export interface FlashcardData {
    term: string;
    definition: string;
}

export interface QuoteData {
    text: string;
    author: string;
}

export interface ConceptExplanation {
    quote: QuoteData;
    explanation: string;
    recommendedReading: string[];
    comicPanels: ComicPanelData[];
    flashcards: FlashcardData[];
    mindMap: MindMapNode;
    sourceFileName?: string;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        quote: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                author: { type: Type.STRING },
            },
            required: ['text', 'author'],
        },
        explanation: { type: Type.STRING },
        recommended_reading: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
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
        flashcards: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
            },
        },
        mind_map: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                children: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING }
                                    },
                                    required: ['title']
                                }
                            }
                        },
                        required: ['title']
                    }
                }
            },
            required: ['title']
        }
    },
    required: ['quote', 'explanation', 'recommended_reading', 'comic_script', 'flashcards', 'mind_map'],
};


export const generateAcademyLesson = async (topic: string, document?: { name: string, text: string }): Promise<ConceptExplanation> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const ragInstruction = document?.text
            ? `Use the following document as the primary source to create the lesson. Base the explanation heavily on its content. When you use information from the document, explicitly mention it (e.g., "According to the provided document..."). \n\nDOCUMENT CONTENT:\n"""\n${document.text}\n"""\n\n`
            : '';

        const prompt = `${ragInstruction}As the wise Headmaster of the Animal Academy, create a comprehensive lesson about the topic: "${topic}".
The lesson must be a single JSON object adhering to the provided schema.
- The "explanation" should be well-structured into multiple paragraphs for better readability (use '\\n\\n' for paragraph breaks). It should identify key terms and format them as Markdown hyperlinks to Wikipedia (e.g., [Term](https://en.wikipedia.org/wiki/Term)).
- The "comic_script" must be a fun, educational story with 5-10 panels.
- Each "image_prompt" in the comic script must begin with the exact phrase 'clean, minimalist, educational vector illustration of...'.`;

        // Step 1: Generate all text content and image prompts in one call
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });

        const jsonStr = response.text.trim();
        const parsedResponse = JSON.parse(jsonStr);
        const { explanation, comic_script, quote, recommended_reading, flashcards, mind_map } = parsedResponse;

        if (!explanation || !comic_script || !quote || !recommended_reading || !flashcards || !mind_map) {
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

        return { 
            quote,
            explanation,
            recommendedReading: recommended_reading,
            comicPanels,
            flashcards,
            mindMap: mind_map,
            sourceFileName: document?.name,
        };

    } catch (error) {
        console.error("Error generating concept comic:", error);
        if (error instanceof Error) {
            // Check for JSON parsing errors specifically, as the model might still fail.
            if (error.message.includes("JSON")) {
                 throw new Error(`Failed to generate the lesson: The AI returned an invalid data structure. Please try again.`);
            }
            throw new Error(`Failed to generate the lesson: ${error.message}`);
        }
        throw new Error("An unknown error occurred during lesson generation.");
    }
};