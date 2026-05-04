# Physics Strategy Game GUI Shell

This project provides a minimal graphical interface (GUI) shell for a two-player competitive math strategy game. It is designed to act as a referee and state tracker, managing game flow, random variables, hidden player decisions, and scoring, without handling complex physics calculations or equation logic.

## Core Purpose

This application **IS NOT** a simulation engine. Its primary role is to manage the game state and facilitate player input for a physics-based optimization game where players manually solve equations.

## Features

*   **Variable Board (Top Panel)**:
    *   Displays shared variables (F, m, x, v, t, a, p, K, v0, I, ω, T, f, Krot, ω0, αrot).
    *   Shows the current numeric value for each variable.
    *   "Reroll Variables" button to regenerate all values randomly within preset ranges.

*   **Player Status (Center Panel)**:
    *   Two side-by-side panels for Player 1 and Player 2.
    *   Displays player status (e.g., "Waiting", "Voting", "Locked").
    *   Shows current score.
    *   Input field for players to submit their final computed numeric result.

*   **Hidden Voting System (Bottom Panel)**:
    *   Each player has "DRAW" and "STOP" buttons for hidden voting.
    *   Votes remain hidden until both players have submitted their decision.
    *   Reveals outcome: "Continue Round" (if both DRAW) or "Round Ends" (if either STOP).
    *   Visible status banner for voting outcomes.

*   **Round Control**:
    *   "Start Round" button: Initiates a new round, resets votes and status, clears result inputs.
    *   "End Round" button: Locks inputs, triggers result comparison and scoring.
    *   "Reset Game" button: Clears all scores, resets variables, and returns the game to an idle state.
    *   Toggle option to "Reroll variables on Start Round".
    *   Round Limit Selector: Players can choose to play for 3, 5, 10 rounds, or "Unlimited".
    *   Current round display (e.g., "Round: 1/5").

*   **Scoring System**:
    *   Players manually enter their final computed numeric result after a round ends.
    *   The app compares the entered values.
    *   The winner of the round adds their final result value to their total score.
    *   Displays the winner of the round.
    *   **Game Over Message**: Clearly displays the overall game winner and final scores once the round limit is reached.

*   **UI Style**:
    *   Clean, minimal, dark mode interface.
    *   Clear separation of panels for Variables (top), Player State (middle), and Controls (bottom).
    *   Designed to feel like a competitive strategy interface.

## Technologies Used

*   **HTML5**: For structuring the web page content.
*   **CSS3**: For styling the application, including the dark mode theme and layout.
*   **JavaScript (ES6+)**: For implementing all game logic, interactivity, and dynamic UI updates.

## Setup and Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd PhysicsGame2026
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd C:\Users\JudeWilliams\Documents\trae_projects\PhysicsGame2026
    ```

## How to Run

This is a client-side web application. No server is required.

1.  Simply open the `index.html` file in your preferred web browser.
    ```bash
    start index.html
    ```
    (On Windows, `start index.html` will open the file in your default browser.)

## Usage

1.  **Start a New Game**: Click "Reset Game" to ensure a fresh start. Select your desired round limit.
2.  **Start a Round**: Click "Start Round". Variables will be rerolled (if the toggle is checked), and player statuses will change to "Voting".
3.  **Player Voting**: Each player secretly clicks "DRAW" or "STOP". Once both have voted, the outcome is revealed.
4.  **Enter Results**: After the outcome, players manually enter their computed numeric results in their respective input fields.
5.  **End Round**: Click "End Round". The app compares results, updates scores, and declares a round winner.
6.  **Continue/Reset**: If the round continues, start a new round. If the game ends due to a round limit, the overall winner and final scores will be displayed.
7.  **Reset Game**: Use this button to clear all game progress and start over.
