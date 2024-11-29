const apiUrl = "https://deckofcardsapi.com/api";
let deckId = "";
let allValues = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
let curCardIndex = -1;
let score = 0;
const waitingTime = 1500;

const newGameScreen = document.getElementById("newGame");
const playGameScreen = document.getElementById("playGame");
const gameOverScreen = document.getElementById("gameOver");
const cardImg = document.getElementById("cardImg");
const inGameScore = document.getElementById("inGameScore");
const gameButtons = document.getElementById("gameButtons");
const btnHigher = document.getElementById("btnHigher");
const btnLower = document.getElementById("btnLower");
const newGameButtons = document.querySelectorAll("#btnNewGame, #btnTryAgain");
const finalScore = document.getElementById("score");

// Method to retrieve a new deck. Must be done at the start of each game
async function getNewDeck() {
    try {
        const response = await fetch(`${apiUrl}/deck/new/shuffle/?deck_count=1`);
        const data = await response.json();
        return data;
    } catch (error) {
        alert("An error occured. Please try again");
        console.error("Error while getting new deck: ", error);
        throw (error);
    }
}

// Method to draw a new randome card
async function drawCard() {
    try {
        const response = await fetch(`${apiUrl}/deck/${deckId}/draw/?count=1`);
        const data = await response.json();
        return data;
    } catch (error) {
        alert("An error occured. Please try again");
        console.error("Error while drawing card: ", error);
        throw error;
    }
}

// Start new game (2 buttons)
newGameButtons.forEach(button => {
    button.addEventListener("click", async event => {
        try {
            // First get a new deck and store the deck id
            const newDeck = await getNewDeck();
            deckId = newDeck.deck_id;

            // Reset all screens
            resetGame();

        } catch (error) {
            console.error("Failed to start new game: ", error);
            throw error;
        }
    })
})

function resetGame() {
    // Reset score
    score = 0;

    // Reset the appearance of the game over screen, in case the user had a perfect score in the previous game
    gameOverScreen.classList.remove("perfectScore");

    // Re-enable the buttons
    btnHigher.disabled = false;
    btnLower.disabled = false;

    // Then draw a new card to show as starting card
    nextCard("new");

    // Display only the playGame screen
    hideElement(newGameScreen);
    hideElement(gameOverScreen);
    showElement(playGameScreen);
}

btnHigher.addEventListener("click", event => {
    nextCard("higher");
})
btnLower.addEventListener("click", event => {
    nextCard("lower");
})

async function nextCard(guess) {
    try {

        // Show loading spinner
        cardImg.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M2,12A10.94,10.94,0,0,1,5,4.65c-.21-.19-.42-.36-.62-.55h0A11,11,0,0,0,12,23c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z"><animateTransform attributeName="transform" dur="0.6s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg>
        `;
        // Draw a new card
        const { remaining, cards: [card] } = await drawCard();

        // Get the position of the new card
        const newCardIndex = allValues.indexOf(card.value);

        if (guess == "new") {
            // New game, just show the card
        } else if (
            (guess == "higher" && curCardIndex < newCardIndex)
            ||
            (guess == "lower" && curCardIndex > newCardIndex)) {

            // User guessed correctly
            // Increase score
            score++;

            goodGuess();
        } else {

            // User guessed wrong
            badGuess();

            // Wait some time before showing the game over screen
            setTimeout(gameOver, waitingTime);
        }
        // Show the new card
        showCard(card);

        if (remaining === 0) {

            // Perfect game. Max score
            maxScore();
        }

    } catch (error) {
        alert("An error occured. Please try again")
        console.error("Error while getting next card: ", error);
        throw error;
    }
}

function goodGuess() {
    playGameScreen.classList.add("goodGuess");
    setTimeout(() => playGameScreen.classList.remove("goodGuess"), waitingTime)
}
function badGuess() {
    // Disabled the higher/lower buttons so the user cannot make another guess
    btnHigher.disabled = true;
    btnLower.disabled = true;

    playGameScreen.classList.add("badGuess");
    setTimeout(() => playGameScreen.classList.remove("badGuess"), waitingTime)
}

// Show a new card on the playGame screen
async function showCard({ image, value, suit }) {

    // Preload the card image for a smoother experience
    await fetch(image);

    // display new card image
    cardImg.innerHTML = `<img src="${image}" alt="${value} of ${suit}">`;
    inGameScore.innerHTML = `You have <b class="text-2xl">${score}</b> good guesses`;

    // Store the index of this card in the list
    curCardIndex = allValues.indexOf(value);
}

function maxScore() {
    // Change the appearance of the game over screen
    gameOverScreen.classList.add("perfectScore");
    // Show the game over screen
    gameOver();
    // Add a perfect score message to the game over screen + fireworks
    finalScore.innerHTML += `
        <div class="text-center">Perfect score!</div>
        <img src="images/fireworks.gif" alt="Fireworks" class="justify-self-center">
    `;
}

function gameOver() {
    finalScore.innerHTML = score;

    // Display only the gameOver screen
    hideElement(newGameScreen);
    hideElement(playGameScreen);
    showElement(gameOverScreen);
}

// Helper functions to hide and show the game screens
function showElement(element) {
    element.classList.add("flex");
    element.classList.remove("hidden");
}
function hideElement(element) {
    element.classList.add("hidden");
    element.classList.remove("flex");
}