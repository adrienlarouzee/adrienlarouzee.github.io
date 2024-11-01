let player;
let map;
let markers = [];  // Pour stocker les marqueurs
let randomSong = {}; // Définir comme objet vide au départ

// Fonction appelée par l'API YouTube une fois chargée
function onYouTubeIframeAPIReady() {
    loadRandomSong();
}

// Fonction pour charger un morceau aléatoire
function loadRandomSong() {
    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            randomSong = data[Math.floor(Math.random() * data.length)]; // Mettre à jour la variable globale
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


function initMap() {
    // Initialise la carte Google Maps avec un ID de carte
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },  // Position initiale
        zoom: 2,
        mapId: 'MeloGuessrMap',  // Remplace par l'ID de ta carte
    });

    // Événement de clic sur la carte
    map.addListener("click", function(event) {
        placeMarker(event.latLng);
    });
}

function placeMarker(location) {
    // Créer un élément pour le marqueur
    const markerContent = document.createElement("div");
    markerContent.style.padding = "10px";  // Ajoute un peu de padding
    markerContent.style.backgroundColor = "white";  // Fond blanc pour le marqueur
    markerContent.style.border = "1px solid black";  // Bordure pour mieux visualiser
    markerContent.style.borderRadius = "5px";  // Coins arrondis
    markerContent.innerHTML = "Marqueur placé";  // Simple indication

    // Créer le marqueur avec AdvancedMarkerElement
    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent,  // Utiliser l'élément créé
    });

    markers.push(marker);  // Ajouter le marqueur à la liste

    // Ajouter la logique de validation ici
    validateMarker(location);
}

// Fonction pour valider le placement du marqueur
function validateMarker(location) {
    // Récupérer la vraie position de la chanson depuis le JSON (ajouter cette info à tes données JSON)
    const trueLocation = randomSong.location; // Assurez-vous que votre JSON a une propriété 'location' avec lat et lng

    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(location.lat(), location.lng()),
        new google.maps.LatLng(trueLocation.lat, trueLocation.lng)
    );

    alert("Distance entre votre marqueur et la vraie position : " + (distance / 1000).toFixed(2) + " km");
}

// Charge la carte après le chargement de la page
window.onload = function() {
    initMap();  // Appelle la fonction pour initialiser la carte
};