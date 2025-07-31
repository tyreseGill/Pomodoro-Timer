
const timeDisplay = document.querySelector("#display-time");
const italicContainer = document.querySelector("#italic-word");
const startPauseTimerBtn = document.querySelector('#timer-button');
const img = document.querySelector("#todo-image");
const nextVidBtn = document.querySelector("#nextVidBtn");

const tvOff = document.querySelector("#tv-off-screen");
const tvStatic = document.querySelector("#static-tv-screen");
const tvInterrupt = document.querySelector("#transition-screen");
const tvVideo = document.querySelector("#video-screen");

const placeholderStudy = document.querySelector("#no-video-text-1");
const placeholderBreak = document.querySelector("#no-video-text-2");

const addStudyMusicBtn = document.querySelector("#add-music-button-1");
const addBreakVideoBtn = document.querySelector("#add-music-button-2");

const searchbarStudy = document.querySelector("#url-container-1");
const searchbarBreak = document.querySelector("#url-container-2");

const studyQueue = document.querySelector("#study-queue");
const breakQueue = document.querySelector("#break-queue");

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
let colorToggleGrey = false;
let videoPlayed = false;
let timeStopped = true;
let currentTimerState = STATE.STUDYING;
let currentTvState = tvOff;
let [minutesLeft, secondsLeft] = currentTimerState.split(":");

let videoThumbnailsStudy = [];
let videoThumbnailsBreak = [];

let musicToBePlayedStudy = [];
let videosToBePlayedBreak = [];

let videoDurationsStudy = [];
let videoDurationsBreak = [];

studyTitles = [ 
    '🎧 Beats to Study To',
    '🔬 Focus Mode: ON',
    '💻 Deep Work Vibes',
    'Ambient Study Sessions',
    'Lo-fi for the Laser-Focused',
    '⛽ Fuel for the Flow State',
    '🧩 Concentration Companion',
    '🕵️ Stay Sharp, Study Smart',
    '🔒 Locked In and Learning',
    '🎼 Background Beats for Brilliance',
    '📚 Study With Me',
    '🛤️ Tunnel Vision Tracks',
    '🪐 Productivity Orbit',
    '🚀 Brain Boost Audio',
    '📖 Read, Write, Repeat',
    '💪 Quietly Crushing It',
    '✨ Mental Clarity Mode',
    '🏃‍➡️ Chase the Goal',
    '🧗 Climb Your Way to Focus',
    '⛹️ Bounce Back Break Beats',
    '🏋️ Heavy Focus, Light Distractions',
    '🪡 Thread the Needle: Precision Work Mode',
    '🥇 Gold Medal Grind',
    '🎯 Locked on the Target',
    '📈 Level Up Your Study Game',
    '⌛ Beat the Clock: Timed Focus Sessions'
 ];
breakTitles = [
    '☺️ Videos to Relax To',
    '⏸️ Pause & Unwind',
    '✋ Take Five',
    '🧘 Mindful Moments',
    '☕ Time to Breathe',
    "🌿 Nature's Intermission",
    '🌅 Soothing Escapes',
    '🧠 Reset Your Mind',
    '🪷 Calm Between the Chaos',
    '🎨 The Art of Doing Nothing',
    '🌴 Peaceful Interludes',
    '💤 Time for a Mental Reset',
    '🧘 Your Daily Zen',
    '🫖 Break-Time Bliss',
    '🕯️ Relax Mode Activated',
    '🧊 Cool Down Time',
    '😴 Nap-Worthy Vibes',
    '🛌 Lo-fi for Lying Low',
    '⏸️ Pause. Breathe. Reset.',
    '🏖️ Sonic Getaway: Beachside Breaks',
    '🌙 Moonlight Melodies',
    '🌸 Petal-Soft Study Breaks',
    '🌊 TideTunes: Flow & Focus',
    '🌤️ Clear Skies, Clear Mind',
    '🍵 Steeped in Stillness',
    '🔮 Chill Visions: Relax and Drift',
    '🍿 Popcorn Pause: Quick Flicks for Breaks',
    '🎬 Mini Movie Moments',
    '📺 TV Timeout: Chill & Watch',
    '🎮 Game Break: Button Mashing & Brain Rest',
    '🕹️ Pixel Pause: Retro Vibes & Relaxation'
];

randomNumber = Math.random();
let randomBreakPlaylistTitle = breakTitles[Math.floor(randomNumber * (breakTitles.length + 1))];
randomNumber = Math.random();
let randomStudyPlaylistTitle = studyTitles[Math.floor(randomNumber * (studyTitles.length + 1))];

document.querySelector("#break-playlist-title").textContent = randomBreakPlaylistTitle;
document.querySelector("#study-playlist-title").textContent = randomStudyPlaylistTitle;


// Lowers volume of static video
(() => {
    let screen = document.querySelector("#static-tv-screen");
    screen.volume = 0.1;
})();

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

function toggleMute(){
    tvStatic.muted = !tvStatic.muted;
}

function updateVideoQueue(addedThumbnail=null){
    let { thumbnails } = getCurrentPlaylistVariables();
    firstVideo = thumbnails[0];
    lastVideoAdded = thumbnails[thumbnails.length - 1];
    newVideoBeingAdded = addedThumbnail;
    // Adding a Thumbnail to the queue
    if (addedThumbnail){
        // First video to be added to queue
        if (thumbnails.length === 0){
            addedThumbnail.style.borderRadius = "10px";
        }
        else {
            firstVideo.style.borderRadius = "10px 10px 0 0";
            newVideoBeingAdded.style.borderRadius = "0 0 10px 10px";
            if (thumbnails.length > 1){
                lastVideoAdded.style.borderRadius = "0";
            }
        }
    }
    // Removing a Thumbnail from the queue
    else {
        colorToggleGrey = false;
        thumbnails.forEach((img) => {
            img.style.backgroundColor = toggleVideoBackgroundColor();
        })
        // Rounds the borders of the single video present
        if (thumbnails.length === 1){
            firstVideo.style.borderRadius = "10px";
        }
        // Rounds top and bottom of the borders of the first and last videos
        else if (thumbnails.length > 1) {
            firstVideo.style.borderRadius = "10px 10px 0 0";
            lastVideoAdded.style.borderRadius = "0 0 10px 10px";
        }
    }
}

function toggleVideoBackgroundColor(addedThumbnail=null) {
    colorToggleGrey = !colorToggleGrey;
    return colorToggleGrey ? "#e3e2de" : "#b8b6b2";
} 

function addToVideoQueue(queueToAddMusicTo, thumbnailLink){
    let {thumbnails, queue} = getPlaylistVariables(queueToAddMusicTo);

    let addedThumbnail = document.createElement("img");

    addedThumbnail.setAttribute('width', '300');
    addedThumbnail.setAttribute('src', thumbnailLink);

    queue.appendChild(addedThumbnail);
    addedThumbnail.textContent = embedLink;
    addedThumbnail.style.backgroundColor = toggleVideoBackgroundColor();

    updateVideoQueue(addedThumbnail);
    thumbnails.push(addedThumbnail);
}

function removeFromVideoQueue(){
    let { thumbnails } = getCurrentPlaylistVariables();
    videoToBeRemoved = thumbnails.shift();
    videoToBeRemoved.remove();
    updateVideoQueue();
}



function scheduleNextVideo(){
    let { durations } = getCurrentPlaylistVariables();
    newVideoDurationSecs = durations.shift();
    if (newVideoDurationSecs){
        timeoutId = setTimeout( () => {
            nextVideo();
        }, newVideoDurationSecs * 1_000);
    }
}

function getCurrentPlaylistVariables(){
    if (currentTimerState === STATE.STUDYING){
        return {
            thumbnails: videoThumbnailsStudy,
            playlist: musicToBePlayedStudy,
            durations: videoDurationsStudy,
            placeholder: placeholderStudy,
            searchbar: searchbarStudy,
            queue: studyQueue,
            mode: "study"  // To be used
        };
    }
    else {
        return {
            thumbnails: videoThumbnailsBreak,
            playlist: videosToBePlayedBreak,
            durations: videoDurationsBreak,
            placeholder: placeholderBreak,
            searchbar: searchbarStudy,
            queue: breakQueue,
            mode: "break"  // To be used
        };
    }
}


function getPlaylistVariables(queueBeingEdited){
    if (queueBeingEdited === studyQueue){
        return {
            thumbnails: videoThumbnailsStudy,
            playlist: musicToBePlayedStudy,
            durations: videoDurationsStudy,
            placeholder: placeholderStudy,
            searchbar: searchbarStudy,
            queue: studyQueue,
            mode: "study"  // To be used
        };
    }
    else {
        return {
            thumbnails: videoThumbnailsBreak,
            playlist: videosToBePlayedBreak,
            durations: videoDurationsBreak,
            placeholder: placeholderBreak,
            searchbar: searchbarBreak,
            queue: breakQueue,
            mode: "break"  // To be used
        };
    }
}

function updateSkipButton(){
    let { playlist } = getCurrentPlaylistVariables();
    if (playlist.length >= 1 && currentTvState != tvOff){
        nextVidBtn.disabled = false;
    }
    else{
        nextVidBtn.disabled = true;
    }
}

function nextVideo(){
    let { playlist } = getCurrentPlaylistVariables();

    if (playlist.length != 0){
        toggleTv(tvOff);
        tvVideo.setAttribute("src", playlist.shift());
        removeFromVideoQueue();
        updateSkipButton();
        videoPlayed = true;
        const audio = new Audio("audio/censor-beep-1-372459.mp3");
        tvInterrupt.classList.toggle("hidden");
        audio.play();
        audio.addEventListener("ended", () => {
            tvInterrupt.classList.toggle("hidden");
            toggleTv(tvOff);
            currentTvState = tvVideo;
        scheduleNextVideo();
        })
    }
    else {
        toggleTv(tvStatic);
    }
}

function toggleTv(tvState){
    let { mode, playlist } = getCurrentPlaylistVariables();
    // OFF to static
    if (tvState === tvOff){
        tvOff.classList.toggle("hidden");
        tvStatic.classList.toggle("hidden");
        currentTvState = tvStatic;
    }
    // Static to Video or OFF
    else if (tvState === tvStatic){
        if (playlist.length != 0){
            // nextVidBtn.disabled = false;
            // updateSkipButton()
            tvStatic.classList.toggle("hidden");
            tvVideo.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
            nextVideo();
            tvVideo.classList.toggle("hidden");
            currentTvState = tvVideo;
        }
        else {
            toggleTv(tvOff);
            currentTvState = tvOff;
            alert(`No videos to be played! Add some to the ${mode} playlist!`);
        }
    }
    // Video to next video or OFF
    else {
        if (playlist){
            tvVideo.classList.toggle("hidden");
            currentTvState = tvVideo;
        }
        else {
            alert(`No videos to be played! Add some to your ${mode} playlist!`);
        }
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

tvOff.addEventListener('click', () => {
    let remoteImg = document.createElement("img")

    remoteImg.style.position = 'absolute';
    remoteImg.style.top = '10px';
    remoteImg.style.right = '10px';
    remoteImg.style.width = '40px';
    remoteImg.style.transform = 'rotateY(180deg)';
    remoteImg.src = "images/cartoon/Tv-remote_-_Delapouite_-_game-icons.svg"
    document.body.appendChild(remoteImg)
    toggleTv(tvOff);

    setTimeout( () => {
        if (remoteImg){
            document.body.removeChild(remoteImg);
        }
    }, 500);
});



function addMusic(queueToAddMusicTo){
    let { playlist, durations, placeholder, searchbar } = getPlaylistVariables(queueToAddMusicTo);
    url = searchbar.value;
    videoId = url.match(/(?<=\?v=)[^&]+/)
    isValidUrl = (url.startsWith("www.youtube.com") || url.startsWith("https://www.youtube.com")) && videoId;

    searchbar.value = "";

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
            durations.push(totalSeconds);
        }
        else {
            durations.push(null);
        }

        embedLink = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`;
        thumbnailLink = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

        playlist.push(embedLink);

        if (placeholder){
            placeholder.remove();
        }

        addToVideoQueue(queueToAddMusicTo, thumbnailLink);
        updateSkipButton()

        // Makes nextVidBtn clickable
        // let { mode } = getCurrentPlaylistVariables();
        // if (mode === queueToAddMusicTo){
        //     nextVidBtn.disabled = false;
        // }
    }
    else{
        alert("You input an invalid URL. Please copy/paste a valid URL to a YouTube video.");
    }
}


// addMusicBtns.forEach( addMusicBtn => {
//     addMusicBtn.addEventListener('click', () => {
//         let { playlist, mode } = getCurrentPlaylistVariables();
//         if(playlist.length > 1 && mode === "study"){
//             nextVidBtn.disabled = true;
//         }
//         addMusic(studyQueue);
//     });
// });
addStudyMusicBtn.addEventListener('click', () => {
    console.log("STUDY BUTTON CLICKED");
    let { playlist, mode } = getPlaylistVariables(studyQueue);
    // if(playlist.length > 1 && mode === "study"){
    //     nextVidBtn.disabled = false;
    // }
    // else{
    //     nextVidBtn.disabled = true;
    // }
    addMusic(studyQueue);
});

addBreakVideoBtn.addEventListener("click", () => {
    console.log("BREAK BUTTON CLICKED");
    let { playlist, mode } = getPlaylistVariables(breakQueue);
    
    // if(playlist.length > 1 && mode === "break"){
    //     nextVidBtn.disabled = false;
    // }
    // else{
    //     nextVidBtn.disabled = true;
    // }
    addMusic(breakQueue);
})


tvStatic.addEventListener("click", () => {
    toggleTv(tvStatic);
    toggleMute();
});

tvOff.addEventListener("click", () => {
    toggleMute();
})