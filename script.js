document.addEventListener('DOMContentLoaded', () => {
    const variables = {
        "F": [1, 100], "m": [1, 50], "x": [0, 100], "v": [0, 50], "t": [1, 20], "a": [0, 10],
        "p": [1, 100], "K": [1, 100], "v0": [0, 50], "I": [1, 100], "ω": [0, 20], "T": [1, 10],
        "f": [1, 10], "Krot": [1, 100], "ω0": [0, 20], "αrot": [0, 10]
    };

    const variableDisplay = document.getElementById('variable-display');
    const rerollVariablesBtn = document.getElementById('reroll-variables');

    const player1Status = document.getElementById('player1-status');
    const player1Score = document.getElementById('player1-score');
    const player1ResultInput = document.getElementById('player1-result');

    const player2Status = document.getElementById('player2-status');
    const player2Score = document.getElementById('player2-score');
    const player2ResultInput = document.getElementById('player2-result');

    const voteOutcomeMessage = document.getElementById('vote-outcome-message');
    const voteButtons = document.querySelectorAll('.vote-button');

    const startRoundBtn = document.getElementById('start-round');
    const endRoundBtn = document.getElementById('end-round');
    const resetGameBtn = document.getElementById('reset-game');
    const rerollToggle = document.getElementById('reroll-toggle');
    const roundWinnerMessage = document.getElementById('round-winner-message');
    const roundLimitSelect = document.getElementById('round-limit');
    const currentRoundDisplay = document.getElementById('current-round-display');

    const gameOverSection = document.getElementById('game-over-section');
    const overallWinnerDisplay = document.getElementById('overall-winner');
    const finalScorePlayer1Display = document.getElementById('final-score-player1');
    const finalScorePlayer2Display = document.getElementById('final-score-player2');

    let player1Vote = null;
    let player2Vote = null;
    let game_state = 'idle'; // 'idle', 'round_active', 'round_ended', 'game_over'
    let roundLimit = 'unlimited';
    let currentRound = 0;

    const player_data = {
        'player1': { status: player1Status, score: player1Score, result_input: player1ResultInput, vote: null },
        'player2': { status: player2Status, score: player2Score, result_input: player2ResultInput, vote: null }
    };

    function rerollVariables() {
        variableDisplay.innerHTML = '';
        for (const varName in variables) {
            const [min, max] = variables[varName];
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            const varItem = document.createElement('div');
            varItem.classList.add('variable-item');
            varItem.textContent = `${varName}: ${value}`;
            variableDisplay.appendChild(varItem);
        }
    }

    function updatePlayerStatus(player, status) {
        player_data[player].status.textContent = status;
    }

    function updatePlayerScore(player, score) {
        player_data[player].score.textContent = score;
    }

    function recordVote(player, vote) {
        if (game_state !== 'round_active') return;

        if (player === 'player1') {
            player1Vote = vote;
            updatePlayerStatus('player1', 'Voted');
        } else if (player === 'player2') {
            player2Vote = vote;
            updatePlayerStatus('player2', 'Voted');
        }
        updateUIState();

        if (player1Vote && player2Vote) {
            revealVoteOutcome();
        }
    }

    function revealVoteOutcome() {
        if (player1Vote === 'DRAW' && player2Vote === 'DRAW') {
            voteOutcomeMessage.textContent = 'Outcome: Continue Round';
        } else {
            voteOutcomeMessage.textContent = 'Outcome: Round Ends';
        }
    }

    function resetVotes() {
        player1Vote = null;
        player2Vote = null;
        voteOutcomeMessage.textContent = 'Waiting for votes...';
        updatePlayerStatus('player1', 'Waiting');
        updatePlayerStatus('player2', 'Waiting');
        updateUIState();
    }

    function startRound() {
        if (game_state === 'game_over') {
            alert('Game over! Please reset the game to play again.');
            return;
        }
        if (game_state !== 'round_active') {
            currentRound++;
            if (roundLimit !== 'unlimited' && currentRound > parseInt(roundLimit)) {
                alert('Round limit reached! Please reset the game.');
                game_state = 'game_over';
                updateUIState();
                return;
            }

            game_state = 'round_active';
            resetVotes();
            roundWinnerMessage.textContent = '';
            player_data['player1'].result_input.value = '';
            player_data['player2'].result_input.value = '';
            updatePlayerStatus('player1', 'Voting');
            updatePlayerStatus('player2', 'Voting');

            if (rerollToggle.checked) {
                rerollVariables();
            }
            voteOutcomeMessage.textContent = 'Waiting for votes...';
            console.log(`Round ${currentRound} Started`);
            updateUIState();
        }
    }

    function endRound() {
        if (game_state === 'round_active') {
            game_state = 'round_ended';
            updatePlayerStatus('player1', 'Locked');
            updatePlayerStatus('player2', 'Locked');
            compareResults();
            console.log(`Round ${currentRound} Ended`);
            updateUIState();

            if (roundLimit !== 'unlimited' && currentRound >= parseInt(roundLimit)) {
                game_state = 'game_over';
                roundWinnerMessage.textContent += ' Game Over!';
                alert('Round limit reached! Game Over!');
                displayOverallWinner();
            }
        }
    }

    function displayOverallWinner() {
        let p1TotalScore = parseInt(player_data['player1'].score.textContent);
        let p2TotalScore = parseInt(player_data['player2'].score.textContent);

        finalScorePlayer1Display.textContent = p1TotalScore;
        finalScorePlayer2Display.textContent = p2TotalScore;

        let overallWinnerText = '';
        if (p1TotalScore > p2TotalScore) {
            overallWinnerText = 'Player 1 Wins the Game!';
        } else if (p2TotalScore > p1TotalScore) {
            overallWinnerText = 'Player 2 Wins the Game!';
        } else {
            overallWinnerText = 'The Game is a Tie!';
        }
        overallWinnerDisplay.textContent = overallWinnerText;
        updateUIState();
    }

    function resetGame() {
        game_state = 'idle';
        roundLimit = 'unlimited'; // Reset round limit selector
        roundLimitSelect.value = 'unlimited';
        currentRound = 0;
        resetVotes();
        rerollVariables();
        roundWinnerMessage.textContent = '';
        updatePlayerStatus('player1', 'Waiting');
        updatePlayerStatus('player2', 'Waiting');
        updatePlayerScore('player1', 0);
        updatePlayerScore('player2', 0);
        player_data['player1'].result_input.value = '';
        player_data['player2'].result_input.value = '';
        voteOutcomeMessage.textContent = 'Waiting for votes...';
        console.log('Game Reset');
        updateUIState();
    }

    function compareResults() {
        try {
            const p1Result = parseFloat(player_data['player1'].result_input.value);
            const p2Result = parseFloat(player_data['player2'].result_input.value);

            if (isNaN(p1Result) || isNaN(p2Result)) {
                roundWinnerMessage.textContent = 'Invalid result input!';
                console.log('Invalid result input!');
                return;
            }

            let winner = '';
            if (p1Result > p2Result) {
                winner = 'Player 1';
                updatePlayerScore('player1', parseInt(player_data['player1'].score.textContent) + p1Result);
            } else if (p2Result > p1Result) {
                winner = 'Player 2';
                updatePlayerScore('player2', parseInt(player_data['player2'].score.textContent) + p2Result);
            } else {
                winner = "It's a Tie!";
            }
            roundWinnerMessage.textContent = `Round Winner: ${winner}`;
            console.log(`Round Winner: ${winner}`);

        } catch (error) {
            roundWinnerMessage.textContent = 'Error comparing results.';
            console.error('Error comparing results:', error);
        }
    }

    function updateUIState() {
        // Common elements
        const allVoteButtons = document.querySelectorAll('.vote-button');
        const allResultInputs = document.querySelectorAll('.result-input');

        currentRoundDisplay.textContent = roundLimit === 'unlimited' ? `Round: ${currentRound} (Unlimited)` : `Round: ${currentRound}/${roundLimit}`;

        if (game_state === 'idle') {
            startRoundBtn.disabled = false;
            rerollVariablesBtn.disabled = false;
            endRoundBtn.disabled = true;
            resetGameBtn.disabled = false;
            rerollToggle.disabled = false;
            roundLimitSelect.disabled = false;

            allVoteButtons.forEach(button => button.disabled = true);
            allResultInputs.forEach(input => input.disabled = true);
            gameOverSection.style.display = 'none';

        } else if (game_state === 'round_active') {
            startRoundBtn.disabled = true;
            rerollVariablesBtn.disabled = true;
            endRoundBtn.disabled = false;
            resetGameBtn.disabled = false;
            rerollToggle.disabled = true;
            roundLimitSelect.disabled = true;

            // Enable/disable vote buttons based on whether a player has voted
            document.querySelector('.vote-button[data-player="player1"][data-vote="DRAW"]').disabled = !!player1Vote;
            document.querySelector('.vote-button[data-player="player1"][data-vote="STOP"]').disabled = !!player1Vote;
            document.querySelector('.vote-button[data-player="player2"][data-vote="DRAW"]').disabled = !!player2Vote;
            document.querySelector('.vote-button[data-player="player2"][data-vote="STOP"]').disabled = !!player2Vote;

            allResultInputs.forEach(input => input.disabled = false);
            gameOverSection.style.display = 'none';

        } else if (game_state === 'round_ended') {
            startRoundBtn.disabled = false;
            rerollVariablesBtn.disabled = true;
            endRoundBtn.disabled = true;
            resetGameBtn.disabled = false;
            rerollToggle.disabled = false;
            roundLimitSelect.disabled = false; // Allow changing round limit for next game

            allVoteButtons.forEach(button => button.disabled = true);
            allResultInputs.forEach(input => input.disabled = true);
            gameOverSection.style.display = 'none';

        } else if (game_state === 'game_over') {
            startRoundBtn.disabled = true;
            rerollVariablesBtn.disabled = true;
            endRoundBtn.disabled = true;
            resetGameBtn.disabled = false;
            rerollToggle.disabled = true;
            roundLimitSelect.disabled = true;

            allVoteButtons.forEach(button => button.disabled = true);
            allResultInputs.forEach(input => input.disabled = true);
            gameOverSection.style.display = 'block';
        }
    }

    // Event Listeners
    rerollVariablesBtn.addEventListener('click', rerollVariables);
    startRoundBtn.addEventListener('click', startRound);
    endRoundBtn.addEventListener('click', endRound);
    resetGameBtn.addEventListener('click', resetGame);
    roundLimitSelect.addEventListener('change', (event) => {
        roundLimit = event.target.value;
        updateUIState();
    });

    voteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const player = event.target.dataset.player;
            const vote = event.target.dataset.vote;
            recordVote(player, vote);
        });
    });

    // Initial setup
    rerollVariables();
    updateUIState();
});
