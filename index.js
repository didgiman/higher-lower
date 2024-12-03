// Initialize multiple game instances if needed
document.addEventListener("DOMContentLoaded", () => {
    // First game instance
    const gameContainer1 = document.getElementById("game1");
    const game1 = new HigherLowerGame(gameContainer1);

    // Optional: Second game instance
    const gameContainer2 = document.getElementById("game2");
    if (gameContainer2) {
        const game2 = new HigherLowerGame(gameContainer2);
    }
});