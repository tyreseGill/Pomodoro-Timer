
const addStudyMusicBtn = document.querySelector("#add-music-button-1");
const addBreakVideoBtn = document.querySelector("#add-music-button-2");
const nextVidBtn = document.querySelector("#nextVidBtn");
const placeholderStudy = document.querySelector("#no-video-text-1");
const placeholderBreak = document.querySelector("#no-video-text-2");
const searchbarStudy = document.querySelector("#url-container-1");
const searchbarBreak = document.querySelector("#url-container-2");
const studyQueue = document.querySelector("#study-queue");
const breakQueue = document.querySelector("#break-queue");

let videoThumbnailsStudy = [];
let videoThumbnailsBreak = [];
let musicToBePlayedStudy = [];
let videosToBePlayedBreak = [];
let videoDurationsStudy = [];
let videoDurationsBreak = [];
let colorToggleGrey = false;

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
            mode: "study"
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
            mode: "break"
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

function addMusic(queueToAddMusicTo){
    let { playlist, durations, placeholder, searchbar } = getPlaylistVariables(queueToAddMusicTo);
    url = searchbar.value;
    videoId = url.match(/(?<=\?v=)[^&]+/)
    isValidUrl = (url.startsWith("www.youtube.com") || url.startsWith("https://www.youtube.com")) && videoId;

    searchbar.value = "";

    if (isValidUrl){
        videoDurationInput = prompt("Optional: Input the duration of the video you want to play. Otherwise you'll have to actively click the ⏩ to move on to the next video:");
        if (videoDurationInput){
            parts = videoDurationInput.split(":");
            let [hours, minutes, seconds] = [0, 0, 0];

            parts = parts.map(p => p ? parseInt(p, 10) : 0);

            if (parts.length === 3) {
                [hours, minutes, seconds] = parts;
            } else if (parts.length === 2) {
                [minutes, seconds] = parts;
            } else {
                [seconds] = parts;
            }

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
    }
    else{
        alert("You input an invalid URL. Please copy/paste a valid URL to a YouTube video.");
    }
}

addStudyMusicBtn.addEventListener('click', () => {
    addMusic(studyQueue);
});

addBreakVideoBtn.addEventListener("click", () => {
    addMusic(breakQueue);
})
