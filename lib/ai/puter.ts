/**
 * Puter.js AI Service
 * 
 * This service provides a typed interface to the Puter.js AI capabilities.
 * Since Puter.js is loaded via a script tag, we interact with the global `puter` object.
 */

export interface PuterUser {
    username: string;
    email: string;
}

declare global {
    interface Window {
        puter: any;
    }
}

let puterLoadPromise: Promise<void> | null = null

export function loadPuter(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve()
    if (window.puter) return Promise.resolve()
    if (puterLoadPromise) return puterLoadPromise

    puterLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://js.puter.com/v2/'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Puter.js'))
        document.head.appendChild(script)
    })

    return puterLoadPromise
}

export const aiService = {
    /**
     * Checks if the user is signed in to Puter.
     */
    async isSignedIn(): Promise<boolean> {
        await loadPuter()
        if (typeof window === 'undefined' || !window.puter) return false;
        return await window.puter.auth.isSignedIn();
    },

    /**
     * Triggers the Puter sign-in popup.
     */
    async signIn(): Promise<PuterUser | null> {
        await loadPuter()
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
        await loadPuter()
        if (typeof window === 'undefined' || !window.puter) return null;
        try {
            return await window.puter.auth.getUser();
        } catch (error) {
            return null;
        }
    },

    /**
     * Generates a premium product description.
     */
    async generateProductDescription(name: string, category: string, tone: string = 'luxurious'): Promise<string> {
        await loadPuter()
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
        await loadPuter()
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
