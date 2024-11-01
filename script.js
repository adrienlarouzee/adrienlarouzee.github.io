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
    console.log("API YouTube chargée");
    player = new YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: "dQw4w9WgXcQ",
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log("Lecteur prêt");
    event.target.playVideo();
}
