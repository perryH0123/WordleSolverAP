const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const GROW_ANIMATION_DURATION = 50;
const DANCE_ANIMATION_DURATION = 500;

const guessGrid = document.querySelector("[data-guess-grid]");

const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const targetWord = targetWords[Math.floor(dayOffset)];


const startInteraction = () => {
    document.addEventListener("click",handleMouseClick);
    document.addEventListener("keydown",handleKeyPress);
}

const stopInteraction = () => {
    document.removeEventListener("click",handleMouseClick);
    document.removeEventListener("keydown",handleKeyPress);
}

const handleMouseClick = e => {
    if(e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key)
        return;
    }
    if(e.target.matches("[data-enter]")){
        submitGuess();
        return;
    }
    if(e.target.matches("[data-delete]")){
        deleteKey();
        return;
    }
}

const handleKeyPress = e => {
    if(e.key === "Enter"){
        submitGuess();
        return;
    }
    if(e.key === "Backspace" || e.key === "Delete"){
        deleteKey();
        return;
    }

    if(e.key.match(/^[a-z]$/)) {
        pressKey(e.key);
        return;
    }
}

const pressKey = key => {
    const activeTiles = getActiveTiles();
    if(getActiveTiles().length >= WORD_LENGTH) return;
    const nextTile = guessGrid.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
    nextTile.classList.add("grow");
    setTimeout(()=>{nextTile.classList.remove("grow")},GROW_ANIMATION_DURATION);
}

/*const getActiveTiles = () => {
    return guessGrid.querySelectorAll('[data-state="active"]');
}*/

const deleteKey = key => {
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length-1];
    if (lastTile == null) return;
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;
}

const submitGuess = () => {
    const activeTiles = [...getActiveTiles()]; //Array.from(getActiveTiles()); also works here
    if (activeTiles.length !== WORD_LENGTH) {
        showAlert("Not long enough");
        shakeTiles(activeTiles);
        return;
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    },"");
    console.log(guess);

    if(!dictionary.includes(guess)) {
        showAlert("Not in word list");
        shakeTiles(activeTiles);
        return;
    }

    stopInteraction();
    activeTiles.forEach((...params) => flipTiles(...params, guess));
}

const flipTiles = (tile, index, array, guess) => {
    const letter = tile.dataset.letter;
    const key = keyboard.querySelector(`[data-key="${letter.toUpperCase()}"]`);
    setTimeout(() => {
        tile.classList.add("flip");
    },index*(FLIP_ANIMATION_DURATION/2));

    tile.addEventListener("transitionend",()=>{
        tile.classList.remove("flip");
        if(targetWord[index] === letter){
            tile.dataset.state = "correct"
            key.classList.add("correct");
        } else {
            if (targetWord.includes(letter) && getRemainingCounts(guess, targetWord, letter,index) > 0){
                tile.dataset.state = "wrong-location";
                key.classList.add("wrong-locationn");
            } else {
                tile.dataset.state = "wrong";
                key.classList.add("wrong");
            }
        }

        if(index === array.length - 1){
            tile.addEventListener("transitionend",() => {
                startInteraction();
                checkWinLose(guess, array);
            }, {once: true});
        } 
    }, {once: true});
}

const showAlert = (msg,duration=1000) => {
    const alert = document.createElement("div");
    alert.textContent = msg;
    alert.classList.add("alert");
    alertContainer.prepend(alert);
    if(duration==null) return;

    setTimeout(()=>{
        alert.classList.add("hide");
        alert.addEventListener("transitionend", () => {
            alert.remove();
        })
    }, duration);
}

const shakeTiles = tiles => {
    tiles.forEach(tile => {
        tile.classList.add("shake");
        tile.addEventListener("animationend", ()=>{
            tile.classList.remove("shake");
        }, {once: true});
    });
}

const checkWinLose = (guess, tiles)=> {
    if(guess === targetWord) {
        console.log("win")
        showAlert("You Win",5000);
        danceTiles(tiles);
        stopInteraction();
        return;
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
    if(remainingTiles.length < 1){
        showAlert(targetWord.toUpperCase(), null);
        stopInteraction();
        return;
    }
}

const danceTiles = (tiles) => {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance");
            tile.addEventListener("animationend", ()=>{
                tile.classList.remove("shake");
            }, {once: true});
        }, index * DANCE_ANIMATION_DURATION / 5);
    });
}

const getRemainingCounts = (guess, target, letter,index) => {
    let filteredLetterCounter = 0;
    for(let i = 0; i<target.length; i++){
        if(target[i] == letter && guess[i] !== target[i]){
            filteredLetterCounter++;
            for(const l in target.substring(0,index)){
                if(l === letter){
                    filteredLetterCounter--;
                }
            }
        }
    }
    return filteredLetterCounter;
} 

startInteraction();