const timeDisplay = document.querySelector("#display-time");

// 
let minutesLeft = 25;
let secondsLeft = 0;

function updateClock(){
    // Stops timer after 25 minutes
    if (minutesLeft == 0 && secondsLeft == 0){
        return;
    }

    --secondsLeft;

    // Prevents seconds from dipping into negatives
    if (secondsLeft < 0){
        --minutesLeft;
        secondsLeft = 59;
    }

    // Ensures 00:00 format
    secondsLeft = String(secondsLeft)
                  .padStart(2, "0");
    minutesLeft = String(minutesLeft)
                  .padStart(2, "0");

    timeDisplay.textContent = `${minutesLeft}:${secondsLeft}`;
}

// Executes function to update displayed clock every second
SECOND = 1_000;
setInterval(updateClock, SECOND)