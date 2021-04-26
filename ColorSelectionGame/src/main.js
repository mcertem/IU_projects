let score = 0;
let gameLevel, colorArray, targetColor;

$(document).ready(function () {
    $('#easy_btn').click(() => {
        gameLevel = 3;
        startGame();
    });
    $('#medium_btn').click(() => {
        gameLevel = 4;
        startGame();
    });
    $('#hard_btn').click(() => {
        gameLevel = 5;
        startGame();
    });

    changeScreenTo('level_selection_screen');
});

function startGame() {
    if (colorArray) colorArray = null;
    if (targetColor) targetColor = null;
    if (score) score = 0;

    designGameBoard();
    changeScreenTo('game_play_screen');
    startTimer();
}

function changeScreenTo(screenName) {
    $('#level_selection_screen').hide();
    $('#game_play_screen').hide();
    $('#result_screen').hide();

    $('#' + screenName).show();

}

function designGameBoard() {
    // reset board
    $('#game_bord_container').empty();

    // set color array (generate or shuffle)
    if (!colorArray) {
        colorArray = [];
        for (let i = 0; i < Math.pow(gameLevel, 2); i++) {
            colorArray.push(getRandomHexColor());
        }
    } else {
        colorArray = colorArray.sort(() => Math.random() - 0.5);
    }

    // set targetColor
    const indexOfTarget = Math.floor(Math.random() * Math.pow(gameLevel, 2));
    targetColor = colorArray[indexOfTarget];
    $('#target_cell').css('background-color', targetColor);

    // add cells to board table
    let tr, td;
    const table = document.createElement('table');
    for (let i = 0; i < gameLevel; i++) {
        tr = document.createElement('tr');
        for (let j = 0; j < gameLevel; j++) {
            td = document.createElement('td');
            td.classList.add('cell');
            td.style.backgroundColor = colorArray[i * gameLevel + j];
            td.addEventListener('click', onCellSelection);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    $('#game_bord_container').append(table);

}

function onCellSelection(event) {
    const bgColorHEX = rgb2hex(event.target.style.backgroundColor);
    if (targetColor.toLowerCase() === bgColorHEX) {
        score++;
        designGameBoard();
    }
}

function startTimer() {
    let counter = 60;
    $('#timer').text(counter);

    const timer = setInterval(() => {
        counter--;
        if (counter === 0) {
            $('#game_bord_container').empty();
            $('#final_score').text(score);
            changeScreenTo('result_screen');
            clearInterval(timer);
        } else {
            $('#timer').text(counter);
        }
    }, 1000);
}

function bilinmeyenHataMesajıVer() {
    alert("Bilinmeyen bir hata ile karşılaşıldı");
}