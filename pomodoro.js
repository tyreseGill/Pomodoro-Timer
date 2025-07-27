
const timeDisplay = document.querySelector("#display-time");
const italicContainer = document.querySelector("#italic-word");
const button = document.querySelector('button');
const img = document.querySelector("#traffic-light");

let numPomodoros = 0;
let timeStopped = true;

const STATE = {
    "STUDYING": "25:00",
    "SHORT_BREAK": "5:00",
    "LONG_BREAK": "30:00"
}

let currentState = STATE.STUDYING;
let [minutesLeft, secondsLeft] = currentState.split(":");

let timerIdInterval = null;

function updateClock(){

    // Indicates less than 1 minute before alarm
    if (minutesLeft == 0){
        img.src = 'images/64px-Traffic_lights_dark_yellow.svg.png';
    }

    // Stops timer to play alarm after each session
    if (minutesLeft == 0 && secondsLeft == 0){
        const audio = new Audio('audio/Beep_alarm_clock.ogg');
        audio.play();

        audio.addEventListener('playing', () => {
            // Wrapping up study session
            if (currentState == STATE.STUDYING){
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

            img.src = 'images/64px-Traffic_lights_dark_red.svg.png';
            displayTime(minutesLeft, secondsLeft);
            clearInterval(timerIdInterval);
        })

        // Starts new timer AFTER alarm goes off
        audio.addEventListener('ended', () => {
            clearInterval(flashTimerIdInterval);
            timeDisplay.style.color = '';
            timerIdInterval = setInterval(updateClock, SECOND)
            img.src = 'images/64px-Traffic_lights_dark_green.svg.png';
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

    // secondsLeft = padTime(secondsLeft)
    // minutesLeft = padTime(minutesLeft)

    displayTime(minutesLeft, secondsLeft);
}

// Ensures mm:ss format
function padTime(timeUnit){
    return String(timeUnit).padStart(2, "0")
}

function displayTime(minutes, seconds){
    timeDisplay.textContent = `${padTime(minutesLeft)}:${padTime(secondsLeft)}`;
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
button.addEventListener('click', () => {
    timeStopped = !timeStopped;

    // Starts timer
    if (!timerIdInterval || !timeStopped){
        timerIdInterval = setInterval(updateClock, SECOND)
        if (currentState == STATE.STUDYING){
            italicContainer.textContent = "STUDY";
            italicContainer.style.color = 'red';
            img.src = 'images/64px-Traffic_lights_dark_green.svg.png';
        }
        else {
            italicContainer.textContent = "RELAX";
            italicContainer.style.color = 'rgb(127, 165, 255)';
            img.src = 'images/64px-Traffic_lights_dark_red.svg.png';
        }
        
    }

    // Stops timer if interruption occurs and resets it
    else {
        [minutesLeft, secondsLeft] = currentState.split(":");
        displayTime(minutesLeft, secondsLeft);
        clearInterval(timerIdInterval);
        img.src = 'images/64px-Traffic_lights_dark_red.svg.png';
    }
})

