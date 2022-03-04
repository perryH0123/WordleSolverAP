const WORD_LENGTH = 6;

const FLIP_DURATION = 500;
const GROW_ANIMATION_DURATION=50;

const guessGrid = document.querySelector("[data-guess-grid]");
const alertContainer = document.querySelector("[data-alert-container]");
const keyboard = document.querySelector("[data-keyboard]");

const handleKey = e => {
    switch(e.key){
        case "Enter":
            calculateWords();
            return;
        case "Delete":
            deleteLastTile();
            return;
        case "Backspace":
            deleteLastTile();
            return;
    }

    if(!awaitingState()){
        if(e.key.toLowerCase().match(/^[a-z]$/)){
            submitKey(e.key);
            switchInteractivity();
            return;
        } else {
            displayAlert("Enter a Key.", 2000);
            shakeTiles(getActiveTiles());
        }
    } else {
        switch(e.key){
            case "1":
                setTileState(getLastActive(),"correct");
                break;
            case "2":
                setTileState(getLastActive(),"wrong-location");
                break;
            case "3":
                setTileState(getLastActive(),"wrong");
                break;
            default:
                displayAlert("Enter a state.",2000);
                shakeTiles(getActiveTiles());
        }
    }
}

const handleClick = e => {
    if(e.target.matches("[data-key]")) {
        submitKey(e.target.dataset.key);
        return;
    }
    if(e.target.matches("[data-enter]")){
        calculateWords();
        return;
    }
    if(e.target.matches("[data-delete]")){
        deleteLastTile();
        return;
    }
    if(e.target.matches("[data-set-correct]")){
        setTileState(getLastActive(),"correct");
        return;
    }
    if(e.target.matches("[data-set-wrong-location]")){
        setTileState(getLastActive(),"wrong-location");
        return;
    }
    if(e.target.matches("[data-set-wrong]")){
        setTileState(getLastActive(),"wrong");
        return;
    }
    if(e.target.matches("data-delete")){
        resetBoard();
        return;
    }
}

const getActiveTiles = () => {
    return guessGrid.querySelectorAll('[data-state="active"]');
}

const getLastActive = () => {
    const activeTiles = getActiveTiles();
    return activeTiles[activeTiles.length-1];
}

const getFirstInactive = () => {
    return guessGrid.querySelector(":not([data-letter])");
}

const getAllTiles = () => {
    return guessGrid.querySelectorAll(".tile");
}

const getLastFilled = () => {
    const tiles = getAllTiles();
    for(let i = tiles.length-1; i>=0; i--) {
        if(tiles[i].dataset.letter) return tiles[i];
    }
}

const getFilled = () => {
    return guessGrid.querySelectorAll(".tile[data-letter]")
}


const awaitingState = () => {
    const activeTiles = getActiveTiles();
    if(activeTiles.length < 1) return false;
    return getLastActive().dataset.state == "active";  
}

const awaitingKey = () => {
    const allTiles = getAllTiles();
    if(allTiles.length < 1) return true;
    return allTiles[allTiles.length-1].dataset.state != "active"
}

const getTilesAs2DArray = (wordLength=5, numWords=6) => {
    const grid = getAllTiles();
    let tileCounter = 0;
    const gridList = [];
    for(let i = 0; i<numWords; i++){
        const wordList = [];
        for(let j = 0; j<wordLength; j++){
            wordList.push(grid[tileCounter].dataset.letter);
            tileCounter++;
        }
        gridList.push(wordList);
    }
    return gridList;
}

const deleteLastTile = () => {
    const lastTile = getLastFilled();
    if(!lastTile || lastTile.classList.contains("flip")) return;
    lastTile.textContent = "";
    delete lastTile.dataset.letter;
    delete lastTile.dataset.state;
}

const submitKey = key => {
    if(getActiveTiles > WORD_LENGTH) return;
    const nextTile = getFirstInactive();
    nextTile.textContent = key.toLowerCase();
    nextTile.dataset.state = "active";
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.classList.add("grow");
    setTimeout(()=>{nextTile.classList.remove("grow")},GROW_ANIMATION_DURATION);
}

const setTileState = (tile, state) => {
    tile.classList.add("flip");
    tile.addEventListener("transitionend",() => {
        tile.dataset.state = state;
        tile.classList.remove("flip");
        switchInteractivity();
    }, {once:true});
}

const switchInteractivity = () => {
    const controls = keyboard.querySelectorAll("[data-control]");
    const keys = keyboard.querySelectorAll("[data-key]");

    if (awaitingState()){
        keys.forEach(node => {
            node.classList.add("inactive");
        });
        controls.forEach(node => {
            node.classList.remove("inactive");
        });
    } else {
        keys.forEach(node => {
            node.classList.remove("inactive");
        });
        controls.forEach(node => {
            node.classList.add("inactive");
        });
    }
}

const displayAlert = (msg, duration=1000) => {
    const alert = document.createElement("div");
    alert.innerText = msg;
    alert.classList.add("alert");
    alertContainer.prepend(alert);
    if(!duration) return;
    setTimeout(()=>{
        alert.classList.add("hide");
        alert.addEventListener("transitionend",()=>{
            alert.remove();
        });
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

const startInteractivity = () => {
    document.addEventListener("keydown",handleKey);
}

const resetBoard = () => {
    getFilled().forEach(tile=>{deleteLastTile()});
}

startInteractivity();