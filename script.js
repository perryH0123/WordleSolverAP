const WORD_LENGTH = 6;

const FLIP_DURATION = 500;
const GROW_ANIMATION_DURATION=50;

let potentialWords;
let infoWords;
let duplicateLetters;

const guessGrid = document.querySelector("[data-guess-grid]");
const alertContainer = document.querySelector("[data-alert-container]");
const keyboard = document.querySelector("[data-keyboard]");
const checkbox = document.querySelector("[data-use-wordle]");

const handleKey = e => {
    switch(e.key){
        case "Enter":
            solveWords();
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
        } else if (e.key != "`") {
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
            case "`":
                break;
            default:
                displayAlert("Enter a state.",2000);
                shakeTiles(getActiveTiles());
        }
    }
}

const handleClick = e => {
    if(e.target.matches("[data-use-wordle]")){
        //useWordleProbabilities();
        return;
    }
    if(!awaitingState()){
        if(e.target.matches("[data-key]")) {
            submitKey(e.target.dataset.key);
        }
        switchInteractivity();
    } else {
        if(e.target.matches("[data-set-correct]")){
            setTileState(getLastActive(),"correct");
        }
        if(e.target.matches("[data-set-wrong-location]")){
            setTileState(getLastActive(),"wrong-location");
        }
        if(e.target.matches("[data-set-wrong]")){
            setTileState(getLastActive(),"wrong");
        }
    }
    
    if(e.target.matches("[data-enter]")){
        solveWords();
        return;
    }
    if(e.target.matches("[data-delete]")){
        deleteLastTile();
        return;
    }
    if(e.target.matches("[data-reset]")){
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
    return null;
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
            wordList.push(grid[tileCounter].dataset);
            tileCounter++;
        }
        gridList.push(wordList);
    }
    return gridList;
}

const deleteLastTile = () => {
    const lastTile = getLastFilled();
    if(!lastTile) return;
    const key = keyboard.querySelector(`[data-key="${lastTile.dataset.letter.toUpperCase()}"]`);
    const classes = ["correct","wrong-location","wrong"].forEach(classCSS => key.classList.remove(classCSS));
    if(!lastTile || lastTile.classList.contains("flip")) return;
    lastTile.textContent = "";
    delete lastTile.dataset.letter;
    delete lastTile.dataset.state;
    switchInteractivity();
}

const submitKey = key => {
    if(getActiveTiles > WORD_LENGTH) return;
    const nextTile = getFirstInactive();
    nextTile.textContent = key.toLowerCase();
    nextTile.dataset.state = "active";
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.classList.add("grow");
    setTimeout(()=>{nextTile.classList.remove("grow")},GROW_ANIMATION_DURATION);
    setButtonProcessing();
}

const setTileState = (tile, state) => {
    const key = keyboard.querySelector(`[data-key="${tile.dataset.letter.toUpperCase()}"]`);
    key.classList.add(state);
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
    document.addEventListener("click",handleClick);
}

const resetBoard = () => {
    setButtonProcessing();
    getFilled().forEach(tile=>{deleteLastTile()});
}

class repeatedLetter {
    constructor(letter, num){
        this[letter] = letter;
        this[occurances] = num;
    }
}

const hasRepeatedLetters = word => {
    for(let i = 0; i<word.length; i++){
        for(let j = i+1; j< word.length; j++){
            if(word[i] == word[j]) {

            }
        }
    }
    return false;
}

const generateCorrectPattern = gridAs2DList => {
    const result = [];
    for(let i = 0; i<WORD_LENGTH; i++) result.push(undefined);
    for(let i = 0; i<gridAs2DList[0].length; i++){
        let columnLetter;
        for(let j = 0; j<gridAs2DList.length; j++){
            if(gridAs2DList[j][i].state && gridAs2DList[j][i].state == "correct"){
                columnLetter = gridAs2DList[j][i].letter;
            }
        }
        result[i] = columnLetter;
    }
    return result;
}

const setButtonProcessing = () => {
    const button = document.querySelector("[data-view-output]");
    button.classList.add("processing");
    button.classList.remove("completed");
    button.textContent = "🤔";
    const outputs = document.querySelectorAll("[data-potential], [data-maximize]");
    outputs.forEach(element => element.textContent = "Waiting for computation...");
}

const setButtonCompleted = (potentialList, maximizeList) => {
    const button = document.querySelector("[data-view-output]");
    button.classList.remove("processing");
    button.classList.add("completed");
    button.textContent = ["💡","🧠","💪"][Math.floor(Math.random() * 3)];
    if(typeof potentialList == 'object'){
        if (potentialList.length <= 5) button.textContent="💯";
        if (potentialList.length < 1) button.textContent="😵";
    } 
    const potential = document.querySelector("[data-potential]");
    const maximize = document.querySelector("[data-maximize]");
    potential.textContent = potentialList ? potentialList.join(", ") : "";
    maximize.textContent = maximizeList ? maximizeList.join(", ") : "";
}

const buildLetterCounter = word => {
    const counter = {};
    for(let char of word){
        counter[char] = counter[char] ? counter[char]+1 : 1;
    }
    return counter;
}

/*const generateMisplacedPattern2 = gridAs2DList => {
    const pattern = [];
    for(let word of gridAs2DList){
        const hasRepeated = hasRepeatedLetters(word);
        for(let i = 0; i<word.length; i++){
            console.log(word[i]);
            if(hasRepeated) duplicateLetters.push(word[i]); //janky hueristic
            if(word[i].state && word[i].state == "wrong-location"){
                
                pattern.push({
                    letter: word[i],
                    invalidLocations: [],
                    numOccurances: 
                    addInvalidLocation = index => invalidLocations.push(index)
                });
            }
        }
    }
    return pattern;
}*/

const generateMisplacedPattern = gridAs2DList => {
    const pattern = {};
    for(const word of gridAs2DList){
        word.forEach((let, index) => {
            if(let.state == "wrong-location"){
                if(!pattern[let.letter]){ //this allows for no duplication of valid letters
                    pattern[let.letter] = {
                        disallowedIndex: [index]
                    };
                    return;
                } else {
                    pattern[let.letter].disallowedIndex.push(index);
                }
            }
        });
    }
    return pattern;
}

const generateInvalidPattern = (gridAs2DList, correctPattern=[]) => {
    const invalid = [];
    //const existsSomewhereInWord = Object.keys(misplacedPattern);
    for(const word of gridAs2DList){
        //first pass to detect shared yellows WITHIN the word
        const existsSomewhereInWord = [];
        for (const letterObj of word) {
            if(letterObj.letter && letterObj.state =="wrong-location" || letterObj.state=="correct") existsSomewhereInWord.push(letterObj.letter);
        }
        for(const letterObj of word){
            if(letterObj.letter && !existsSomewhereInWord.includes(letterObj.letter) && letterObj.state == "wrong"){
                invalid.push(letterObj.letter);
            }
            /**
             * For the meantime, the above hueristic is sufficient for determining if a letter is repeated or not and to avoid disqualifying
             * it if it is also marked yellow somewhere in the word.
             * 
             * A future version of the algorithm could include limiting the letters of the search to further refine the
             * results and avoid including entries with too many repeated letters in our guess.
             * 
             * In the current version of Wordle though, there are very little to none letters with more than 2 of the same letters,
             * meaning this algorithm is sufficient enough at catching repeats, and fulfills its purpose for the scope of the project.
             */
        }
    }
    return invalid;
}

const solveWords = () => {
    console.time("Execution time");
    duplicateLetters = [];
    const gridAs2DList = getTilesAs2DArray();
    const correctPattern = generateCorrectPattern(gridAs2DList);
    const misplacedPattern = generateMisplacedPattern(gridAs2DList);
    const invalidPattern = generateInvalidPattern(gridAs2DList,correctPattern);
    potentialWords = dictionary;
    infoWords = dictionary;
    correctPattern.forEach((letter, index) => {
        potentialWords = potentialWords.filter(word => (letter) ? word[index] == letter : true);
        infoWords = infoWords.filter(word => !word.includes(letter));
    });
    //console.log(potentialWords);
    //console.log(infoWords);
    //console.log(invalidPattern);
    invalidPattern.forEach((letter) => {
        potentialWords = potentialWords.filter(word => !word.includes(letter));
        infoWords = infoWords.filter(word => !word.includes(letter));
    });

    //console.log(potentialWords);
    //console.log(infoWords);

    //do misplaced last since this filtration is the most taxing
    for(const letterStr in misplacedPattern){
        const disallowedIndexIterable = misplacedPattern[letterStr].disallowedIndex;
        potentialWords=potentialWords.filter((word) => word.includes(letterStr));
        potentialWords=potentialWords.filter((word) => {
            let bad = false;
            for(const index of disallowedIndexIterable){
                //console.log(`${letterStr} is disallowed in position ${index}`)
                if (word[index] == letterStr) bad = true;
                //cannot return directly, ends the loop iteration for the word in question, resulting in only the first disallowedIndex being checked
            }
            return !bad;
        });
        infoWords = infoWords.filter(word => !word.includes(letterStr));
    }
    useWordleProbabilities();
    setButtonCompleted(orderWordsByScore(potentialWords),orderWordsByScore(infoWords,true));
    //console.log(potentialWords);
    //console.log(infoWords);
    console.timeEnd("Execution time")
}

setButtonProcessing();
startInteractivity();