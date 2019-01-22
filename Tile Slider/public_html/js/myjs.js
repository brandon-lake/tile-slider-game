/* Brandon Lake 000766089
 * I assert that this is all my own work, etc etc.
 * The purpose of this class is to contain all JavaScript methods and attributes for the puzzle slider web game.
 * Submitted for: November 21st, 2018
 */

// initialize and assign images 2d array
images = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];   // declare global 2d array for location of images
moves = 0;          // initialize global moves counter
score = 1500;       // score to be calculated by 1500 - (moves + time in seconds)
empty_i = 3;        // starting empty coordinates
empty_j = 3;        // starting empty coordinates
active = false;     // flag to stop timer.  Also, while false tiles cannot be moves

/**
 * This function changes the appearance of HTML elements to display the win screen
 */
function winState() {
    animateTrophy();
    document.getElementById("shuffle").outerHTML = "<button id='shuffle' onclick='shuffleBoard()'>Play Again?</button>";
    document.getElementById("shuffle").style.fontSize = "20px";
    document.getElementById("shuffle").style.height = "50px";
    document.getElementById("shuffle").style.marginTop = "5px";
    document.getElementById("help").style.visibility = "hidden";
}
/**
 * This function changes the appearance of HTML elements to display the menu, before the user clicks shuffle
 */
function menuState() {
    document.getElementById("curtain").style.visibility = "hidden";
    document.getElementById("shuffle").outerHTML = "<button id='shuffle' onclick='shuffleBoard()'>Shuffle!</button>";
    document.getElementById("shuffle").style.fontSize = "20px";
    document.getElementById("shuffle").style.height = "50px";
    document.getElementById("shuffle").style.marginTop = "5px";
    document.getElementById("title").innerHTML = "Shuffle the board!";
    document.getElementById("moves").style.visibility = "hidden";
    document.getElementById("score").style.visibility = "hidden";
    document.getElementById("help").style.visibility = "visible";
}
/**
 * This function changes the appearance of HTML elements when the game begins
 */
function playState() {
    document.getElementById("shuffle").outerHTML = "<button id='shuffle' onclick='solve()'>Help me I'm stuck!</button>";
    document.getElementById("shuffle").style.fontSize = "14px";
    document.getElementById("shuffle").style.height = "30px";
    document.getElementById("shuffle").style.marginTop = "13px";
    document.getElementById("moves").style.visibility = "visible";
    document.getElementById("title").innerHTML = "Time --- 00:00";
    document.getElementById("moves").innerHTML = "Moves: 0";
    document.getElementById("score").style.visibility = "visible";
    document.getElementById("score").innerHTML = "Score: " + score;
}
/**
 * This function changes the appearance of HTML elements to display the help menu
 */
function helpMenu() {
    document.getElementById("container").style.visibility = "hidden";
    document.getElementById("info").style.visibility = "visible";
    document.getElementById("shuffle").style.visibility = "hidden";
    document.getElementById("help").style.visibility = "hidden";
    document.getElementById("moves").style.visibility = "hidden";
    if (document.getElementById("title").innerHTML == "Shuffle the board!")
        document.getElementById("title").style.visibility = "hidden";
}
/**
 * This function changes the appearance of HTML elements to exit the help menu
 */
function exitHelp() {
    document.getElementById("container").style.visibility = "visible";
    document.getElementById("info").style.visibility = "hidden";
    document.getElementById("shuffle").style.visibility = "visible";
    document.getElementById("help").style.visibility = "visible";
    document.getElementById("title").style.visibility = "visible";
    document.getElementById("moves").style.visibility = "visible";
}

/**
 * This function causes the trophy picture to fade in when the player wins.
 * I coded this before I learned jQuery, and don't feel like adding jQuery just for this,
 * even though it would only take a single line of code.
 */
function animateTrophy() {
    document.getElementById("curtain").style.visibility = "visible";
    document.getElementById("curtain").style.opacity = "0";
    var opacityValue = 0;
    var animate = setInterval(function () {
        if (opacityValue >= 1)
            clearTimeout(animate);
        opacityValue += 0.1;
        document.getElementById("curtain").style.opacity = opacityValue;
    }, 75);
}

/**
 * This function checks if the board has been correctly arranged.  This method is called
 * after every time the player moves a tile
 */
function checkWin() {
    var count = 1;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (images[i][j] !== count++) {
                return false;
            }
        }
    }

    active = false;     // game is no longer live
    setTimeout(winState, 250);
}

/**
 * This function performs a few different things depending on the state of the game.
 * When clicking "Let's Play" or "Play Again?", brings the user to the menu
 * When clicking "Shuffle", shuffles the board and checks that the board is solvable
 * - randomly shuffling the board has a 50% chance of leaving the board unsolvable
 */
function shuffleBoard() {
    if (document.getElementById("shuffle").innerHTML === "Let's Play!") {
        document.getElementById("container").style.visibility = "visible";
        document.getElementById("help").style.visibility = "visible";
        menuState();
    } else if (document.getElementById("shuffle").innerHTML === "Play Again?") {
        // reset board and move count
        moves = 0;
        var count = 1;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                images[i][j] = count++;
            }
        }
        display();
        menuState();
    } else {    // button text = "Shuffle!" or game is live
        // adapted fisher-yates shuffle
        for (var i = 3; i >= 0; i--) {
            for (var j = 3; j >= 0; j--) {
                var m = Math.floor(Math.random() * i);
                var n = Math.floor(Math.random() * j);
                swap(i, j, m, n);
            }
        }
        if (!checkSolvable()) {
            shuffleBoard();
        }
        display();

        score = 1500;
        playState();
        active = true;  // game is now live
        start();
    }
}

/**
 * Function to check if the board is solvable after a shuffle
 */
function checkSolvable() {
    // find empty square
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (images[i][j] === 16) {
                empty_i = i;
                empty_j = j;
            }
        }
    }

    /* count inversions (empty square does not count for inversions)
     * an inversion is an square being one spot earlier than it should be.
     * If a square is two spots earlier than it should be, that counts for two inversions.  etc */
    var inversions = 0;
    var flat = flatten(images);
    for (var m = 0; m < 15; m++) {
        for (var n = m + 1; n < 16; n++) {
            if (flat[m] !== 16 && flat[n] !== 16 && flat[m] > flat[n])
                inversions++;
        }
    }

    // for a 4x4 grid, if the number of inversions is odd, the empty square must be on an even row (counting 0, 1, 2, 3), and vice versa
    if ((inversions % 2) !== (empty_i % 2))
        return true;
    return false;
}

/**
 * Function to flatten a 2D array into a 1D array, as the .flat() method is not fully supported yet
 * @param {2D array} array The 2D array of numbers representing the game board
 */
function flatten(array) {
    var arr = new Array(16);
    var count = 0;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            arr[count++] = array[i][j];
        }
    }
    return arr;
}

/**
 * Function to check if the clicked tile is adjacent to the empty square, and if so, move the tile
 * and then re-print the game board
 * @param {Number} i The row of the clicked tile
 * @param {Number} j The column of the clicked tile
 */
function move(i, j) {
    if (active) {
        // check if clicked block is a neighbour
        if (Math.abs(empty_i - i) === 1 && empty_j === j)
            var horizontal_neighbour = true;
        if (Math.abs(empty_j - j) === 1 && empty_i === i)
            var vertical_neighbour = true;

        // is neighbour, move block
        if (horizontal_neighbour || vertical_neighbour) {
            swap(i, j, empty_i, empty_j);
            display();
            empty_i = i;
            empty_j = j;
            document.getElementById("moves").innerHTML = "Moves: " + ++moves;
            if (score > 0)
                document.getElementById("score").innerHTML = "Score: " + --score;
        }

        checkWin();
    }
}

/**
 * Function to swap the locations in the array of the clicked tile and the empty tile
 * This function is only called once it is determined that the empty tile is adjacent to
 * the clicked tile
 * @param {Number} i The row of the tile clicked
 * @param {Number} j The column of the tile clicked
 * @param {Number} m The row of the empty square
 * @param {Number} n The column of the empty square
 */
function swap(i, j, m, n) {
    var temp = images[i][j];
    images[i][j] = images[m][n];
    images[m][n] = temp;
}

/**
 * Function to print out the current state of the game board.  Called after every shuffle
 * and every move
 */
function display() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var num = images[i][j];
            var box = i + "" + j;
            if (num === 16) {
                document.getElementById(box).innerHTML = '<img style="opacity: 0" src="images/' + num + '.jpg" alt="' + num + '">';
            } else {
                document.getElementById(box).innerHTML = '<img src="images/' + num + '.jpg" alt="' + num + '">';
            }
        }
    }
}

/**
 * Function to leave the game board one move away from being solved.  This method is in place
 * to ensure that people who do not know how to solve these puzzles can still view the 
 * functionality of this game in the case of a win.
 */
function solve() {
    var count = 1;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            images[i][j] = count++;
        }
    }
    swap(3, 2, 3, 3);
    empty_i = 3;
    empty_j = 2;
    display();
    if (score > 1000)
        score -= (998 - moves);
    if (moves < 998)
        moves = 998;
    document.getElementById("moves").innerHTML = "Moves: " + moves;
    document.getElementById("score").innerHTML = "Score: " + score;
}

/**
 * Function to start a new timer
 */
function start() {
    var seconds = 0;
    var minutes = 0;
    var t = setInterval(increment, 1000);

    /**
     * Function to increment the current timer, and update the score and timer
     */
    function increment() {
        if (!active) {
            clearInterval(t);
        } else {
            seconds++;

            if (seconds > 59) {
                minutes++;
                seconds -= 60;
            }
            var time = "";
            if (minutes < 10)
                time += "0";
            time += "" + minutes + ":";
            if (seconds < 10)
                time += "0";
            time += "" + seconds;
            document.getElementById("title").innerHTML = "Time --- " + time;
            if (score > 0) {
                score = 1500 - (moves + seconds + (minutes > 0 ? (minutes * 60) : 0));
                document.getElementById("score").innerHTML = "Score: " + score;
            }
        }
    }
}