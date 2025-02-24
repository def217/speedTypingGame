import { timeToMilliseconds } from './time.js';

export function setGameStatistics(gameStatistics, storedLines) {
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

        gamesPlayed = gameStatistics ? ++gameStatistics.gamesPlayed : 0;
    }

    const result = {
        gamesPlayed: gamesPlayed,
        averageWPM: Math.round(averageWPM) || 0,
        averageAccuracy: Math.round(averageWPM) || 0
    }

    localStorage.setItem("gameStatistics", JSON.stringify(result));

    updateStatisticsDiv(result);
}

export function setPhraseStatistics(targetPhrase) {
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
    let gamesPlayed = document.querySelector('#games-played-text');
    let averageAccuracy = document.querySelector('#average-accuracy-text');
    let averageWPM = document.querySelector('#average-wpm-text');
    gamesPlayed.innerText = data.gamesPlayed;
    averageAccuracy.innerText = `${data.averageAccuracy}%`;
    averageWPM.innerText = data.averageWPM;
}