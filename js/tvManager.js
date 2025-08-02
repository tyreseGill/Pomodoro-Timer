
const tvOff = document.querySelector("#tv-off-screen");
const tvStatic = document.querySelector("#static-tv-screen");
const tvInterrupt = document.querySelector("#transition-screen");
const tvVideo = document.querySelector("#video-screen");
const timerSoundingOff = new Audio('audio/Beep_alarm_clock.ogg');

let currentTvState = tvOff;

// Lowers volume of static video
(() => {
    let screen = document.querySelector("#static-tv-screen");
    screen.volume = 0.1;
})();


function toggleMute(){
    tvStatic.muted = !tvStatic.muted;
}

function toggleTv(tvState){
    let { mode, playlist } = getCurrentPlaylistVariables();
    // OFF to static
    if (tvState === tvOff){
        tvOff.classList.add("hidden");
        tvStatic.classList.remove("hidden");
        currentTvState = tvStatic;
    }
    // Static to Video or OFF
    else if (tvState === tvStatic){
        if (playlist.length > 0){
            tvVideo.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
            nextVideo();

            currentTvState = tvVideo;
        }
        else {
            tvStatic.classList.add("hidden");
            tvOff.classList.remove("hidden");
            currentTvState = tvOff;
            alert(`No videos to be played! Add some to the ${mode} playlist!`);
        }
    }
    // Video to next video or OFF
    else {
        if (playlist){
            tvVideo.classList.remove("hidden");
            currentTvState = tvVideo;
        }
        else {
            tvOff.classList.remove("hidden");
            tvVideo.classList.add("hidden");
            currentTvState = tvOff;
            alert(`No videos to be played! Add some to your ${mode} playlist!`);
        }
    }
}

tvStatic.addEventListener("click", () => {
    toggleTv(tvStatic);
    toggleMute();
});

tvOff.addEventListener('click', () => {
    let remoteImg = document.createElement("img")

    remoteImg.style.position = 'absolute';
    remoteImg.style.top = '10px';
    remoteImg.style.right = '10px';
    remoteImg.style.width = '40px';
    remoteImg.style.transform = 'rotateY(180deg)';
    remoteImg.src = "img/cartoon/Tv-remote_-_Delapouite_-_game-icons.svg"
    document.body.appendChild(remoteImg)
    toggleTv(tvOff);
    toggleMute();

    setTimeout( () => {
        if (remoteImg){
            document.body.removeChild(remoteImg);
        }
    }, 500);
});

window.timerSoundingOff.addEventListener("playing", () => {
    console.log("Timer going off!")
    tvInterrupt.classList.remove("hidden");
    nextVideo();
});

window.timerSoundingOff.addEventListener("ended", () => {
    tvInterrupt.classList.add("hidden");
});
