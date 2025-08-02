
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
let openNewTabTrackerStudy = [];
let openNewTabTrackerBreak = [];

// localStorage.clear();

// NOTE: Need to keep track of which URLs in the playlist need to be opened in a new tab based on 

function saveQueueToLocalStorage() {
    const studyQueueData = {
        thumbnails: videoThumbnailsStudy.map(img => img.src),
        playlist: musicToBePlayedStudy,
        durations: videoDurationsStudy,
        openNewTabTracker: openNewTabTrackerStudy
    };

    const breakQueueData = {
        thumbnails: videoThumbnailsBreak.map(img => img.src),
        playlist: videosToBePlayedBreak,
        durations: videoDurationsBreak,
        openNewTabTracker: openNewTabTrackerBreak
    };

    localStorage.setItem("studyQueueData", JSON.stringify(studyQueueData));
    localStorage.setItem("breakQueueData", JSON.stringify(breakQueueData));
}

function loadQueuesFromLocalStorage() {
    const studyQueueData = JSON.parse(localStorage.getItem("studyQueueData"));
    const breakQueueData = JSON.parse(localStorage.getItem("breakQueueData"));

    if (studyQueueData) {
        musicToBePlayedStudy = studyQueueData.playlist || [];
        videoDurationsStudy = studyQueueData.durations || [];
        openNewTabTrackerStudy = studyQueueData.openNewTabTracker || [];
        
        updateSkipButton();

        studyQueueData.thumbnails.forEach((src) => {
            addToVideoQueue(studyQueue, src);
        });
    }

    if (breakQueueData) {
        videosToBePlayedBreak = breakQueueData.playlist || [];
        videoDurationsBreak = breakQueueData.durations || [];
        openNewTabTrackerBreak = breakQueueData.openNewTabTracker || [];

        updateSkipButton();

        breakQueueData.thumbnails.forEach((src) => {
            addToVideoQueue(breakQueue, src);
        });
    }
}

function addToVideoQueue(queueToAddMusicTo, thumbnailLink){
    let { thumbnails, queue, placeholder } = getPlaylistVariables(queueToAddMusicTo);

    let addedThumbnail = document.createElement("img");
    addedThumbnail.setAttribute('width', '300');
    addedThumbnail.setAttribute('src', thumbnailLink);

    placeholder.style.display = "none";
    
    queue.appendChild(addedThumbnail);
    thumbnails.push(addedThumbnail);

    saveQueueToLocalStorage();
}

function removeFromVideoQueue(){
    let { thumbnails, musicButton, queue, placeholder } = getCurrentPlaylistVariables();
    let videoToBeRemoved = thumbnails.shift();
    videoToBeRemoved.remove();

    if (queue.length === 0){
        musicButton.classList.remove("clickable");
        placeholder.style.display = "";
    }
    
    saveQueueToLocalStorage();
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
            openNewTabTracker: openNewTabTrackerStudy,
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
            openNewTabTracker: openNewTabTrackerBreak,
            musicButton: addBreakVideoBtn,
            placeholder: placeholderBreak,
            searchbar: searchbarStudy,
            queue: breakQueue,
            mode: "break"
        };
    }
}


function getPlaylistVariables(queueBeingEdited){
    if (queueBeingEdited === studyQueue){
        return {
            thumbnails: videoThumbnailsStudy,
            playlist: musicToBePlayedStudy,
            durations: videoDurationsStudy,
            openNewTabTracker: openNewTabTrackerStudy,
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
            openNewTabTracker: openNewTabTrackerBreak,
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
    let { playlist, openNewTabTracker } = getCurrentPlaylistVariables();
    console.log(openNewTabTracker)
    if (playlist.length > 0){
        nextVideoToPlay = playlist.shift()
        openNewTab = openNewTabTracker.shift();

        let { domainName } = extractDomain(nextVideoToPlay);

        if (openNewTab && isValidDomain(domainName)){
            console.log(domainName);
            // tvStatic.classList.
            // tvOff.classList.remove("hidden");

            window.open(nextVideoToPlay);
        }
        else {
            tvVideo.setAttribute("src", nextVideoToPlay);
        }

        removeFromVideoQueue();
        updateSkipButton();

        const tvBeep = new Audio("audio/censor-beep-1-372459.mp3");
        tvInterrupt.classList.remove("hidden");
        tvBeep.play();
        tvOff.classList.remove("hidden");
        tvStatic.classList.add("hidden");
        tvBeep.addEventListener("ended", () => {
            tvInterrupt.classList.add("hidden");
            tvOff.classList.add("hidden");
            tvVideo.classList.remove("hidden");
            currentTvState = tvVideo;

            scheduleNextVideo();
        });
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
        "archive.org",
        "tubitv.com"
    ];
    if (validDomainNames.includes(domainName)){
        return true;
    }
    else {
        return false;
    }
}

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

function isArchiveContent(url){
    let { domainName } = extractDomain(url);
    return (domainName === "archive.org") ? true : false;
}

function isTubiContent(url){
    let { domainName } = extractDomain(url);
    return (domainName === "tubitv.com") ? true : false;
}

async function getMediaType(archiveUrl){
    // Movies should play on TV, while everything else should open up a new tab
    let mediatype = null;
    const id = extractVideoId(archiveUrl);
    const response = await fetch(`https://archive.org/metadata/${id}`);

    if (!response.ok){
        throw new Error(`Could not fetch metadata from ${archiveUrl}`);
    }
    const data = await response.json();

    try {
        mediatype = data.metadata.mediatype;
    }
    catch {
        return "folder"
    }
    return mediatype;
}

function isEmbeddable(mediatype){
    return mediatype === "movies" ? true : false;
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

async function addMusic(queueToAddMusicTo){
    let { playlist, durations, musicButton, placeholder, searchbar, openNewTabTracker } = getPlaylistVariables(queueToAddMusicTo);
    let openNewTab = false;

    // Updating elements on screen
    url = searchbar.value;
    searchbar.value = "";
    musicButton.style.opacity = 0.25;
    musicButton.classList.remove("clickable");

    let { path } = extractDomain(url);

    if (!path){
        alert(`The url "${url}" doesn't contain the video ID.`);
        return;
    }

    // Opens new tab for non-embeddable content (or content that cannot fit reliablely on TV)
    if (isArchiveContent(url)){
        let mediatype = await getMediaType(url);
        if (!isEmbeddable(mediatype)){
            openNewTab = true;
        }
    }
    else if (isTubiContent(url)){
        openNewTab = true;
    }
    else {
        videoDurationInput = prompt(`Optional: Input the duration of the video you want to play following the format "hh:mm:ss". Otherwise you'll have to actively click the ⏩ to move on to the next video.`);
        if (videoDurationInput){
            totalSeconds = convertVideoDurationToSeconds(videoDurationInput);
            durations.push(totalSeconds);
        }
        else if (videoDurationInput === "") {
            durations.push(null);
        }
    }

    // embedLink = generateEmbedLink(url);
    // playlist.push(embedLink);
    
    // thumbnailLink = generateThumbnailLink(url);
    // addToVideoQueue(queueToAddMusicTo, thumbnailLink);    


    if(!isTubiContent(url)){
        embedLink = generateEmbedLink(url);
        playlist.push(embedLink);
    }
    else {
        embedLink = url;
        playlist.push(embedLink);
    }
    console.log(url);
    console.log(!isTubiContent(url))
    thumbnailLink = !isTubiContent(url) ? generateThumbnailLink(url) : "img/platform-icons/64px-Tubi_icon.png";
    
    addToVideoQueue(queueToAddMusicTo, thumbnailLink);

    if (placeholder){
        placeholder.style.display = "none";
    }

    updateSkipButton();
    openNewTabTracker.push(openNewTab);
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

document.addEventListener("DOMContentLoaded", loadQueuesFromLocalStorage);
