
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
    let { thumbnails, musicButton, queue } = getCurrentPlaylistVariables();
    videoToBeRemoved = thumbnails.shift();
    videoToBeRemoved.remove();
    if (queue.length === 0){
        musicButton.classList.remove("clickable");
    }
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
            musicButton: addStudyMusicBtn,
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
            musicButton: addBreakVideoBtn,
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
            musicButton: addStudyMusicBtn,
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
            musicButton: addBreakVideoBtn,
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

function extractDomain(url){
    urlWithoutProtocol = url.replace("https://", "");
    urlWithoutProtocolAndSubDomain = urlWithoutProtocol.replace("www.", "");
    [ domainName, path ] = urlWithoutProtocolAndSubDomain.split("/");
    return {
        domainName: domainName,
        path: path
    };
}

function isValidDomain(domainName){
    validDomainNames = [
        "youtube.com",
        "archive.org"
    ];
    if (validDomainNames.includes(domainName)){
        return true;
    }
    else {
        return false;
    }
}

// function checkVideoId(videoId){
//     if (!videoId){
//         alert("The link you provided doesn't specify the video ID.");
//     }
// }

function extractVideoId(url){
    let { domainName } = extractDomain(url);
    let videoId = null;
    domainName = domainName ? domainName : null;

    supportedDomain = isValidDomain(domainName);
    if (supportedDomain){

        extractVideoIdByDomain = {
            "youtube.com": url.match(/(?<=\?v=)[^&]+/),
            "archive.org": url.match(/[^/]+$/)
        }
        videoId = extractVideoIdByDomain[domainName];
    }
    else {
        alert(`The domain "${domainName}" is not supported. Please input a valid URL by either "youtube.com" or "archive.org".`);
    }

    return videoId;
}

function generateEmbedLink(url){
    let { domainName } = extractDomain(url);
    videoId = extractVideoId(url);

    generateEmbedLinkByDomain = {
        "youtube.com": `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`,
        "archive.org": `https://archive.org/embed/${videoId}?autoplay=1`
    };
    embedLink = generateEmbedLinkByDomain[domainName];
    return embedLink;
}

function generateThumbnailLink(url){
    let { domainName } = extractDomain(url);
    videoId = extractVideoId(url);

    generateThumbnailLinkByDomain = {
        "youtube.com": `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        "archive.org": `https://archive.org/services/img/${videoId}`
    };

    thumbnailLink = generateThumbnailLinkByDomain[domainName];
    return thumbnailLink;
}

function convertVideoDurationToSeconds(videoDurationInput){
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
    return totalSeconds;
}

function addMusic(queueToAddMusicTo){
    let { playlist, durations, musicButton, placeholder, searchbar } = getPlaylistVariables(queueToAddMusicTo);

    // Updating elements on screen
    url = searchbar.value;
    searchbar.value = "";
    musicButton.style.opacity = 0.25;
    musicButton.classList.remove("clickable");

    let { path } = extractDomain(url);
    console.log("Path:", path);

    if (!path){
        alert(`The url "${url}" doesn't contain the video ID.`);
        return;
    }

    let videoId = extractVideoId(url);

    console.log(`Video Id is: ${videoId}`);

    if (videoId){
        videoDurationInput = prompt(`Optional: Input the duration of the video you want to play following the format "hh:mm:ss". Otherwise you'll have to actively click the ⏩ to move on to the next video.`);
        if (videoDurationInput){
            totalSeconds = convertVideoDurationToSeconds(videoDurationInput);
            durations.push(totalSeconds);
        }
        else if (videoDurationInput === "") {
            durations.push(null);
        }
        else {
            return;
        }

        embedLink = generateEmbedLink(url);
        thumbnailLink = generateThumbnailLink(url);

        playlist.push(embedLink);

        if (placeholder){
            placeholder.remove();
        }

        addToVideoQueue(queueToAddMusicTo, thumbnailLink);
        updateSkipButton()
    }
}

searchbarStudy.addEventListener('input', () => {
    if (searchbarStudy.value){
        addStudyMusicBtn.classList.add("clickable");
        addStudyMusicBtn.style.opacity = 1;
    }
    else {
        addStudyMusicBtn.classList.remove("clickable");
        addStudyMusicBtn.style.opacity = 0.25;
    }
});

searchbarBreak.addEventListener('input', () => {
    if (searchbarBreak.value){
        addBreakVideoBtn.classList.add("clickable");
        addBreakVideoBtn.style.opacity = 1;
    }
    else {
        addBreakVideoBtn.classList.remove("clickable");
        addBreakVideoBtn.style.opacity = 0.25;
    }
});

addStudyMusicBtn.addEventListener('click', () => {
    if (searchbarStudy.value){
        addMusic(studyQueue);
    }
    else {
        addStudyMusicBtn.style.opacity = 0.25;
    }
});

addBreakVideoBtn.addEventListener("click", () => {
    if (searchbarBreak.value){
        addMusic(breakQueue);
    }
    else {
        addBreakVideoBtn.style.opacity = 0.25;
    }
})
