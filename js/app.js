const memory = (function() {
    // This array determines which cards takes which position on the game board
    const deckArray = [],

        // Object holding strings 
        DOM = {
            scorePanel: '.score-panel',
            stars: '.stars',
            moves: '.moves',
            restartBtn: '.restart',
            deck: '.deck',
            card: '.card',
            match: '.match',
            timer: '.timer',
            btnStart: '.btn-start',
            btnRestart: '.btn-restart',
            resultMoves: '.result-moves',
            resultStars: '.result-stars',
            resultTime: '.result-time',
        },

        // Object with symbol for the cards
        cards = [
            'fa-envelope',
            'fa-joomla',
            'fa-github-alt',
            'fa-bug',
            'fa-comments',
            'fa-desktop',
            'fa-sitemap',
            'fa-laptop'
        ];

    /* 
     * Game state variables
     */
    let
        firstCard,
        freezeGame = false,
        moves = 0,
        stars = 3,
        startTime = 0,
        timerInterval,
        totalTime = 0;


    /* HELPER FUNCTIONS */

    /**
     * function shuffleCards
     * description Shuffles the content of an array in the provided amount of times (Credt: http://stackoverflow.com/a/2450976)
     * param {Array} cards - Array of cards
     * param {number} times - Number of times to shuffle the array
     */
    const shuffleCards = function(cards, times) {
        for (let i = 0; i < times; i++) {
            let currentIndex = cards.length,
                temporaryValue, randomIndex;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = cards[currentIndex];
                cards[currentIndex] = cards[randomIndex];
                cards[randomIndex] = temporaryValue;
            }
        }
        return cards;
    };

    /**
     * function formatTime
     * description Converts miliseconds to an object separated as minutes and seconds (if seconds < 10, then it has a preceding 0)
     * param {number} ms - Time to convert to an object
     * returns {Object} with two properties (minutes, seconds)
     */
    const formatTime = function(ms) {
        // Convert ms to s
        const unformattedSeconds = Math.floor(ms / 1000);
        // If applies, extract amount of minutes
        const minutes = unformattedSeconds >= 60 ? Math.floor(unformattedSeconds / 60) : 0;
        // Removing the minutes and get the rest of the time as seconds
        const seconds = minutes > 0 ? unformattedSeconds - (minutes * 60) : unformattedSeconds;

        return {
            minutes,
            seconds: seconds < 10 ? '0' + seconds : seconds
        };
    };


    /* GAME STATE FUNCTIONS */

    /**
     * function cardsMatch
     * description Returns true if selectedCard matches with firstCard
     * param {DOMNode} selectedCard - Node of the card to compare with firstCard
     * returns {Boolean}
     */
    const cardsMatch = function(selectedCard) {
        return deckArray[firstCard.dataset.index] === deckArray[selectedCard.dataset.index];
    };

    /**
     * function finishTurn
     * description Releases frozen game state and start the next turn
     */
    const finishTurn = function() {
        firstCard = null;
        freezeGame = false;
    };

    /**
     * function isGameWon
     * description Returns true when game is finished
     */
    const isGameWon = function() {
        return document.querySelectorAll(DOM.card).length === document.querySelectorAll(DOM.match).length;
    };

    /**
     * function runTimer
     * description Computes the current total time and passes to displayTimer
     */
    const runTimer = function() {
        startTime = Date.now();
        timerInterval = setInterval(function() {
            totalTime = Date.now() - startTime;
            displayTimer(totalTime);
        }, 1000);
    };

    /**
     * function stopTimer
     * description Stops the timer
     */
    const stopTimer = function() {
        clearInterval(timerInterval);
    };

    /**
     * function updateStars
     * description Computes the current number of stars passes the value to displayStars to be rendered
     */
    const updateStars = function() {
        // Stars cannot be lower than 0
        if (stars === 1 || moves <= deckArray.length) return;

        // Reduce half a star for every 6 moves over the amount of cards in the deck
        if ((moves - deckArray.length) % 6 === 0) {
            stars -= 0.5;
            displayStars();
        }
    };

    /**
     * function updateMoves
     * description Increments move by 1 and updates the UI
     */
    const updateMoves = function() {
        moves++;
        displayMoveCounter();
    };


    /* UI CONTROL */


    const gameWon = function() {
        stopTimer();
        displayModal('finished');
    };


    const toggleCardsStyle = function(cardOne, cardTwo, className) {
        cardOne.classList.toggle(className);
        cardTwo.classList.toggle(className);
    };


    const hideModal = function(type) {
        const body = document.querySelector('body');
        body.classList.remove('modal');
        body.classList.remove(type);
        startGame();
    };

    const displayModal = function(type) {
        const body = document.querySelector('body');
        body.classList.add('modal');
        body.classList.add(type);

        if (type === 'finished') {
            displayResults();
        }
    };


    const displayResults = function() {
        const formattedTime = formatTime(totalTime);
        const minutes = formattedTime.minutes;
        const seconds = formattedTime.seconds;

        let timeString = minutes > 0 ? (minutes > 1 ? minutes + ' minutes ' : minutes + ' minute ') : '';
        timeString += seconds + ' seconds';

        document.querySelector(DOM.resultMoves).textContent = moves / 2;
        document.querySelector(DOM.resultStars).textContent = stars;
        document.querySelector(DOM.resultTime).textContent = timeString;
    };


    const displayTimer = function(ms) {
        const formattedTime = formatTime(ms);
        document.querySelector(DOM.timer).textContent = `${formattedTime.minutes}:${formattedTime.seconds}`;
    };


    const resetTimer = function() {
        displayTimer(0);
    };


    const displayStars = function() {
        let html = '';
        for (let i = 0; i < 3; i++) {
            if (stars > i) {
                if (stars === i + 0.5) {
                    html += '<i class="fa fa-star-half-o"></i>';
                } else {
                    html += '<i class="fa fa-star"></i>';
                }
            } else {
                html += '<i class="fa fa-star-o"></i>';
            }
        }

        document.querySelector(DOM.stars).innerHTML = html;
    };


    const displayMoveCounter = function() {
        document.querySelector(DOM.moves).textContent = Math.round(moves) / 2;
    };


    const createListItem = function(icon, index) {
        return `<li class="card" data-index="${index}"><i class="fa ${icon}"></i></li>`;
    };


    const generateDeck = function() {
        let html = deckArray.map(function(icon, index) {
            return createListItem(icon, index);
        }).join('');

        document.querySelector(DOM.deck).innerHTML = html;
    };


    const render = function() {
        generateDeck();
        displayMoveCounter();
        displayStars();
    };


    /* GAME CONTROL */


    const showCards = function(evt) {
        // Silently return function when clicked element is not a list item or is currently being shown
        if (evt.target.tagName !== 'LI' || evt.target.classList.contains('open') || freezeGame) return;

        const selectedCard = evt.target;
        selectedCard.classList.add('open');

        // Increment move counter and update the display
        updateMoves();
        updateStars();

        // Check if it is the second shown card in this turn
        if (firstCard) {
            // Check if cards match
            freezeGame = true;
            if (cardsMatch(selectedCard)) {
                setTimeout(function() {
                    toggleCardsStyle(firstCard, selectedCard, 'match');
                    finishTurn();

                    // Check if game is won
                    if (isGameWon()) {
                        gameWon();
                    }
                }, 200);
            } else {
                setTimeout(function() {
                    toggleCardsStyle(firstCard, selectedCard, 'mismatch');

                    // Hide cards again after indicating the mismatch
                    setTimeout(function() {
                        toggleCardsStyle(firstCard, selectedCard, 'open');
                        toggleCardsStyle(firstCard, selectedCard, 'mismatch');
                        finishTurn();
                    }, 500);
                }, 200)
            }
        } else {
            // If this is the first card uncovered this turn, then store it to a variable to compare it with the next card
            firstCard = selectedCard;
        }
    };

    /**
     * function setEventHandler
     * description Registers event handlers on the game interface
     *fixed restarting bug with memory previous card
     */
    const setEventHandler = function() {
        document.querySelector(DOM.deck).addEventListener('click', showCards);
        document.querySelector(DOM.restartBtn).addEventListener('click', function() {
            window.location.reload();
            arrayList[0].forEach(game);

        });


        document.querySelector(DOM.btnStart).addEventListener('click', function() {
            hideModal('start');
        });
        document.querySelector(DOM.btnRestart).addEventListener('click', function() {
            hideModal('finished');
        });
    };

    /**
     * function startGame
     * description Resets the game state and starts a new session
     */

    const startGame = function() {
        moves = 0;
        stars = 3;
        totalTime = 0;
        deckArray.splice(0, deckArray.length);
        deckArray.push(...shuffleCards([...cards, ...cards], 3));
        resetTimer();
        runTimer();
        render();
        reload();

    };

    /**
     * function init
     * description Initializes the game and binds event handlers
     */
    const init = function() {

        deckArray.push(...shuffleCards([...cards, ...cards], 3));

        render();
        setEventHandler();
    };

    return {
        init,
    };
})();

memory.init();