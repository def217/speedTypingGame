import { calculateWPM, setResetButtonActive, getRandomInt } from './utils.js';
import { startChronometer, stopChronometer } from './time.js';
import { highlightLetters } from './highlight.js';
import { updateProgressBar } from './progress.js';
import { saveResult } from './storage.js';
import { setGameStatistics, setPhraseStatistics } from './stats.js';

export function startGame(storedLines, gameStatistics, userName) {
    resetGame();
    showGameDiv();

    let progress = 0;
    let trackedText = "";
    let correctWords = 0;
    let result;
    const targetPhrase = storedLines[getRandomInt()];
    const targetPhraseWords = targetPhrase.line.split(" ");
    targetPhrase.tries++;
    let startTime = Date.now();
    const wordsArea = document.querySelector('#given-words-area');
    wordsArea.textContent = targetPhrase.line;
    const statusText = document.querySelector('#status-text');
    const wpmText = document.querySelector('#wpm-text');
    const accuracyText = document.querySelector('#accuracy-text');
    const progressBar = document.querySelector('#progress-bar');

    startChronometer();
    setResetButtonActive(false);

    function handleKeydown(event) {
        if (event.key.length === 1) {
            trackedText += event.key;
        } else if (event.key === "Backspace") {
            trackedText = trackedText.slice(0, -1);
        } else if (event.key === "Escape") {
            event.preventDefault();
            document.querySelector('#reset-btn').click();
            return;
        }

        result = highlightLetters(targetPhrase.line, wordsArea, trackedText, progress);

        updateProgressBar(result.completion, progressBar);

        const trackedWords = trackedText.split(" ");
        correctWords = trackedWords.reduce((count, word, index) => {
            if (word === targetPhraseWords[index]) {
                return count + 1;
            }
            return count;
        }, 0);

        const wpm = calculateWPM(correctWords, startTime);
        wpmText.textContent = `WPM: ${wpm}`;
        accuracyText.textContent = `Accuracy: ${result.accuracy}%`;

        if (trackedText === targetPhrase.line) {
            statusText.textContent = "You typed the correct phrase!";
            statusText.style.color = "green";
            stopChronometer();
            saveResult(targetPhrase, storedLines, userName, wpm, result.accuracy);
            setGameStatistics(gameStatistics, storedLines);
            setPhraseStatistics(targetPhrase);
            document.removeEventListener("keydown", handleKeydown);
        } else {
            statusText.textContent = "Keep typing...";
            statusText.style.color = "red";
        }
    }

    document.removeEventListener("keydown", handleKeydown);
    document.addEventListener("keydown", handleKeydown);
};

function showGameDiv() {
    const gameDiv = document.querySelector('#game-div');
    gameDiv.style.display = 'flex';
}

export function resetGame() {
    stopChronometer();
    document.querySelector('#timer-display').textContent = "00:00:00.000";
    document.querySelector('#status-text').textContent = "";
    document.querySelector('#wpm-text').textContent = "WPM: 0";
    document.querySelector('#accuracy-text').textContent = "Accuracy: 100%";
    document.querySelector('#progress-bar').style.width = "0%";
    document.querySelector('#progress-bar').setAttribute("aria-valuenow", "0");
    document.querySelector('#given-words-area').innerHTML = "";
    document.querySelector('#start-test-btn').disabled = false;
    document.querySelector('#reset-btn').disabled = true;
}