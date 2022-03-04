const button = document.querySelector("[data-view-output]");
const sheet = document.querySelector("[data-output-sheet]");
const close = document.querySelector("[data-close]");
const keyLog = document.querySelector("[data-debug]");
const clear = document.querySelector("[data-clear-debug]");

let keyHistory = [];

const togglePanelVisibility = () => {
    if(sheet.dataset.visibility == "hidden"){
        sheet.classList.remove("hidden");
        sheet.classList.remove("up");
        sheet.classList.add("down");
        sheet.dataset.visibility = "showing";
        sheet.addEventListener("transitionend",() => {
            close.addEventListener("click", hidePanel, {once: true})
        }, {once: true});
    } else {
        
        hidePanel();
    }
}

const hidePanel = () => {
    sheet.classList.remove("down");
    sheet.classList.add("up");
    sheet.classList.add("hidden");
    sheet.addEventListener("transitionend",()=>{
        sheet.dataset.visibility="hidden";
    },{once:true});
}

const logKey = e => {
    const timestamp = new Date();
    keyHistory.unshift(`[${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}] ${e.key.toLowerCase()}`);
    if(keyHistory.length > 200) keyHistory.pop();
    keyLog.innerHTML = keyHistory.join("<br>");
}

clear.addEventListener("click", () => {
    keyHistory = [];
    keyLog.innerHTML = keyHistory.join("<br>");
});

button.addEventListener("click",togglePanelVisibility);

document.addEventListener("keydown", logKey);