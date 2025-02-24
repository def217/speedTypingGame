export function saveResult(targetPhrase, storedLines, userName, wpm, accuracy) {
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

export function setUserName(userNameInput, userName) {
    if (userNameInput.value.trim() !== "") {
        localStorage.setItem("userName", JSON.stringify(userNameInput.value));
        return userNameInput.value;
    } else if (userName) {
        userNameInput.value = userName;
        return userName;
    }
}