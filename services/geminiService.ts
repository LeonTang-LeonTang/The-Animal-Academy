import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../hooks/useLocalization";

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
    id: string; // Made non-optional for reliable keying
    quote: QuoteData;
    explanation: string;
    recommendedReading: string[];
    comicPanels: ComicPanelData[];
    flashcards: FlashcardData[];
    mindMap: MindMapNode;
    sourceFileName?: string;
    likes: number;
    dislikes: number;
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


export const generateAcademyLesson = async (
    topic: string,
    language: Language,
    document?: { name: string, text: string }
): Promise<ConceptExplanation> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const languageName = language === 'zh' ? 'Chinese' : 'English';

        const ragInstruction = document?.text
            ? `A document has been provided. Use it as a primary reference to enrich the explanation. Weave in key insights and data from the document, but also supplement with your broader knowledge to provide a comprehensive lesson. The goal is a balanced synthesis, not just a summary of the document.
When you use a direct quote from the document, you MUST format it as a Markdown blockquote on its own line, like this:
> This is the exact quote from the document.
Do not embed quotes inside your own paragraphs.

\n\nDOCUMENT CONTENT:\n"""\n${document.text}\n"""\n\n`
            : '';

        const prompt = `${ragInstruction}You are the wise Headmaster of the Animal Academy. Create a comprehensive lesson about the topic: "${topic}".
The target language for the output is ${languageName}.
The lesson must be a single JSON object adhering to the provided schema.

### Field-Specific Instructions ###
- **quote**: Find an insightful and inspiring quote about the topic from world literature, proverbs, or famous figures.
    - IMPORTANT: DO NOT use the provided document content for this quote.
    - CULTURAL AWARENESS: The target audience speaks ${languageName}. Prioritize quotes that originate from or are well-known within ${languageName}-speaking cultures. However, the most important criterion is high relevance to the topic, so a highly relevant quote from another culture is acceptable and encouraged if it's a better fit.
- **explanation**: A well-structured explanation in multiple paragraphs (use '\\n\\n' for breaks). The tone should be accessible and engaging, as if a friendly animal professor is teaching. Start with a clear overview: define the term, mention its origin or creator, and its fundamental meaning. Then, transition into a storytelling format to illustrate the concept's deeper implications or provide examples. For key terms, embed markdown links to authoritative web pages (e.g., Wikipedia). The URL MUST be a full, valid URL starting with "https://", like this: \`[key term](https://en.wikipedia.org/wiki/Key_Term)\`. If a source document is provided, you MUST follow the citation rules mentioned above.
- **recommended_reading**: A list of 3-5 books or articles in a standard citation format (e.g., "Author, A. A. (Year). Title of work. Publisher.").
- **comic_script**: This is the MOST important part.
    - The comic's story must directly illustrate a key part of the concept from the 'explanation' section. Create a simple narrative arc across 5-10 panels: introduce a problem or question related to the topic, show the animal characters exploring it through dialogue and action, and conclude with a panel that summarizes the lesson learned. Each panel's narrative should build on the last to tell a cohesive, educational story.
    - The "narrative" for each panel MUST NOT contain any markdown.
    - The characters in the comic MUST ALWAYS be anthropomorphic animals (e.g., a wise owl professor, curious rabbit students). They MUST be dressed in charming academic attire (like tweed jackets, lab coats, or graduation caps). This is non-negotiable.
    - Each "image_prompt" MUST begin with the exact phrase 'clean, minimalist, educational vector illustration of...'.
- **flashcards**: Create flashcards for key terms. For each 'definition', keep it concise and easy to understand. Use markdown bold (\`**term**\`) for the most critical keywords to make them stand out.`;


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
            id: self.crypto.randomUUID(),
            quote,
            explanation,
            recommendedReading: recommended_reading,
            comicPanels,
            flashcards,
            mindMap: mind_map,
            sourceFileName: document?.name,
            likes: 0,
            dislikes: 0,
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