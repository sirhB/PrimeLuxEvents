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

export interface PuterUser {
    username: string;
    email: string;
}

declare global {
    interface Window {
        puter: any;
    }
}

export const aiService = {
    /**
     * Checks if the user is signed in to Puter.
     */
    async isSignedIn(): Promise<boolean> {
        if (typeof window === 'undefined' || !window.puter) return false;
        return await window.puter.auth.isSignedIn();
    },

    /**
     * Triggers the Puter sign-in popup.
     */
    async signIn(): Promise<PuterUser | null> {
        if (typeof window === 'undefined' || !window.puter) return null;
        try {
            return await window.puter.auth.signIn();
        } catch (error) {
            console.error('Puter sign-in failed:', error);
            return null;
        }
    },

    /**
     * Gets the current Puter user.
     */
    async getUser(): Promise<PuterUser | null> {
        if (typeof window === 'undefined' || !window.puter) return null;
        try {
            return await window.puter.auth.getUser();
        } catch (error) {
            return null;
        }
    },

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
    },

    /**
     * Generates a premium product description.
     */
    async generateProductDescription(name: string, category: string, tone: string = 'luxurious'): Promise<string> {
        if (typeof window === 'undefined' || !window.puter) {
            console.error('Puter.js not loaded');
            return '';
        }

        try {
            const prompt = `Write a ${tone} product description for a rental item named "${name}" in the category "${category}". 
      Focus on the quality, aesthetic appeal, and how it elevates an event. Limit to 3-4 sentences.`;

            const response = await window.puter.ai.chat(prompt);
            return response.toString().trim();
        } catch (error) {
            console.error('Error generating product description:', error);
            return '';
        }
    },

    /**
     * Responds as an AI Concierge in a chat context.
     */
    async getChatResponse(messages: { content: string, role: 'user' | 'assistant' }[]): Promise<string> {
        if (typeof window === 'undefined' || !window.puter) {
            console.error('Puter.js not loaded');
            return "I'm sorry, I'm having trouble connecting to my creative circuits right now.";
        }

        try {
            const systemPrompt = `You are "The Sensei", an expert luxury event concierge for PrimeLux Events. 
      You are helping a client or team member via real-time chat.
      Your tone is sophisticated, helpful, and professional. 
      You know everything about high-end event rentals, coordination, and design.
      Keep your responses concise and elegant.`;

            const formattedMessages = messages.map(m => `${m.role === 'user' ? 'Client' : 'Sensei'}: ${m.content}`).join('\n');
            const fullPrompt = `${systemPrompt}\n\nRecent Conversation:\n${formattedMessages}\n\nSensei:`;

            const response = await window.puter.ai.chat(fullPrompt);
            return response.toString().trim();
        } catch (error) {
            console.error('Error getting chat response:', error);
            return "I apologize, but I've encountered a slight disruption in our flow. How else can I assist you?";
        }
    }
};
