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
    loadRandomSong();
}

// Fonction pour charger un morceau aléatoire
function loadRandomSong() {
    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            const randomSong = data[Math.floor(Math.random() * data.length)];
            console.log("Morceau chargé :", randomSong.title);

            player = new YT.Player("youtube-player", {
                height: "100%",
                width: "100%",
                videoId: randomSong.videoId,
                events: {
                    'onReady': onPlayerReady
                }
            });
        })
        .catch(error => console.error("Erreur lors du chargement des morceaux :", error));
}

function onPlayerReady(event) {
    console.log("Lecteur prêt");
    event.target.playVideo();
}

/*function playVideo() {
    if (player && player.playVideo) {
        player.playVideo();
    }
}*/