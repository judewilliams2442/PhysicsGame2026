document.addEventListener('DOMContentLoaded', () => {
    const variables = {
        "F": [1, 100], "m": [1, 50], "x": [0, 100], "v": [0, 50], "t": [1, 20], "a": [0, 10],
        "p": [1, 100], "K": [1, 100], "v0": [0, 50], "I": [1, 100], "ω": [0, 20], "T": [1, 10],
        "f": [1, 10], "Krot": [1, 100], "ω0": [0, 20], "αrot": [0, 10]
    };

    const player1VariableDisplay = document.getElementById('player1-variable-display');
    const player2VariableDisplay = document.getElementById('player2-variable-display');
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
    let game_state = 'idle';
    let roundLimit = 'unlimited';
    let currentRound = 0;

    const playerVariables = {
        player1: {},
        player2: {}
    };

    const player_data = {
        player1: { status: player1Status, score: player1Score, result_input: player1ResultInput },
        player2: { status: player2Status, score: player2Score, result_input: player2ResultInput }
    };

    function rerollPlayerVariables(player, targetDisplay) {
        targetDisplay.innerHTML = '';
        for (const varName in variables) {
            const [min, max] = variables[varName];
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            playerVariables[player][varName] = value;

            const varItem = document.createElement('div');
            varItem.classList.add('variable-item');
            varItem.textContent = `${varName}: ${value}`;
            targetDisplay.appendChild(varItem);
        }
    }

    function rerollAllVariables() {
        rerollPlayerVariables('player1', player1VariableDisplay);
        rerollPlayerVariables('player2', player2VariableDisplay);
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
        } else {
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

            // RESET votes → allows continuous loop
            player1Vote = null;
            player2Vote = null;

            updatePlayerStatus('player1', 'Voting');
            updatePlayerStatus('player2', 'Voting');

            updateUIState();
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
        if (game_state === 'game_over') return;

        if (game_state !== 'round_active') {
            currentRound++;

            if (roundLimit !== 'unlimited' && currentRound > parseInt(roundLimit)) {
                game_state = 'game_over';
                updateUIState();
                return;
            }

            game_state = 'round_active';
            resetVotes();

            roundWinnerMessage.textContent = '';
            player1ResultInput.value = '';
            player2ResultInput.value = '';

            updatePlayerStatus('player1', 'Voting');
            updatePlayerStatus('player2', 'Voting');

            if (rerollToggle.checked) rerollAllVariables();

            updateUIState();
        }
    }

    function endRound() {
        if (game_state !== 'round_active') return;

        game_state = 'round_ended';

        updatePlayerStatus('player1', 'Locked');
        updatePlayerStatus('player2', 'Locked');

        compareResults();
        updateUIState();

        if (roundLimit !== 'unlimited' && currentRound >= parseInt(roundLimit)) {
            game_state = 'game_over';
            displayOverallWinner();
        }
    }

    function compareResults() {
        const p1 = parseFloat(player1ResultInput.value);
        const p2 = parseFloat(player2ResultInput.value);

        if (isNaN(p1) || isNaN(p2)) {
            roundWinnerMessage.textContent = 'Invalid result input!';
            return;
        }

        if (p1 > p2) {
            updatePlayerScore('player1', parseInt(player1Score.textContent) + p1);
            roundWinnerMessage.textContent = 'Round Winner: Player 1';
        } else if (p2 > p1) {
            updatePlayerScore('player2', parseInt(player2Score.textContent) + p2);
            roundWinnerMessage.textContent = 'Round Winner: Player 2';
        } else {
            roundWinnerMessage.textContent = "It's a Tie!";
        }
    }

    function displayOverallWinner() {
        const p1 = parseInt(player1Score.textContent);
        const p2 = parseInt(player2Score.textContent);

        finalScorePlayer1Display.textContent = p1;
        finalScorePlayer2Display.textContent = p2;

        if (p1 > p2) {
            overallWinnerDisplay.textContent = 'Player 1 Wins!';
        } else if (p2 > p1) {
            overallWinnerDisplay.textContent = 'Player 2 Wins!';
        } else {
            overallWinnerDisplay.textContent = 'Tie Game!';
        }

        updateUIState();
    }

    function resetGame() {
        game_state = 'idle';
        currentRound = 0;
        roundLimit = 'unlimited';
        roundLimitSelect.value = 'unlimited';

        resetVotes();
        rerollAllVariables();

        roundWinnerMessage.textContent = '';
        updatePlayerScore('player1', 0);
        updatePlayerScore('player2', 0);

        player1ResultInput.value = '';
        player2ResultInput.value = '';

        updateUIState();
    }

    function updateUIState() {
        const allVoteButtons = document.querySelectorAll('.vote-button');
        const allInputs = document.querySelectorAll('.result-input');

        currentRoundDisplay.textContent =
            roundLimit === 'unlimited'
                ? `Round: ${currentRound}`
                : `Round: ${currentRound}/${roundLimit}`;

        if (game_state === 'idle') {
            startRoundBtn.disabled = false;
            endRoundBtn.disabled = true;
            rerollVariablesBtn.disabled = false;

            allVoteButtons.forEach(b => b.disabled = true);
            allInputs.forEach(i => i.disabled = true);

            gameOverSection.style.display = 'none';
        }

        if (game_state === 'round_active') {
            startRoundBtn.disabled = true;
            endRoundBtn.disabled = false;
            rerollVariablesBtn.disabled = true;

            document.querySelector('[data-player="player1"][data-vote="DRAW"]').disabled = !!player1Vote;
            document.querySelector('[data-player="player1"][data-vote="STOP"]').disabled = !!player1Vote;
            document.querySelector('[data-player="player2"][data-vote="DRAW"]').disabled = !!player2Vote;
            document.querySelector('[data-player="player2"][data-vote="STOP"]').disabled = !!player2Vote;

            allInputs.forEach(i => i.disabled = false);
        }

        if (game_state === 'round_ended') {
            startRoundBtn.disabled = false;
            endRoundBtn.disabled = true;

            allVoteButtons.forEach(b => b.disabled = true);
            allInputs.forEach(i => i.disabled = true);
        }

        if (game_state === 'game_over') {
            startRoundBtn.disabled = true;
            endRoundBtn.disabled = true;

            allVoteButtons.forEach(b => b.disabled = true);
            allInputs.forEach(i => i.disabled = true);

            gameOverSection.style.display = 'block';
        }
    }

    // Event listeners
    rerollVariablesBtn.addEventListener('click', rerollAllVariables);
    startRoundBtn.addEventListener('click', startRound);
    endRoundBtn.addEventListener('click', endRound);
    resetGameBtn.addEventListener('click', resetGame);

    roundLimitSelect.addEventListener('change', (e) => {
        roundLimit = e.target.value;
        updateUIState();
    });

    voteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            recordVote(e.target.dataset.player, e.target.dataset.vote);
        });
    });

    // Init
    rerollAllVariables();
    updateUIState();
});