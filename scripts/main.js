import { startGame, resetGame } from './game.js';
import { setUserName } from './storage.js';
import { setGameStatistics } from './stats.js';
import { setStartBtnActive } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector(".needs-validation");

    const storedLines = JSON.parse(localStorage.getItem("textLines")) || [];
    const gameStatistics = JSON.parse(localStorage.getItem("gameStatistics"));
    let userName = JSON.parse(localStorage.getItem('userName'));
    const userNameInput = document.querySelector('#username');

    setGameStatistics(gameStatistics, storedLines);
    setUserName(userNameInput, userName);

    setStartBtnActive(storedLines.length === 0);

    form.addEventListener("submit", function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else if (storedLines.length == 0) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            userName = setUserName(userNameInput, userName);
            startGame(storedLines, gameStatistics, userName);

            document.querySelector('#start-test-btn').disabled = true;
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

            setStartBtnActive(storedLines.length === 0);
        } catch (error) {
            console.error(error.message);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.querySelector('#start-test-btn').click();
        }
    });

});

document.querySelector('#reset-btn').addEventListener('click', resetGame);