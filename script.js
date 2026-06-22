let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = 0;
let autoplay = false;
let isFullscreen = false;

// Extract YouTube ID
function getYoutubeID(url) {
    let regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    let match = url.match(regExp);
    return match ? match[1] : null;
}

// SAVE ke localStorage
function savePlaylist() {
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

// ADD VIDEO
function addVideo() {
    let input = document.getElementById("youtube-link");
    let id = getYoutubeID(input.value);

    if (!id) return alert("Link tidak valid!");

    playlist.push({
        id: id,
        title: "Video " + (playlist.length + 1)
    });

    savePlaylist();
    renderPlaylist();
    input.value = "";
}

function addToPlaylist(url) {
    let id = extractYoutubeID(url);
    if (!id) return;

    let item = {
        title: "Video " + (playlist.length + 1),
        url: url,
        id: id
    };

    playlist.push(item);

    savePlaylist();
    renderPlaylist();

    playVideo(playlist.length - 1);
}

// DELETE VIDEO
function deleteVideo(index) {
    playlist.splice(index, 1);
    savePlaylist();
    renderPlaylist();
}

// EXTRACT YOUTUBE ID
function extractYoutubeID(url) {
    let reg = /(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/;
    let match = url.match(reg);
    return match ? match[1] : null;
}

// RENDER PLAYLIST
function renderPlaylist() {
    let ul = document.getElementById("playlist");
    ul.innerHTML = "";

    playlist.forEach((video, index) => {
        let li = document.createElement("li");
        li.className = "item";
        li.setAttribute("data-index", index); // 🔥 PENTING

        let span = document.createElement("span");
        span.innerText = video.title;

        let del = document.createElement("span");
        del.innerText = "❌";
        del.className = "delete-btn";

        li.appendChild(span);
        li.appendChild(del);
        ul.appendChild(li);
    });

    highlight(currentIndex);
}

// UPDATE URUTAN setelah drag
function updateOrder() {
    let items = document.querySelectorAll(".item span:first-child");
    let newList = [];

    items.forEach(item => {
        let text = item.innerText;
        let found = playlist.find(v => v.title === text);
        if (found) newList.push(found);
    });

    playlist = newList;
    savePlaylist();
}

// PLAY VIDEO
function playVideo(index) {
    currentIndex = index;

    let video = playlist[index];
    let player = document.getElementById("player");

    // FIX: tambahkan autoplay + rel
    player.src = "https://www.youtube.com/embed/" 
        + video.id 
        + "?autoplay=1&mute=1&rel=0";

    document.getElementById("video-title").innerText = video.title;

    highlight(index);
}

// HIGHLIGHT
function highlight(index) {
    let items = document.querySelectorAll(".item");
    items.forEach(i => i.classList.remove("active"));
    if (items[index]) items[index].classList.add("active");
}

// NEXT / PREV
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

// AUTOPLAY TOGGLE
function toggleAutoplay() {
    autoplay = !autoplay;
    document.getElementById("auto-status").innerText = autoplay ? "ON" : "OFF";
}

// DETEKSI VIDEO SELESAI (WORKAROUND)
setInterval(() => {
    let iframe = document.getElementById("player");
    if (!iframe.src) return;

    // trik sederhana: cek waktu (tidak 100% akurat tanpa API)
    if (autoplay) {
        // auto next tiap 5 detik cek
        // (alternatif pakai YouTube API kalau mau lebih akurat)
    }
}, 5000);

// FULLSCREEN
function goFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
}

// GET COOKIE
function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// SET COOKIE
function setCookie(name, value, days = 365) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
}

// APPLY THEME
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark");
        document.getElementById("themeToggle").innerText = "☀️";
    } else {
        document.body.classList.remove("dark");
        document.getElementById("themeToggle").innerText = "🌙";
    }
}

// TOGGLE THEME
function toggleTheme() {
    let isDark = document.body.classList.contains("dark");

    if (isDark) {
        applyTheme("light");
        setCookie("theme", "light");
    } else {
        applyTheme("dark");
        setCookie("theme", "dark");
    }
}

function toggleFullscreen() {
    let elem = document.documentElement;

    if (!document.fullscreenElement) {
        elem.requestFullscreen().then(() => {
            isFullscreen = true;

            // FORCE DARK MODE
            document.body.classList.add("dark");

            document.getElementById("fsToggle").innerText = "❐";
        });

    } else {
        document.exitFullscreen().then(() => {
            isFullscreen = false;

            // BACK TO COOKIE THEME
            let theme = getCookie("theme") || "light";
            applyTheme(theme);

            document.getElementById("fsToggle").innerText = "⛶";
        });
    }
}

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        isFullscreen = false;

        let theme = getCookie("theme") || "light";
        applyTheme(theme);

        document.getElementById("fsToggle").innerText = "⛶";
    }
});

// INIT
window.onload = () => {
    renderPlaylist();
    if (playlist.length > 0) playVideo(0);

    let theme = getCookie("theme") || "light";
    applyTheme(theme);
};

document.getElementById("playlist").addEventListener("click", function (e) {

    let li = e.target.closest(".item");
    if (!li) return;

    let index = parseInt(li.getAttribute("data-index"));

    // klik delete
    if (e.target.classList.contains("delete-btn")) {
        playlist.splice(index, 1);
        savePlaylist();
        renderPlaylist();
        return;
    }

    // klik item → play
    playVideo(index);
});


const overlay = document.getElementById("dropOverlay");
const dropBox = document.querySelector(".drop-box");

// DETEKSI DRAG MASUK HALAMAN
window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    overlay.classList.remove("hidden");
});

// SAAT DI ATAS AREA
window.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropBox.classList.add("active");
});

// KELUAR DARI HALAMAN
window.addEventListener("dragleave", (e) => {
    if (e.clientX === 0 && e.clientY === 0) {
        overlay.classList.add("hidden");
        dropBox.classList.remove("active");
    }
});

// DROP LINK
window.addEventListener("drop", (e) => {
    e.preventDefault();

    overlay.classList.add("hidden");
    dropBox.classList.remove("active");

    let data = e.dataTransfer.getData("text");

    if (!data) return;

    if (data.includes("youtube.com") || data.includes("youtu.be")) {
        addToPlaylist(data);
    } else {
        alert("Bukan link YouTube!");
    }
});