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
    markerContent.innerHTML = "Marqueur";  // Peut être vide ou un texte par défaut

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent,  // Utiliser l'élément créé
    });

    // Assurer que randomSong est défini ici
    if (!randomSong || !randomSong.title) {
        console.error("randomSong n'est pas défini ou n'a pas de titre !");
        return;
    }

    // Créer un contenu pour l'infobulle
    const infoContent = document.createElement("div");
    infoContent.innerHTML = "Titre de la chanson: " + randomSong.title + "<br>Artiste: " + randomSong.artist;

    // Écouter le clic sur le marqueur pour ouvrir l'infobulle
    marker.addListener("click", function() {
        const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
        });
        infoWindow.open(map, marker);  // Afficher l'infobulle
    });

    markers.push(marker);  // Ajouter le marqueur à la liste
}

// Charge la carte après le chargement de la page
window.onload = function() {
    initMap();  // Appelle la fonction pour initialiser la carte
};