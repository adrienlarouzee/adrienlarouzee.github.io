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

            // Vérification si randomSong a bien la structure attendue
            if (!randomSong.location || !randomSong.location.lat || !randomSong.location.lng) {
                console.error("randomSong n'a pas la structure attendue :", randomSong);
                return;
            }

            console.log("Morceau chargé :", randomSong.title);

            player = new YT.Player("youtube-player", {
                height: "100%",
                width: "100%",
                videoId: randomSong.videoId,
                playerVars: { 
                    'enablejsapi': 1,
                    'origin': 'https://adrienlarouzee.github.io' // Ajoute l'origine
                },
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
    if (typeof google === 'undefined' || !google.maps) {
        console.error("L'API Google Maps n'est pas chargée.");
        return;
    }

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

function validateMarker(location) {
    // Vérifie si google et google.maps sont définis
    if (typeof google === 'undefined' || !google.maps || !google.maps.geometry) {
        console.error("L'API Google Maps n'est pas chargée correctement.");
        return;
    }

    // Assure-toi que randomSong contient des valeurs valides
    if (!randomSong.location || !randomSong.location.lat || !randomSong.location.lng) {
        console.error("randomSong n'a pas de coordonnées valides.");
        return;
    }

    // Récupérer la position de la chanson
    const songLocation = new google.maps.LatLng(randomSong.location.lat, randomSong.location.lng);
    
    // Calculer la distance entre la position du marqueur et celle de la chanson
    const distance = google.maps.geometry.spherical.computeDistanceBetween(location, songLocation);
    
    // Affiche le résultat ou procède à la validation
    console.log("Distance au lieu d'origine : " + distance + " mètres");
}

// Charge la carte après le chargement de la page
window.onload = function() {
    initMap();  // Appelle la fonction pour initialiser la carte
};
