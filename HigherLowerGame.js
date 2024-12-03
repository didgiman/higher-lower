class HigherLowerGame {

    constructor(containerElement, deckService = new DeckService()) {
        this.containerElement = containerElement;
        this.deckService = deckService;

        // Game state
        this.deckId = null;
        this.currentCard = null;
        this.score = 0;
        this.gameState = "new";

        // Card value order for comparison
        this.cardValues = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];

        // Bind methods to maintain context
        this.startNewGame = this.startNewGame.bind(this);
        this.makeGuess = this.makeGuess.bind(this);
        this.render = this.render.bind(this);

        this.render();
    }

    // Initialize the game
    async startNewGame() {
        try {
            this.gameState = "loading";
            this.render();

            // Create new deck
            const newDeck = await this.deckService.createNewDeck();
            this.deckId = newDeck.deck_id;

            // Draw initial card
            const initialDrawResult = await this.deckService.drawCard(this.deckId);
            this.currentCard = initialDrawResult.cards[0];

            // Start playing
            this.score = 0;
            this.gameState = "playing";
            this.render();
        } catch (error) {
            this.gameState = "error";
            this.renderError(error.message);
        }
    }

    // Process user"s guess
    async makeGuess(guess) {
        if (this.gameState !== "playing") return;

        try {
            this.gameState = "loading";
            this.render();

            // Draw next card
            const drawResult = await this.deckService.drawCard(this.deckId);
            const newCard = drawResult.cards[0];

            try {
                // Preload new card image
                await fetch(newCard.image);
            } catch(error) {
                // No problem, just continue. The image will be retried when it's shown to the player
            }

            // Compare card values
            const currentCardIndex = this.cardValues.indexOf(this.currentCard.value);
            const newCardIndex = this.cardValues.indexOf(newCard.value);

            const isCorrectGuess =
                (guess === "higher" && newCardIndex > currentCardIndex) ||
                (guess === "lower" && newCardIndex < currentCardIndex);

            if (isCorrectGuess) {
                this.score++;
                this.gameState = "playing";
            } else {
                this.gameState = "gameover";
            }

            // Update current card
            this.currentCard = newCard;

            // Check if deck is empty
            if (drawResult.remaining === 0) {
                this.gameState = "perfectscore";
            }

            this.render();
        } catch (error) {
            this.gameState = "error";
            this.renderError(error.message);
        }
    }

    // Render game UI
    render() {
        this.containerElement.innerHTML = this.getTemplate();
        this.attachEventListeners();
    }

    // Generate HTML template based on game state
    getTemplate() {
        switch (this.gameState) {
            case "new":
                return `
                    <div class="game-wrapper">
                        <div class="game-section">
                            <h2>Higher Lower</h2>
                            <div class="grow flex items-center justify-center">
                                <img src="images/walter.jpg" class="w-96" alt="Walter" />
                            </div>
                            <div class="flex justify-center">
                                <button class="btn" id="start-game">Start new game</button>
                            </div>
                        </div>
                    </div>
                `;
            case "loading":
                return `
                    <div class="game-wrapper">
                        <div class="game-section items-center">
                            <h2>Higher Lower</h2>
                            <div class="grow flex flex-col items-center justify-around">
                                <div class="loading text-white text-3xl text-center">Loading...</div>
                            </div>
                        </div>
                    </div>
                `;
            case "playing":
                return `
                    <div class="game-wrapper">
                        <div class="game-section ${this.score > 0 ? 'goodGuess': ''}">
                            <h2>Higher Lower</h2>
                            <div class="grow flex flex-col items-center justify-around">
                                <img src="${this.currentCard.image}" alt="Current Card">
                                <div class="text-center text-white">You have <b class="text-2xl">${this.score}</b> good guesses</div>
                            </div>
                            <div class="flex flex-row space-x-5 w-full justify-center" id="gameButtons">
                                <button class="btn" id="guess-higher">Higher</button>
                                <button class="btn" id="guess-lower">Lower</button>
                            </div>
                        </div>
                    </div>
                `;
            case "gameover":
                return `
                    <div class="game-wrapper">
                        <div class="game-section badGuess">
                            <h2>Higher Lower</h2>
                            <div class="grow flex flex-col items-center justify-center text-white">
                                <h3 class="mb-15">Game Over</h3>
                                <div class="w-28 border-2 border-red-500 rounded-lg my-5">
                                    <img src="${this.currentCard.image}" alt="Current Card">
                                </div>
                                <div class="text-lg">You scored</div>
                                <div id="score" class="text-6xl text-center">${this.score}</div>
                            </div>
                            <div class="w-full flex justify-center">
                                <button class="btn" id="restart-game">Try again</button>
                            </div>
                        </div>
                    </div>
                `;
            case "perfectscore":
                return `
                    <div class="game-wrapper">
                        <div class="game-section">
                            <h2>Higher Lower</h2>
                            <div class="grow flex flex-col items-center justify-center text-white">
                                <h3 class="mb-15 text-green-500">Perfect score!</h3>
                                <div class="text-lg">You scored</div>
                                <div id="score" class="text-6xl text-center">${this.score}</div>
                            </div>
                            <div class="w-full flex justify-center">
                                <button class="btn" id="restart-game">Play again</button>
                            </div>
                        </div>
                    </div>
                `;
            case "error":
                return `
                    <div class="game-wrapper">
                        <div class="game-section error">
                            <h2>Higher Lower</h2>
                            <div class="grow flex flex-col items-center justify-center text-white">
                                <h3>Something went wrong</h3>
                                <p id="error-message" class="text-red-600"></p>
                            </div>
                            <div class="w-full flex justify-center">
                                <button class="btn" id="restart-game">Try again</button>
                            </div>
                        </div>
                    </div>
                `;
        }
    }

    // Attach event listeners dynamically
    attachEventListeners() {
        const startButton = this.containerElement.querySelector("#start-game");
        const restartButtons = this.containerElement.querySelectorAll("#restart-game");
        const higherButton = this.containerElement.querySelector("#guess-higher");
        const lowerButton = this.containerElement.querySelector("#guess-lower");

        if (startButton) startButton.addEventListener("click", this.startNewGame);

        restartButtons.forEach(btn => {
            btn.addEventListener("click", this.startNewGame);
        });

        if (higherButton) higherButton.addEventListener("click", () => this.makeGuess("higher"));
        if (lowerButton) lowerButton.addEventListener("click", () => this.makeGuess("lower"));
    }

    // Render error message
    renderError(message) {
        this.render();
        const errorMessageEl = this.containerElement.querySelector("#error-message");
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
        }
    }
}