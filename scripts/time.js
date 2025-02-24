let intervalId;

export function startChronometer() {
    stopChronometer();
    let startTime = Date.now();

    intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        document.querySelector('#timer-display').textContent = formatTime(elapsedTime);
    }, 10);
}

export function stopChronometer() {
    clearInterval(intervalId);
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

export function timeToMilliseconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(":");
    const [secs, millis] = seconds.split(".");

    return (
        parseInt(hours) * 3600000 +
        parseInt(minutes) * 60000 +
        parseInt(secs) * 1000 +
        parseInt(millis)
    );
}