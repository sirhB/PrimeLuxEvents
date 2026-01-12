/**
 * Puter.js AI Service
 * 
 * This service provides a typed interface to the Puter.js AI capabilities.
 * Since Puter.js is loaded via a script tag, we interact with the global `puter` object.
 */

export interface AIImageResult {
    src: string;
    alt: string;
}

export interface AIRentalRecommendation {
    id: string;
    name: string;
    category: string;
    reason: string;
}

export interface MoodBoardResult {
    images: AIImageResult[];
    recommendations: AIRentalRecommendation[];
    summary: string;
}

declare global {
    interface Window {
        puter: any;
    }
}

export const aiService = {
    /**
     * Generates event inspiration images based on a description.
     */
    async generateInspirationImages(prompt: string, count: number = 4): Promise<AIImageResult[]> {
        if (typeof window === 'undefined' || !window.puter) {
            console.error('Puter.js not loaded');
            return [];
        }

        try {
            const images: AIImageResult[] = [];
            for (let i = 0; i < count; i++) {
                // We use puter.ai.txt2img to generate images
                // Note: Puter returns a URL or a Blob.
                const res = await window.puter.ai.txt2img(prompt);
                images.push({
                    src: res.src || res, // Depending on the version/response
                    alt: `AI generated inspiration for: ${prompt}`
                });
            }
            return images;
        } catch (error) {
            console.error('Error generating AI images:', error);
            return [];
        }
    },

    /**
     * Generates a mood board summary and product recommendations.
     */
    async planEvent(prompt: string): Promise<MoodBoardResult | null> {
        if (typeof window === 'undefined' || !window.puter) {
            console.error('Puter.js not loaded');
            return null;
        }

        try {
            // Use puter.ai.chat to get structured recommendations
            const systemPrompt = `You are a luxury event designer for PrimeLux Events. 
      Based on the user's event theme, provide:
      1. A premium 2-3 sentence summary of the design vision.
      2. 4 specific rental categories to focus on (e.g., "Gold Accents", "Velvet Seating").
      
      Format the response as JSON:
      {
        "summary": "...",
        "recommendations": [{"category": "...", "reason": "..."}]
      }`;

            const response = await window.puter.ai.chat(
                `${systemPrompt}\n\nUser Theme: ${prompt}`
            );

            const data = JSON.parse(response.toString());

            // Also generate images in parallel
            const images = await this.generateInspirationImages(prompt, 3);

            return {
                summary: data.summary,
                recommendations: data.recommendations,
                images
            };
        } catch (error) {
            console.error('Error planning event with AI:', error);
            return null;
        }
    }
};
