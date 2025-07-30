
const timeDisplay = document.querySelector("#display-time");
const italicContainer = document.querySelector("#italic-word");
const button = document.querySelector('button');
const img = document.querySelector("#todo-image");
const tvScreen = document.querySelector("#click-overlay");
const placeholder = document.querySelector("#no-video-text");
const addMusicBtn = document.querySelector("#add-music-button");
const staticTvScreen = document.querySelector("#static-tv-screen");
const colorBarsScreen = document.querySelector("#transition-screen");
const videoTvScreen = document.querySelector("#video-screen");
const searchBar = document.querySelector("input[type='search']");
const nextVidBtn = document.querySelector("#nextVidBtn");

const STATE = {
    "STUDYING": "25:00",
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
let timeStopped = true;
let currentState = STATE.STUDYING;
let [minutesLeft, secondsLeft] = currentState.split(":");
let alarmTimerIdInterval = null;
let colorToggleGrey = false;
let videoThumbnails = [];
let musicToBePlayed = [];
let videoDurations = [];
let videoPlayed = false;

(() => {
    let screen = document.querySelector("#static-tv-screen");
    screen.volume = 0.1;
})();

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

function toggleMute(){
    staticTvScreen.muted = !staticTvScreen.muted;
}

function updateVideoQueue(addedThumbnail=null){
    firstVideo = videoThumbnails[0];
    lastVideoAdded = videoThumbnails[videoThumbnails.length - 1];
    newVideoBeingAdded = addedThumbnail;
    // Adding a Thumbnail to the queue
    if (addedThumbnail){
        // First video to be added to queue
        if (videoThumbnails.length === 0){
            addedThumbnail.style.borderRadius = "10px";
        }
        else {
            firstVideo.style.borderRadius = "10px 10px 0 0";
            newVideoBeingAdded.style.borderRadius = "0 0 10px 10px";
            if (videoThumbnails.length > 1){
                lastVideoAdded.style.borderRadius = "0";
            }
        }
    }
    // Removing a Thumbnail from the queue
    else {
        colorToggleGrey = false;
        videoThumbnails.forEach((img) => {
            img.style.backgroundColor = toggleVideoBackgroundColor();
        })
        // Rounds the borders of the single video present
        if (videoThumbnails.length === 1){
            firstVideo.style.borderRadius = "10px";
        }
        // Rounds top and bottom of the borders of the first and last videos
        else if (videoThumbnails.length > 1) {
            firstVideo.style.borderRadius = "10px 10px 0 0";
            lastVideoAdded.style.borderRadius = "0 0 10px 10px";
        }

    }
}

function toggleVideoBackgroundColor(addedThumbnail=null) {
    colorToggleGrey = !colorToggleGrey;
    return colorToggleGrey ? "#e3e2de" : "#b8b6b2";
} 

function addToVideoQueue(thumbnailLink){
    let addedThumbnail = document.createElement("img");

    addedThumbnail.setAttribute('width', '300');
    addedThumbnail.setAttribute('src', thumbnailLink);

    document.querySelector("#queue").appendChild(addedThumbnail);
    addedThumbnail.textContent = embedLink;
    addedThumbnail.style.backgroundColor = toggleVideoBackgroundColor();

    updateVideoQueue(addedThumbnail);

    videoThumbnails.push(addedThumbnail);
}

function removeFromVideoQueue(){
    videoToBeRemoved = videoThumbnails.shift();
    videoToBeRemoved.remove();
    updateVideoQueue();
}



function scheduleNextVideo(){
    newVideoDurationSecs = videoDurations.shift();
    if (newVideoDurationSecs){
        timeoutId = setTimeout( () => {
            nextVideo();
        }, newVideoDurationSecs * 1_000);
    }
}

function nextVideo(){
    if (musicToBePlayed.length != 0){

        if (musicToBePlayed.length === 1){
            nextVidBtn.disabled = true;
        }

        toggleTV(tvScreen);
        videoTvScreen.setAttribute("src", musicToBePlayed.shift());
        removeFromVideoQueue();
        videoPlayed = true;
        const audio = new Audio("audio/censor-beep-1-372459.mp3");
        colorBarsScreen.classList.toggle("hidden");
        audio.play();
        audio.addEventListener("ended", () => {
            colorBarsScreen.classList.toggle("hidden");
            toggleTV(tvScreen);
        scheduleNextVideo();
        })
        
    }
    else {
        toggleTV(staticTvScreen);
    }
}

function toggleTV(tvState){
    // OFF to static
    if (tvState === tvScreen){
        tvScreen.classList.toggle("hidden");
        staticTvScreen.classList.toggle("hidden");
    }
    // Static to Video or OFF
    else if (tvState === staticTvScreen){
        if (musicToBePlayed.length != 0){
            staticTvScreen.classList.toggle("hidden");
            videoTvScreen.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
            nextVideo();
            videoTvScreen.classList.toggle("hidden");
        }
        else {
            toggleTV(tvScreen);
            
            alert("No videos to be played!");
        }
    }
    // Video to next video or OFF
    else {
        if (musicToBePlayed){
            videoTvScreen.classList.toggle("hidden");
        }
        else {
            alert("No videos to be played!");
        }
    }
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

    remoteImg.style.position = 'absolute';
    remoteImg.style.top = '10px';
    remoteImg.style.right = '10px';
    remoteImg.style.width = '40px';
    remoteImg.style.transform = 'rotateY(180deg)';
    remoteImg.src = "images/cartoon/Tv-remote_-_Delapouite_-_game-icons.svg"
    document.body.appendChild(remoteImg)
    toggleTV(tvScreen);

    setTimeout( () => {
        if (remoteImg){
            document.body.removeChild(remoteImg);
        }
    }, 500);
});

addMusicBtn.addEventListener('click', () => {
    url = searchBar.value;
    videoId = url.match(/(?<=\?v=)[^&]+/)
    isValidUrl = (url.startsWith("www.youtube.com") || url.startsWith("https://www.youtube.com")) && videoId;

    searchBar.value = "";

    if (isValidUrl){
        videoDurationInput = prompt("Optional: Input the duration of the video you want to play. Otherwise you'll have to actively click the ⏩ to move on to the next video:");
        if (videoDurationInput){
            numTimeUnits = videoDurationInput.split(":").length;
            let hours = null;
            let minutes = null;
            let seconds = null;
            if (numTimeUnits === 3){
                [hours, minutes, seconds] = videoDurationInput.split(":");
            }
            else if (numTimeUnits === 2) {
                [minutes, seconds] = videoDurationInput.split(":");
            }
            else {
                seconds = videoDurationInput;
            }
            hours = hours ? parseInt(hours, 10) : 0;
            minutes = minutes ? parseInt(minutes, 10) : 0;
            seconds = seconds ? parseInt(seconds, 10) : 0;
            // Extra 30 seconds act as grace to play/stop video
            totalSeconds = (hours * 3600) + (minutes * 60) + seconds + 0;
            videoDurations.push(totalSeconds);
        }
        else {
            videoDurations.push(null);
        }

        embedLink = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`;
        thumbnailLink = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

        musicToBePlayed.push(embedLink);

        if (document.querySelector("#no-video-text")){
            placeholder.remove();
        }

        addToVideoQueue(thumbnailLink);

        // Makes nextVidBtn clickable
        if (videoPlayed){
            nextVidBtn.disabled = false;
        }
    }
    else{
        alert("You input an invalid URL. Please copy/paste a valid URL to a YouTube video.");
    }
});


staticTvScreen.addEventListener("click", () => {
    toggleTV(staticTvScreen);
    toggleMute();
});

tvScreen.addEventListener("click", () => {
    toggleMute();
})