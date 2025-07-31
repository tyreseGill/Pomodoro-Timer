
const studyTitles = [ 
    '🎧 Beats to Study To',
    '🔬 Focus Mode: ON',
    '💻 Deep Work Vibes',
    '🌌 Ambient Study Sessions',
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
    '⌛ Beat the Clock: Timed Focus Sessions',
    '💭 Get Lost in Concentration',
    '📚 Gone from here, deep in study'
 ];

const breakTitles = [
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