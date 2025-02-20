function highlightText(targetPhrase, wordsArea, trackedText, progress) {
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

    wordsArea.innerHTML = highlightedText;
    return ((progress / targetPhrase.length) * 100)
}

function updateProgressBar(progress, progressBar) {
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;

    progressBar.setAttribute("aria-valuenow", progress);

    progressBar.style.width = progress + "%";
}

// Function to format time as HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(hours).padStart(2, '0') +
        ':' +
        String(minutes).padStart(2, '0') +
        ':' +
        String(remainingSeconds).padStart(2, '0')
    );
}

// Function to start the chronometer
function startChronometer() {
    let intervalId;
    let elapsedSeconds = 0;
    // Clear any existing interval to avoid multiple timers
    clearInterval(intervalId);

    // Reset the timer
    elapsedSeconds = 0;
    document.querySelector('#timer-display').textContent = formatTime(elapsedSeconds);

    // Start updating the timer every second
    intervalId = setInterval(() => {
        elapsedSeconds++;
        document.querySelector('#timer-display').textContent = formatTime(elapsedSeconds);
    }, 1000);
}


document.querySelector('#start-test-btn').addEventListener('click', function () {
    this.disabled = true;
    let progress = 0;
    let trackedText = "";
    const storedLines = JSON.parse(localStorage.getItem("textLines"));
    const targetPhrase = storedLines[0];

    const wordsArea = document.querySelector('#given-words-area');
    wordsArea.textContent = targetPhrase;

    const statusText = document.querySelector('#status-text');

    const progressBar = document.querySelector('#progress-bar');

    startChronometer()

    function handleKeydown(event) {
        if (event.key.length === 1) {
            trackedText += event.key;
        } else if (event.key === "Backspace") {
            trackedText = trackedText.slice(0, -1);
        }

        updateProgressBar(highlightText(targetPhrase, wordsArea, trackedText, progress), progressBar);

        if (trackedText === targetPhrase) {
            statusText.textContent = "You typed the correct phrase!";
            statusText.style.color = "green";
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
        localStorage.setItem("textLines", JSON.stringify(data[0].lines));
    } catch (error) {
        console.error(error.message);
    }
});
