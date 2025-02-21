let intervalId;

function highlightLetters(targetPhrase, targetPhraseWords, wordsArea, trackedText, progress) {
    let highlightedText = "";

    for (let i = 0; i < targetPhrase.length; i++) {
        if (trackedText[i] === targetPhrase[i]) {
            highlightedText += `<span class="correct">${trackedText[i]}</span>`;
            progress++;
        } else if (trackedText[i] !== undefined) {
            highlightedText += `<span class="incorrect">${trackedText[i]}</span>`;
        } else {
            highlightedText += `<span class="remaining">${targetPhrase[i]}</span>`;
        }
    }

    trackedText.split(" ").forEach(line => {

    });

    wordsArea.innerHTML = highlightedText;
    return ((progress / targetPhrase.length) * 100)
}

function updateProgressBar(progress, progressBar) {
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;

    progressBar.setAttribute("aria-valuenow", progress);

    progressBar.style.width = progress + "%";
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
    let startTime;
    clearInterval(intervalId);
    startTime = Date.now();

    intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        document.querySelector('#timer-display').textContent = formatTime(elapsedTime);
    }, 10);
}

function stopChronometer() {
    clearInterval(intervalId);
}

function saveResult(targetPhrase, storedLines, userName) {
    let completionTime = {
        userName: userName,
        completionTime: document.querySelector('#timer-display').textContent,
        date: Date.now()
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

function setStatisctics(targetPhrase) {
    let index = 1;
    let tr = '';
    const scoreboard = document.querySelector('#scoreboard');

    const scoreboardBody = document.querySelector('#scoreboard-body');

    targetPhrase.completionTimes.forEach(time => {
        tr = document.createElement("tr");
        const th = document.createElement("th");
        const date = document.createElement("td");
        const completionTime = document.createElement("td");
        const name = document.createElement("td");
        th.scope = 'row';
        th.id = `scoreboard-row-${index}`;
        th.innerText = index;

        const now = new Date(time.date);
        const nowUtc = now.toUTCString().slice(0, -4);
        date.innerText = nowUtc.toString();
        completionTime.innerText = time.completionTime;
        name.innerText = time.userName;

        index++;
        tr.append(th, date, completionTime, name);
        scoreboardBody.appendChild(tr);
    });
}

function calculateWPM(correctWords, startTime) {
    const elapsedTime = (Date.now() - startTime) / 1000;
    const minutesElapsed = elapsedTime / 60;
    if (minutesElapsed > 0) {
        return Math.floor(correctWords / minutesElapsed);
    }
    return 0;
}

document.addEventListener('DOMContentLoaded', function () {
    const storedLines = JSON.parse(localStorage.getItem("textLines")) || [];
    document.querySelector('#start-test-btn').addEventListener('click', function () {
        this.disabled = true;
        let progress = 0;
        let trackedText = "";
        let correctWords = 0;
        const targetPhrase = storedLines[getRandomInt()];
        const targetPhraseWords = targetPhrase.line.split(" ");
        targetPhrase.tries++;
        let startTime = Date.now();
        const wordsArea = document.querySelector('#given-words-area');
        wordsArea.textContent = targetPhrase.line;
        const statusText = document.querySelector('#status-text');
        const wpmText = document.querySelector('#wpm-text');
        const progressBar = document.querySelector('#progress-bar');
        startChronometer();

        function handleKeydown(event) {
            if (event.key.length === 1) {
                trackedText += event.key;
            } else if (event.key === "Backspace") {
                trackedText = trackedText.slice(0, -1);
            }

            updateProgressBar(highlightLetters(targetPhrase.line, targetPhraseWords, wordsArea, trackedText, progress), progressBar);

            const trackedWords = trackedText.split(" ");
            correctWords = trackedWords.reduce((count, word, index) => {
                if (word === targetPhraseWords[index]) {
                    return count + 1;
                }
                return count;
            }, 0);

            const wpm = calculateWPM(correctWords, startTime);
            wpmText.textContent = `WPM: ${wpm}`;

            if (trackedText === targetPhrase.line) {
                statusText.textContent = "You typed the correct phrase!";
                statusText.style.color = "green";
                stopChronometer();
                saveResult(targetPhrase, storedLines, "Jonas");
                setStatisctics(targetPhrase);
                document.removeEventListener("keydown", handleKeydown);
            } else {
                statusText.textContent = "Keep typing...";
                statusText.style.color = "red";
            }
        }

        document.addEventListener("keydown", handleKeydown);
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
        } catch (error) {
            console.error(error.message);
        }
    });
});