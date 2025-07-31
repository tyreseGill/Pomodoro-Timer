
const timeDisplay = document.querySelector("#display-time");
const italicContainer = document.querySelector("#italic-word");
const startPauseTimerBtn = document.querySelector('#timer-button');
const img = document.querySelector("#todo-image");

const STATE = {
    "STUDYING": "00:00",
    "SHORT_BREAK": "5:00",
    "LONG_BREAK": "30:00"
}

const TRAFFIC_LIGHT = {
    "GREEN": 'images/traffic-lights/64px-Traffic_lights_dark_green.svg.png',
    "YELLOW": 'images/traffic-lights/64px-Traffic_lights_dark_yellow.svg.png',
    "RED": 'images/traffic-lights/64px-Traffic_lights_dark_red.svg.png'
}

let timeoutId;
let numPomodoros = 0;
let alarmTimerIdInterval = null;
let timeStopped = true;
let currentTimerState = STATE.STUDYING;
let [minutesLeft, secondsLeft] = currentTimerState.split(":");

function updateClock(){
    [minutesLeftCurrentSession, secondsLeftCurrentSession] = currentTimerState.split(":");

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
            document.body.classList.toggle("relax");

            if (currentTimerState === STATE.STUDYING){
                ++numPomodoros;

                // Award longer break after 4 study sessions
                if (numPomodoros % 4 === 0){
                    currentTimerState = STATE.LONG_BREAK;
                    [minutesLeft, secondsLeft] = (STATE.LONG_BREAK).split(":");
                }
                else {
                    currentTimerState = STATE.SHORT_BREAK;
                    [minutesLeft, secondsLeft] = (STATE.SHORT_BREAK).split(":");
                }

                italicContainer.textContent = "RELAX";
                italicContainer.style.color = 'rgb(127, 165, 255)';

                updateSkipButton();
            }

            // Wrapping up break session
            else {
                currentTimerState = STATE.STUDYING;
                [minutesLeft, secondsLeft] = (STATE.STUDYING).split(":");
                italicContainer.textContent = "STUDY";
                italicContainer.style.color = 'red';
            }

            flashTimerIdInterval = setInterval(flashTimer, 250);
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

// Executes function to update displayed clock every second
SECOND = 1_000;
startPauseTimerBtn.addEventListener('click', () => {
    timeStopped = !timeStopped;

    // Starts timer
    if (!alarmTimerIdInterval || !timeStopped){
        alarmTimerIdInterval = setInterval(updateClock, SECOND)
        if (currentTimerState === STATE.STUDYING){
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
        [minutesLeft, secondsLeft] = currentTimerState.split(":");
        displayTime(minutesLeft, secondsLeft);
        clearInterval(alarmTimerIdInterval);
        img.src = TRAFFIC_LIGHT.RED;
    }
})
