export function getRandomInt() {
    return Math.floor(Math.random() * 14);
}

export function calculateWPM(correctWords, startTime) {
    const elapsedTime = (Date.now() - startTime) / 1000;
    const minutesElapsed = elapsedTime / 60;
    if (minutesElapsed > 0) {
        return Math.floor(correctWords / minutesElapsed);
    }
    return 0;
}

export function setResetButtonActive(status) {
    const resetBtn = document.querySelector('#reset-btn');
    resetBtn.disabled = status;
}

export function setStartBtnActive(status) {
    const startBtn = document.querySelector('#start-test-btn');
    startBtn.disabled = status;
}
