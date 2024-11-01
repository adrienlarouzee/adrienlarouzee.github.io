document.addEventListener("DOMContentLoaded", function () {
    // Initialiser la carte centrée sur l’Europe
    const map = L.map("map").setView([50.8503, 4.3517], 4);

    // Ajouter les tuiles de la carte
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
});

let player;

// Fonction appelée par l'API YouTube une fois chargée
function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: "dQw4w9WgXcQ", // Remplace cette ID par celle de n’importe quelle vidéo pour tester
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}
