
const timeDisplay = document.querySelector("#display-time");
const italicContainer = document.querySelector("#italic-word");
const button = document.querySelector('button');
const img = document.querySelector("#todo-image");
const tvScreen = document.querySelector("#click-overlay");
const placeholder = document.querySelector("#no-video-text");
const addMusicBtn = document.querySelector("#add-music-button");
const staticTvScreen = document.querySelector("#static-tv-screen");

// TODO: Setting same time for each distinct state prevents change of state due to equality
const STATE = {
    "STUDYING": "0:03",
    "SHORT_BREAK": "0:02",
    "LONG_BREAK": "0:01"
}

const TRAFFIC_LIGHT = {
    "GREEN": 'images/traffic-lights/64px-Traffic_lights_dark_green.svg.png',
    "YELLOW": 'images/traffic-lights/64px-Traffic_lights_dark_yellow.svg.png',
    "RED": 'images/traffic-lights/64px-Traffic_lights_dark_red.svg.png'
}

let numPomodoros = 0;
let timeStopped = true;
let currentState = STATE.STUDYING;
let [minutesLeft, secondsLeft] = currentState.split(":");
let alarmTimerIdInterval = null;
let colorToggleGrey = true;
let musicToBePlayed = [];
let lastVideoAdded = null;

function updateClock(){
    [minutesLeftCurrentSession, secondsLeftCurrentSession] = currentState.split(":");

    // Indicates less than 1 minute before alarm
    if (minutesLeft == 0){
        img.src = TRAFFIC_LIGHT.YELLOW;
    }
    

    // Stops timer to play alarm after each session
    if (minutesLeft == 0 && secondsLeft == 0){
        const audio = new Audio('audio/Beep_alarm_clock.ogg');
        audio.play();

        audio.addEventListener('playing', () => {
            // Wrapping up study session
            if (currentState === STATE.STUDYING){
                ++numPomodoros;

                // Award longer break after 4 study sessions
                if (numPomodoros % 4 === 0){
                    currentState = STATE.LONG_BREAK;
                    [minutesLeft, secondsLeft] = (STATE.LONG_BREAK).split(":");
                }
                else {
                    currentState = STATE.SHORT_BREAK;
                    [minutesLeft, secondsLeft] = (STATE.SHORT_BREAK).split(":");
                }
                flashTimerIdInterval = setInterval(flashTimer, 250);

                italicContainer.textContent = "RELAX";
                italicContainer.style.color = 'rgb(127, 165, 255)';
            }

            // Wrapping up break session
            else {
                currentState = STATE.STUDYING;
                [minutesLeft, secondsLeft] = (STATE.STUDYING).split(":");
                italicContainer.textContent = "STUDY";
                italicContainer.style.color = 'red';
            }
            console.log(currentState);

            img.src = TRAFFIC_LIGHT.RED;

            displayTime(minutesLeft, secondsLeft);
            clearInterval(alarmTimerIdInterval);
        })

        // Starts new timer AFTER alarm goes off
        audio.addEventListener('ended', () => {
            clearInterval(flashTimerIdInterval);
            timeDisplay.style.color = '';
            alarmTimerIdInterval = setInterval(updateClock, SECOND)
            img.src = TRAFFIC_LIGHT.GREEN;
        })
    }

    // Prevents seconds from dipping into negatives
    else if (secondsLeft == 0){
        if (minutesLeft > 0){
            --minutesLeft;
        }
        secondsLeft = 59;
    }
    else {
        --secondsLeft;
    }

    displayTime(minutesLeft, secondsLeft);
}

// Ensures mm:ss format
function padTime(timeUnit){
    return String(timeUnit).padStart(2, "0")
}

function displayTime(minutes, seconds){
    timeDisplay.textContent = `${padTime(minutes)}:${padTime(seconds)}`;
}

function flashTimer(){
    if (timeDisplay.style.color === ''){
        timeDisplay.style.color = 'white';
    }
    else {
        timeDisplay.style.color = '';
    }
}

function toggleMute(){
    staticTvScreen.muted = !staticTvScreen.muted;
}


// Executes function to update displayed clock every second
SECOND = 1_000;
button.addEventListener('click', () => {
    timeStopped = !timeStopped;

    // Starts timer
    if (!alarmTimerIdInterval || !timeStopped){
        alarmTimerIdInterval = setInterval(updateClock, SECOND)
        if (currentState === STATE.STUDYING){
            italicContainer.textContent = "STUDY";
            italicContainer.style.color = 'red';
            img.src = TRAFFIC_LIGHT.GREEN;
        }
        else {
            italicContainer.textContent = "RELAX";
            italicContainer.style.color = 'rgb(127, 165, 255)';
            img.src = TRAFFIC_LIGHT.RED;
        }
    }

    // Stops timer if interruption occurs and resets it
    else {
        [minutesLeft, secondsLeft] = currentState.split(":");
        displayTime(minutesLeft, secondsLeft);
        clearInterval(alarmTimerIdInterval);
        img.src = TRAFFIC_LIGHT.RED;
    }
})

tvScreen.addEventListener('click', () => {
    let remoteImg = document.createElement("img")

    toggleMute();

    remoteImg.style.position = 'absolute';
    remoteImg.style.top = '10px';
    remoteImg.style.right = '10px';
    remoteImg.style.width = '40px';
    remoteImg.style.transform = 'rotateY(180deg)';
    remoteImg.src = "images/cartoon/Tv-remote_-_Delapouite_-_game-icons.svg"
    document.body.appendChild(remoteImg)
    tvScreen.remove();

    setTimeout( () => {
        if (remoteImg){
            document.body.removeChild(remoteImg);
        }
    }, 500);

});

addMusicBtn.addEventListener('click', () => {
    let searchBar = document.querySelector("input[type='search']");
    url = searchBar.value;
    searchBar.value = "";
    if (url.startsWith("https://www.youtube.com")){
        videoId = url.match(/(?<=\?v=)[^&]+/)
        embedLink = `https://www.youtube.com/embed/${videoId}`;
        thumbnailLink = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        // TODO: Throw error
        if (document.querySelector("#no-video-text")){
            placeholder.remove();
        }

        let addedMusic = document.createElement("img");

        addedMusic.setAttribute('width', '300');
        addedMusic.setAttribute('src', thumbnailLink);

        document.querySelector("#queue").appendChild(addedMusic);
        addedMusic.textContent = embedLink;
        if (colorToggleGrey){
            addedMusic.style.backgroundColor = "#e3e2de";
        }
        else {
            addedMusic.style.backgroundColor = "#b8b6b2";
        }

        colorToggleGrey = !colorToggleGrey;

        let firstVideo = musicToBePlayed[0];
        let lastVideoAdded = null;
        let newVideoBeingAdded = addedMusic;
        if (musicToBePlayed.length === 0){
            addedMusic.style.borderRadius = "10px";
        }
        else if (musicToBePlayed.length === 1){
            firstVideo.style.borderRadius = "10px 10px 0 0";
            newVideoBeingAdded.style.borderRadius = "0 0 10px 10px";
        }
        else {
            lastVideoAdded = musicToBePlayed[musicToBePlayed.length - 1];
            lastVideoAdded.style.borderRadius = "0";
            firstVideo.style.borderRadius = "10px 10px 0 0";
            newVideoBeingAdded.style.borderRadius = "0 0 10px 10px";
        }

        musicToBePlayed.push(addedMusic);
    }
    else{
        alert("Um... I'm not sure what you gave me");
    }
})

