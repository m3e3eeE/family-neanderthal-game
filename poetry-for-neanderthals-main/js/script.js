/**
 * TODO:
 * after time runs out, add button to start next team
 * maybe add a countdown before the game starts? idk
 */

let words;
let score_glad = score_mad = score = current_word = 0;
let max_timer;
let timer;
let game_running = false;
let countdown_interval;
let teamStickScore = 0;
let teamRockScore = 0;
let currentTeam = "stick";
let currentRound = 1;
let totalRounds = 3;

function updateTeamDisplay() {
    document.getElementById("team-stick-score").textContent = teamStickScore;
    document.getElementById("team-rock-score").textContent = teamRockScore;

    document.getElementById("current-team-name").textContent =
        currentTeam === "stick"
            ? "🪵 Team Stick"
            : "🪨 Team Rock";
}

document.getElementById('score-1').addEventListener('click', function() {
    if(game_running) {
        updateWords();
        score--;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
});

document.getElementById('score+1').addEventListener('click', function() {
    if(game_running) {
        updateWords();
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
});

document.getElementById('score+3').addEventListener('click', function() {
    if(game_running) {
        updateWords();
        score += 3;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
});

document.getElementById('reset-score').addEventListener('click', function() {
    resetGame();
});

document.getElementById('start-game').addEventListener('click', async function() {
    if (await loadAndValidateConfig()) {
        startGame();
    }
});
document
    .getElementById('start-next-turn')
    .addEventListener('click', function() {
        document
            .getElementById('between-turn-screen')
            .classList.add('hidden');

        document
            .getElementById('game-screen')
            .classList.remove('hidden');

        startNextTurn();
    });

async function loadAndValidateConfig() {
    let valid = true;
    valid = loadAndValidateMaxTimer() && valid;
    valid = await loadAndValidateWords() && valid;
    return valid;
}

function loadAndValidateMaxTimer() {
    const time_input_element = document.getElementById('time-input');
    max_timer = parseInt(time_input_element.value, 10);
    
    if (max_timer < 1 || Number.isNaN(max_timer)) {
        highlightErrorOnElement(time_input_element);
        return false;
    }

    return true;
}

async function loadAndValidateWords() {
    const selectedPackPaths = getSelectedPackPaths();
    if (selectedPackPaths.length < 1) {
        highlightErrorOnElement(document.getElementById('card-packs-container'));
        return false;
    }

    try {
        words = await loadWordsFromPaths(selectedPackPaths);
    } catch (error) {
        console.error('Error loading JSON: ' + error);
        displayErrorMessage('Something went wrong when loading the card data, please try again later');
        return false;
    }
    
    shuffle(words);
    return true;
}

function getSelectedPackPaths() {
    const paths = [];
    const checkbox_elements = document.getElementById('card-packs-container').getElementsByTagName("input");
    for (let checkbox of checkbox_elements) {
        if (checkbox.checked) {
            paths.push(checkbox.value);
        }
    }
    return paths;
}

function startGame() {
    updateWords();
    
    game_running = true;
    max_timer = parseInt(
        document.getElementById('time-input').value,
        10
    );
    
    timer = max_timer;
    score = 0;

    totalRounds = parseInt(
        document.getElementById('rounds-input').value,
        10
    );
    
    currentRound = 1;

    updateTeamDisplay();

    document.getElementById('score').textContent = `Score: ${score}`;
    
    const options_menu = document.getElementById('options-menu');
    options_menu.classList.add('hidden');
    const game_screen = document.getElementById('game-screen');
    game_screen.classList.remove('hidden');
    
    // Start the countdown
    startCountdown();
}
function showBetweenTurnScreen() {
    document
        .getElementById('game-screen')
        .classList.add('hidden');

    document
        .getElementById('between-turn-screen')
        .classList.remove('hidden');

    const nextTeamName =
        currentTeam === 'stick'
            ? '🪵 Team Stick'
            : '🪨 Team Rock';

    document.getElementById('next-team-name').textContent =
        nextTeamName;

    document.getElementById('next-turn-number').textContent =
        `Turn ${currentRound} of ${totalRounds}`;
}
function startNextTurn() {
    score = 0;
    timer = max_timer;
    updateWords();

    document.getElementById('score').textContent =  `Score: ${score}`;
    document.getElementById('timer-display').textContent =  `Time: ${timer}s`;

    game_running = true;
    startCountdown();
}

function resetGame() {
    updateWords();
    game_running = true;
    timer = max_timer;
    score = 0;
    document.getElementById('timer-display').textContent = `Time: ${timer}s`;
    document.getElementById('score').textContent = `Score: ${score}`;
    startCountdown();
}

function startCountdown() {
    clearInterval(countdown_interval);

    const endTime = Date.now() + timer * 1000;

    document.getElementById('timer-display').textContent =
        `Timer: ${timer}`;

    countdown_interval = setInterval(() => {
        timer = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );

        document.getElementById('timer-display').textContent =
            `Timer: ${timer}`;

        if (timer <= 0) {
            clearInterval(countdown_interval);
            game_running = false;

            if (currentTeam === "stick") {
                teamStickScore += score;
                currentTeam = "rock";
            } else {
                teamRockScore += score;
                currentTeam = "stick";
            }

            updateTeamDisplay();

            if (currentTeam === "rock") {

                showBetweenTurnScreen();
            } else if (currentRound < totalRounds) {
                currentRound++;

                showBetweenTurnScreen();
            } else {
                let winnerMessage;

                if (teamStickScore > teamRockScore) {
                    winnerMessage = "🪵 Team Stick wins!";
                } else if (teamRockScore > teamStickScore) {
                    winnerMessage = "🪨 Team Rock wins!";
                } else {
                    winnerMessage = "It's a tie!";
                }

                alert(
                    "Game Over!\n\n" +
                    "Team Stick: " + teamStickScore + "\n" +
                    "Team Rock: " + teamRockScore + "\n\n" +
                    winnerMessage
                );
            }
        }
    }, 250);
}

function updateWords() {
    // Once every card has been used, shuffle the full deck again.
    if (current_word >= words.length) {
        shuffle(words);
        current_word = 0;
    }

    const card = words[current_word];

    document.getElementById('word1').textContent = card["1"];
    document.getElementById('word3').textContent = card["3"];

    current_word++;
}

function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle
    while (currentIndex != 0) {
  
        // Pick a remaining element
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

async function loadWordsFromPaths(paths) {
    const fetch_promises = [];
    for (let path of paths) {
        fetch_promises.push(fetch(path));
    }

    const responses = await Promise.all(fetch_promises);
    const combined_data = [];

    for (let response of responses) {
        if (response.ok) {
            const data = await response.json();
            combined_data.push(...data.game_data);
        } else {
            throw new Error('Failed to load JSON files')
        }
    }

    console.log('Number of loaded cards: ' + combined_data.length);
    console.log(combined_data);
    return combined_data;
}

function highlightErrorOnElement(element) {
    element.style.transition = '';
    element.classList.add('bg-red-200');

    setTimeout(() => {
        element.style.transition = 'background-color 1s ease, border-color 1s ease';
        element.classList.remove('bg-red-200');
    }, 300);
}

function displayErrorMessage(message) {
    const error_message_element = document.getElementById('error-message');
    error_message_element.innerText = message;
    error_message_element.classList.remove('hidden');
    setTimeout(() => {
        error_message_element.classList.add('hidden');
    }, 5000);
}
