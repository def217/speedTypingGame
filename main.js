let intervalId;

function highlightLetters(targetPhrase, wordsArea, trackedText) {
    let highlightedText = "";
    let correctLetters = 0;
    let progress = 0;
    wordsArea.persistentIncorrectLetters = 0;
    wordsArea.errorPositions = {};

    if (!wordsArea.persistentIncorrectLetters) {
        wordsArea.persistentIncorrectLetters = 0;
    }

    for (let i = 0; i < targetPhrase.length; i++) {
        if (trackedText[i] === targetPhrase[i]) {
            highlightedText += `<span class="correct">${trackedText[i]}</span>`;
            correctLetters++;
            progress++;
        } else if (trackedText[i] !== undefined) {
            highlightedText += `<span class="incorrect">${trackedText[i]}</span>`;
            if (!wordsArea.errorPositions || !wordsArea.errorPositions[i]) {
                wordsArea.persistentIncorrectLetters++;
                wordsArea.errorPositions = wordsArea.errorPositions || {};
                wordsArea.errorPositions[i] = true;
            }
        } else {
            highlightedText += `<span class="remaining">${targetPhrase[i]}</span>`;
        }
    }

    wordsArea.innerHTML = highlightedText;

    let totalTyped = correctLetters + wordsArea.persistentIncorrectLetters;
    let accuracy = totalTyped > 0
        ? (100 - (wordsArea.persistentIncorrectLetters / totalTyped) * 100)
        : 100;

    return {
        completion: (progress / targetPhrase.length) * 100,
        accuracy: accuracy.toFixed(2)
    };
}


function updateProgressBar(progress, progressBar) {
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;

    progressBar.setAttribute("aria-valuenow", progress);
    progressBar.style.width = progress + "%";
    progressBar.style.background = `linear-gradient(to right, red, orange ${progress / 2}%, yellow ${progress}%, green)`;
}


function formatTime(elapsedTime) {
    const hours = Math.floor(elapsedTime / (3600 * 1000));
    const minutes = Math.floor((elapsedTime % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((elapsedTime % (60 * 1000)) / 1000);
    const milliseconds = elapsedTime % 1000;

    return (
        String(hours).padStart(2, '0') +
        ':' +
        String(minutes).padStart(2, '0') +
        ':' +
        String(seconds).padStart(2, '0') +
        '.' +
        String(milliseconds).padStart(3, '0')
    );
}

function startChronometer() {
    stopChronometer();
    let startTime = Date.now();

    intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        document.querySelector('#timer-display').textContent = formatTime(elapsedTime);
    }, 10);
}

function stopChronometer() {
    clearInterval(intervalId);
}

function saveResult(targetPhrase, storedLines, userName, wpm, accuracy) {
    let completionTime = {
        userName: userName,
        completionTime: document.querySelector('#timer-display').textContent,
        date: Date.now(),
        wpm: wpm,
        accuracy: accuracy
    }
    targetPhrase.completionTimes.push(completionTime);
    storedLines.forEach(line => {
        if (line.id == targetPhrase.id) {
            line.line = targetPhrase.line;
            line.tries = targetPhrase.tries;
        }
    });

    localStorage.setItem("textLines", JSON.stringify(storedLines));
}

function getRandomInt() {
    return Math.floor(Math.random() * 14);
}

function setGameStatistics(gameStatistics, storedLines) {
    let wpmArray = [];
    let accuracyArray = [];
    let averageWPM = 0;
    let averageAccuracy = 0;
    let gamesPlayed = 0;

    if (storedLines.length > 0) {
        storedLines.forEach(line => {
            line.completionTimes.forEach(time => {
                if (time.wpm) wpmArray.push(time.wpm)
                if (time.accuracy) accuracyArray.push(parseInt(time.accuracy))
            });
        });

        averageWPM = wpmArray.reduce((acc, num) => acc + num, 0) / wpmArray.length;
        averageAccuracy = accuracyArray.reduce((acc, num) => acc + num, 0) / accuracyArray.length;

        gamesPlayed = gameStatistics ? ++gameStatistics.gamesPlayed : 1;
    }

    const result = {
        gamesPlayed: gamesPlayed,
        averageWPM: Math.round(averageWPM),
        averageAccuracy: Math.round(averageAccuracy)
    }

    localStorage.setItem("gameStatistics", JSON.stringify(result));

    updateStatisticsDiv(result);
}

function setPhraseStatistics(targetPhrase) {
    let index = 1;
    const scoreboardBody = document.querySelector('#scoreboard-body');
    scoreboardBody.innerHTML = "";
    targetPhrase.completionTimes.sort((a, b) => {
        return timeToMilliseconds(a.completionTime) - timeToMilliseconds(b.completionTime);
    });

    targetPhrase.completionTimes.forEach(time => {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        const date = document.createElement("td");
        const completionTime = document.createElement("td");
        const name = document.createElement("td");
        const wpm = document.createElement("td");
        const accuracy = document.createElement("td");

        th.scope = 'row';
        th.id = `scoreboard-row-${index}`;
        th.innerText = index;

        const now = new Date(time.date);
        const nowUtc = now.toUTCString().slice(0, -4);
        date.innerText = nowUtc.toString();
        completionTime.innerText = time.completionTime;
        name.innerText = time.userName;
        wpm.innerText = time.wpm;
        accuracy.innerText = `${Math.round(time.accuracy)}%`;

        index++;
        tr.append(th, date, completionTime, wpm, accuracy, name);
        scoreboardBody.appendChild(tr);
    });
}

function updateStatisticsDiv(data) {
    gamesPlayed = document.querySelector('#games-played-text');
    averageAccuracy = document.querySelector('#average-accuracy-text');
    averageWPM = document.querySelector('#average-wpm-text');
    gamesPlayed.innerText = data.gamesPlayed;
    averageAccuracy.innerText = `${data.averageAccuracy}%`;
    averageWPM.innerText = data.averageWPM;
}

function timeToMilliseconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(":");
    const [secs, millis] = seconds.split(".");

    return (
        parseInt(hours) * 3600000 +
        parseInt(minutes) * 60000 +
        parseInt(secs) * 1000 +
        parseInt(millis)
    );
}

function calculateWPM(correctWords, startTime) {
    const elapsedTime = (Date.now() - startTime) / 1000;
    const minutesElapsed = elapsedTime / 60;
    if (minutesElapsed > 0) {
        return Math.floor(correctWords / minutesElapsed);
    }
    return 0;
}

function showGameDiv() {
    const gameDiv = document.querySelector('#game-div');
    gameDiv.style.display = 'flex';
}

function resetGame() {
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

function setUserName(userNameInput, userName) {
    if (userNameInput.value.trim() !== "") {
        localStorage.setItem("userName", JSON.stringify(userNameInput.value));
        return userNameInput.value;
    } else if (userName) {
        userNameInput.value = userName;
        return userName;
    }    
}

function setResetButtonActive(status) {
    const resetBtn = document.querySelector('#reset-btn');
    resetBtn.disabled = status;
}

function startGame(storedLines, gameStatistics, userName) {
    resetGame();
    showGameDiv();
    this.disabled = true;

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

    function handleKeydown(event) {
        if (event.key.length === 1) {
            trackedText += event.key;
        } else if (event.key === "Backspace") {
            trackedText = trackedText.slice(0, -1);
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
            setResetButtonActive(false);
            document.removeEventListener("keydown", handleKeydown);
        } else {
            statusText.textContent = "Keep typing...";
            statusText.style.color = "red";
        }
    }

    document.removeEventListener("keydown", handleKeydown);
    document.addEventListener("keydown", handleKeydown);
};

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector(".needs-validation");

    const storedLines = JSON.parse(localStorage.getItem("textLines")) || [];
    const gameStatistics = JSON.parse(localStorage.getItem("gameStatistics"));
    let userName = JSON.parse(localStorage.getItem('userName'));
    const userNameInput = document.querySelector('#username')

    setGameStatistics(gameStatistics, storedLines);
    setUserName(userNameInput, userName);

    form.addEventListener("submit", function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            userName = setUserName(userNameInput, userName);
            startGame(storedLines, gameStatistics, userName);
        }

        form.classList.add("was-validated");
    });

    document.querySelector('#fetch-new-words-btn').addEventListener('click', async function () {
        const url = "https://poetrydb.org/title/Ozymandias/lines.json";
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const data = await response.json();

            const linesWithInfo = data[0].lines.map((line, index) => {
                return {
                    id: index + 1,
                    line: line,
                    tries: 0,
                    completionTimes: []
                };
            });

            localStorage.setItem("textLines", JSON.stringify(linesWithInfo));
            storedLines.length = 0;
            storedLines.push(...linesWithInfo);
        } catch (error) {
            console.error(error.message);
        }
    });
});

document.querySelector('#reset-btn').addEventListener('click', resetGame);