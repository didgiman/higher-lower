class DeckService {
    constructor(apiUrl = "https://deckofcardsapi.com/api") {
        this.apiUrl = apiUrl;
    }

    // Validate response and handle errors
    async fetchWithValidation(url, errorMessage = "Fetch failed") {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(errorMessage, error);
            throw error;
        }
    }

    // Create a new shuffled deck
    async createNewDeck() {
        const url = `${this.apiUrl}/deck/new/shuffle/?deck_count=1`;
        const data = await this.fetchWithValidation(url, "Deck creation failed");
        
        if (!data.deck_id) {
            throw new Error("Invalid deck creation response");
        }
        
        return data;
    }

    // Draw a card from a specific deck
    async drawCard(deckId) {
        if (!deckId) {
            throw new Error("Invalid deck ID");
        }

        const url = `${this.apiUrl}/deck/${deckId}/draw/?count=1`;
        const data = await this.fetchWithValidation(url, "Card drawing failed");
        
        if (!data.cards || data.cards.length === 0) {
            throw new Error("No cards drawn");
        }
        
        return data;
    }
}