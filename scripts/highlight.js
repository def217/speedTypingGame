export function highlightLetters(targetPhrase, wordsArea, trackedText) {
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