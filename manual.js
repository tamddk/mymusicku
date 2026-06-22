
// =======================
// GLOBAL STATE
// =======================
let playlist = [];
let currentIndex = 0;
let autoplay = false;
let isFullscreen = false;

let dropZone = null;

const player = document.getElementById("player");
const welcome = document.getElementById("welcomeScreen");

if (player) player.style.display = "none";
if (welcome) welcome.classList.remove("hide");

// =======================
// INIT APP
// =======================
window.addEventListener("DOMContentLoaded", () => {
    dropZone = document.getElementById("dropZone");

    loadPlaylist();
    initDragDrop();

    let theme = getCookie("theme") || "light";
    applyTheme(theme);
});

// =======================
// EXTRACT YOUTUBE ID
// =======================
function extractYoutubeID(url) {
    let reg = /(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/;
    let match = url.match(reg);
    return match ? match[1] : null;
}

// =======================
// LOAD JSON
// =======================
function loadPlaylist() {
    fetch("materi.json")
        .then(res => res.json())
        .then(data => {
            playlist = data.map(item => ({
                title: item.title,
                url: item.url,
                id: extractYoutubeID(item.url)
            }));

            renderPlaylist();
        })
        .catch(err => console.error("Gagal load JSON:", err));
}

// =======================
// RENDER PLAYLIST
// =======================
function renderPlaylist() {
    const ul = document.getElementById("playlist");
    ul.innerHTML = "";

    playlist.forEach((video, index) => {
        const li = document.createElement("li");
        li.className = "item";
        li.dataset.index = index;
        li.draggable = true;

        li.innerHTML = `<span>${video.title}</span>`;

        ul.appendChild(li);
    });

    highlight(currentIndex);
}

// =======================
// PLAY VIDEO
// =======================
function playVideo(index) {
    currentIndex = index;

    const video = playlist[index];
    if (!video) return;

    const player = document.getElementById("player");
    const welcome = document.getElementById("welcomeScreen");

    // =======================
    // SWITCH TO PRESENTATION MODE
    // =======================
    if (welcome) welcome.classList.add("hide");

    if (player) player.style.display = "block";

    player.src =
        `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&rel=0`;

    const title = document.getElementById("video-title");
    if (title) title.innerText = video.title;

    highlight(index);
}

function resetToWelcome() {
    const player = document.getElementById("player");
    const welcome = document.getElementById("welcomeScreen");

    if (player) {
        player.src = "";
        player.style.display = "none";
    }

    if (welcome) {
        welcome.classList.remove("hide");
    }

    currentIndex = -1;
}

// =======================
// HIGHLIGHT ACTIVE
// =======================
function highlight(index) {
    document.querySelectorAll(".item")
        .forEach(el => el.classList.remove("active"));

    const active = document.querySelector(`.item[data-index="${index}"]`);
    if (active) active.classList.add("active");
}

// =======================
// NEXT / PREV
// =======================
function nextVideo() {
    if (currentIndex < playlist.length - 1) {
        playVideo(currentIndex + 1);
    }
}

function prevVideo() {
    if (currentIndex > 0) {
        playVideo(currentIndex - 1);
    }
}

// =======================
// AUTOPLAY
// =======================
function toggleAutoplay() {
    autoplay = !autoplay;

    const el = document.getElementById("auto-status");
    if (el) el.innerText = autoplay ? "ON" : "OFF";
}

// =======================
// 🎯 DRAG & DROP SYSTEM (STABLE + FLY OVERLAY)
// =======================
function initDragDrop() {
    if (!dropZone) return;

    // DRAG START (SIDEBAR ITEM)
    document.addEventListener("dragstart", (e) => {
        const item = e.target.closest(".item");
        if (!item) return;

        e.dataTransfer.setData("text/plain", item.dataset.index);
        e.dataTransfer.effectAllowed = "move";

        // SHOW DROP OVERLAY (FLY MODE)
        dropZone.classList.add("active");
    });

    // DRAG OVER DROP ZONE
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    // DROP
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();

        dropZone.classList.remove("active");

        const index = e.dataTransfer.getData("text/plain");

        if (index !== "") {
            playVideo(parseInt(index));
        }
    });

    // CANCEL DROP (EXIT AREA)
    window.addEventListener("dragleave", (e) => {
        if (e.clientX === 0 && e.clientY === 0) {
            dropZone.classList.remove("active");
        }
    });

    window.addEventListener("drop", () => {
        dropZone.classList.remove("active");
    });
}

// =======================
// 🍪 COOKIE SYSTEM
// =======================
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// =======================
// THEME
// =======================
function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");

    const btn = document.getElementById("themeToggle");
    if (btn) btn.innerText = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    applyTheme(newTheme);
    setCookie("theme", newTheme);
}

// =======================
// FULLSCREEN
// =======================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            isFullscreen = true;
            document.body.classList.add("dark");

            const btn = document.getElementById("fsToggle");
            if (btn) btn.innerText = "❐";
        });
    } else {
        document.exitFullscreen();
    }
}

// EXIT FULLSCREEN
document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        isFullscreen = false;

        const theme = getCookie("theme") || "light";
        applyTheme(theme);

        const btn = document.getElementById("fsToggle");
        if (btn) btn.innerText = "⛶";
    }
});

window.addEventListener("DOMContentLoaded", () => {
    dropZone = document.getElementById("dropZone");

    loadPlaylist();
    initDragDrop();

    // INIT WELCOME STATE (IMPORTANT FIX)
    const player = document.getElementById("player");
    const welcome = document.getElementById("welcomeScreen");

    if (player) {
        player.src = "";
        player.style.display = "none";
    }

    if (welcome) {
        welcome.classList.remove("hide");
    }

    let theme = getCookie("theme") || "light";
    applyTheme(theme);
});