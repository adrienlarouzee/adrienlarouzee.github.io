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
    event.target.playVideo();  // Lecture automatique activée
}

let map;
let markers = [];  // Pour stocker les marqueurs

function initMap() {
    // Initialise la carte
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },  // Position initiale
        zoom: 2,
    });

    // Événement de clic sur la carte
    map.addListener("click", function(event) {
        placeMarker(event.latLng);
    });
}

function placeMarker(location) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
    });
    markers.push(marker);  // Ajouter le marqueur à la liste
}

// Charge la carte après le chargement de la page
window.onload = function() {
    initMap();  // Appelle la fonction pour initialiser la carte
};