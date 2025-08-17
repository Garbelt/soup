const words = ["MORTALES", "SAGRADO", "LIBERTAD", "CADENAS", "TRONO", "NOBLE", "IGUALDAD", "DIGNÍSIMO", "SUD", "ARGENTINO", "SALUD", "ETERNOS", "LAURELES", "CORONADOS", "GLORIA", "VIVAMOS", "JUREMOS"];
let totalWords = words.length;
let usedWords = [];
const gridSize = 12;
let grid = [];
let correctCells = [];
let selectedCells = [];
const DIREC = [];
const CORSEL = [];
const INCORSEL = [];
let timerInterval;
let totalTimeInSeconds = 150;
let score = 0;

function getRandomLetterExcluding(excludedLetter) {
    let newLetter;
    do {
        newLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } while (newLetter === excludedLetter);
    return newLetter;
}

function createPuzzle() {
    grid = [];
    correctCells = [];
    selectedCells = [];
    DIREC.length = 0;
    CORSEL.length = 0;
    INCORSEL.length = 0;
    const puzzleElement = document.getElementById("puzzle");
    puzzleElement.innerHTML = "";

    let wordFound;
    do {
        wordFound = chooseNewWord();
    } while (usedWords.includes(wordFound));

    usedWords.push(wordFound);

    for (let i = 0; i < gridSize; i++) {
        const row = [];
        const rowElement = document.createElement("div");
        rowElement.classList.add("row");

        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${i}/${j}`;
            row.push(cell);
            rowElement.appendChild(cell);
        }

        grid.push(row);
        puzzleElement.appendChild(rowElement);
    }

    insertWordInGrid(wordFound);
    fillEmptyCells();
    const palabrasElement = document.getElementById("palabras");
    palabrasElement.textContent = `${wordFound}`;

    if (!timerInterval) {
        startTimer();
    }
}

function chooseNewWord() {
    const unusedWords = words.filter(word => !usedWords.includes(word));
    return unusedWords[Math.floor(Math.random() * unusedWords.length)];
}

function insertWordInGrid(word) {
    const wordLength = word.length;

    const { position, direction } = getRandomPositionAndDirection(wordLength);
    const { row, col } = position;

    if (direction === "horizontal") {
        for (let i = 0; i < wordLength; i++) {
            grid[row][col + i].textContent = word[i];
            correctCells.push({ row, col: col + i });
            DIREC.push(`${row}/${col + i}`);
        }
    } else {
        for (let i = 0; i < wordLength; i++) {
            grid[row + i][col].textContent = word[i];
            correctCells.push({ row: row + i, col });
            DIREC.push(`${row + i}/${col}`);
        }
    }
}

function getRandomPositionAndDirection(wordLength) {
    const remainingSpace = gridSize - wordLength;
    let direction, startRow, startCol;

    if (Math.random() < 0.5) {
        direction = "horizontal";
        startRow = Math.floor(Math.random() * gridSize);
        startCol = Math.floor(Math.random() * (remainingSpace + 1));
    } else {
        direction = "vertical";
        startRow = Math.floor(Math.random() * (remainingSpace + 1));
        startCol = Math.floor(Math.random() * gridSize);
    }

    return {
        position: { row: startRow, col: startCol },
        direction: direction
    };
}

function fillEmptyCells() {
    grid.forEach(row => {
        row.forEach(cell => {
            if (cell.textContent === "") {
                const excludedLetter = "";
                cell.textContent = getRandomLetterExcluding(excludedLetter);
            }
        });
    });
}

function startTimer() {
    updateTimerDisplay(totalTimeInSeconds);
    timerInterval = setInterval(() => {
        totalTimeInSeconds--;
        updateTimerDisplay(totalTimeInSeconds);

        if (totalTimeInSeconds <= 0) {
            clearInterval(timerInterval);
            setTimeout(checkCorrectCellsSelected, 0);
        }
    }, 1000);
}

function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    document.getElementById("reloj").textContent = `Tiempo: ${formattedTime}`;
}

function disableClicks() {
    document.body.classList.add("disable-clicks");
}

function enableClicks() {
    document.body.classList.remove("disable-clicks");
}

function showFoundMessage() {
    disableClicks(); // Disable clicks
    const messageElement = document.createElement("div");
    messageElement.textContent = "PALABRA ENCONTRADA";
    messageElement.classList.add("found-message");
    document.body.appendChild(messageElement);
    const audio = new Audio("sound/palabraencontrada.mp3");
    audio.play();
    setTimeout(() => {
        document.body.removeChild(messageElement);
        enableClicks(); // Enable clicks after the message is removed
        score += 30;
        
        document.getElementById("puntaje").textContent = `Puntaje: ${score}`;
        checkForBonus();
        createPuzzle();
    }, 3000);
}

function checkCorrectCellsSelected() {
    const allCorrectSelected = correctCells.every(cell => {
        const { row, col } = cell;
        const cellName = `${row}/${col}`;
        return CORSEL.includes(cellName);
    });

    const anyIncorrectSelected = INCORSEL.length > 0;

    if (allCorrectSelected && !anyIncorrectSelected) {
        showFoundMessage();
    }

    if (totalTimeInSeconds <= 0) {
        updateAcumulado(score); // Actualizar acumulado con el nuevo score
        showEndGameMessage();
        clearInterval(timerInterval);
    }
}

function showEndGameMessage() {
    disableClicks();
    const messageElement = document.createElement("div");
    messageElement.textContent = "FIN DE ESTE JUEGO";
    messageElement.classList.add("found-message");
    document.body.appendChild(messageElement);

    const audio = new Audio("sound/findejuego.mp3");
    audio.play();

    const backgroundAudio = document.getElementById('background-music');
    fadeOutAudio(backgroundAudio, 5000); // Reducir el volumen en 5 segundos

    setTimeout(() => {
        document.body.removeChild(messageElement);
        window.location.href = "out.html";
    }, 7000);

    const currentDate = new Date().toLocaleDateString();
    const userData = {
        fecha: currentDate,
        usuario: localStorage.getItem("ActualUs"),
        puntaje: score,
        juegonumero: incrementGameNumber(),
        game: "HNA_sdl",
        acumulado: parseInt(localStorage.getItem("acumulado"))|| 0,
        rutina: localStorage.getItem("rutina")
    };

    // Actualizar acumulado antes de agregar a gamesHistory
    userData.acumulado = parseInt(localStorage.getItem("acumulado")) || 0;

    const gamesHistory = JSON.parse(localStorage.getItem("gamesHistory")) || [];
    gamesHistory.push(userData);
    localStorage.setItem("gamesHistory", JSON.stringify(gamesHistory));

    
}

function incrementGameNumber() {
    let gameNumber = parseInt(localStorage.getItem("juegonumero")) || 0;
    gameNumber++;
    localStorage.setItem("juegonumero", gameNumber);
    return gameNumber;
}

function checkForBonus() {
    if (usedWords.length === totalWords) {
        const bonus = totalTimeInSeconds + (totalWords * 5);
        score += bonus;
        updateAcumulado(score); // Actualizar acumulado con el nuevo score
        document.getElementById("puntaje").textContent = `Puntaje: ${score}`;
        showBonusMessage(bonus);
    }
}

function fadeOutAudio(audio, duration) {
    let volume = audio.volume;
    const step = volume / (duration / 100); // calcular el decremento en cada paso
    const fadeAudio = setInterval(() => {
        if (volume > 0) {
            volume -= step;
            if (volume < 0) volume = 0;
            audio.volume = volume;
        } else {
            clearInterval(fadeAudio);
        }
    }, 100); // reducir el volumen cada 100ms
}

function showBonusMessage(bonus) {
    disableClicks();
    const bonusMessageElement = document.createElement("div");
    bonusMessageElement.innerHTML = `¡DESCUBRISTE TODAS LAS PALABRAS!<br>GANASTE UN BONUS DE ${bonus} PUNTOS.`;
    bonusMessageElement.classList.add("found-message");
    document.body.appendChild(bonusMessageElement);

    const backgroundAudio = document.getElementById('background-music');
    fadeOutAudio(backgroundAudio, 5000); // Reducir el volumen en 5 segundos

    setTimeout(() => {
        document.body.removeChild(bonusMessageElement);
        window.location.href = "out.html";
    }, 6000);

    const currentDate = new Date().toLocaleDateString();
    const userData = {
        fecha: currentDate,
        usuario: localStorage.getItem("ActualUs"),
        puntaje: score,
        juegonumero: incrementGameNumber(),
        game: "HNA_sdl",
        acumulado: parseInt(localStorage.getItem("acumulado")) || 0,
        rutina: localStorage.getItem("rutina")
    };

    // Actualizar acumulado antes de agregar a gamesHistory
    userData.acumulado = parseInt(localStorage.getItem("acumulado")) || 0;

    const gamesHistory = JSON.parse(localStorage.getItem("gamesHistory")) || [];
    gamesHistory.push(userData);
    localStorage.setItem("gamesHistory", JSON.stringify(gamesHistory));

   
}

function updateAcumulado(scoreToAdd) {
    let acumulado = parseInt(localStorage.getItem("acumulado")) || 0;
    acumulado += scoreToAdd;
    localStorage.setItem("acumulado", acumulado);
}

document.addEventListener("click", function(event) {
    const cell = event.target;
    if (cell.classList.contains("cell")) {
        const cellName = cell.id;

        if (DIREC.includes(cellName)) {
            if (CORSEL.includes(cellName)) {
                CORSEL.splice(CORSEL.indexOf(cellName), 1);
                cell.classList.remove("found");
            } else {
                CORSEL.push(cellName);
                cell.classList.add("found");
            }
        } else {
            if (INCORSEL.includes(cellName)) {
                INCORSEL.splice(INCORSEL.indexOf(cellName), 1);
                cell.classList.remove("found");
            } else {
                INCORSEL.push(cellName);
                cell.classList.add("found");
            }
        }

        setTimeout(checkCorrectCellsSelected, 0);
    }
});


fillEmptyCells();

