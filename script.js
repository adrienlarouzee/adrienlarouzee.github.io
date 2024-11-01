// Lorsque le DOM est entièrement chargé, on initialise la carte si l'API Google Maps est disponible.
document.addEventListener("DOMContentLoaded", function () {
    if (typeof google !== 'undefined') initMap();
});

let player, map, markers = [], randomSong = {}; // Variables globales pour le lecteur, la carte, les marqueurs et la chanson aléatoire

// Fonction appelée automatiquement par l'API YouTube lorsqu'elle est prête
function onYouTubeIframeAPIReady() {
    loadRandomSong(); // Charge une chanson aléatoire dès que l'API YouTube est prête
}

// Fonction pour charger un morceau aléatoire depuis le fichier JSON
function loadRandomSong() {
    fetch("data/songs.json") // Récupère les données de chansons dans le fichier JSON
        .then(response => response.json()) // Convertit la réponse en JSON
        .then(data => {
            // Sélectionne un morceau aléatoire et le stocke dans la variable globale `randomSong`
            randomSong = data[Math.floor(Math.random() * data.length)];
            
            // Vérifie si les coordonnées de la chanson sont valides
            if (!randomSong.location) {
                console.error("Coordonnées manquantes :", randomSong);
                return; // Arrête la fonction si les coordonnées sont absentes
            }
            
            // Initialise le lecteur YouTube avec le morceau sélectionné
            player = new YT.Player("youtube-player", {
                height: "100%", // Hauteur du lecteur
                width: "100%", // Largeur du lecteur
                videoId: randomSong.videoId, // ID de la vidéo à lire
                playerVars: { 'enablejsapi': 1 }, // Activer l'API pour contrôler le lecteur
                events: { 'onReady': onPlayerReady } // Définit un événement pour lancer la vidéo quand le lecteur est prêt
            });
        })
        .catch(error => console.error("Erreur de chargement:", error)); // Affiche une erreur si le fichier JSON est inaccessible
}

// Fonction appelée lorsque le lecteur YouTube est prêt
function onPlayerReady(event) {
    event.target.playVideo(); // Démarre automatiquement la lecture de la vidéo
}

// Fonction pour initialiser la carte Google Maps
function initMap() {
    // Crée une nouvelle carte centrée sur le monde entier avec un zoom faible
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 }, // Coordonnées centrales
        zoom: 2, // Niveau de zoom de départ
        mapId: 'MeloGuessrMap' // Identifiant de la carte (facultatif, à configurer dans Google Cloud Console si nécessaire)
    });
    
    // Écoute les clics sur la carte pour placer un marqueur
    map.addListener("click", function (event) { 
        placeMarker(event.latLng); // Passe les coordonnées du clic à la fonction placeMarker
    });
}

// Fonction pour placer un marqueur sur la carte
function placeMarker(location) {
    // Crée un élément HTML pour le contenu du marqueur
    const markerContent = document.createElement("div");
    markerContent.style.cssText = "padding: 10px; background-color: white; border: 1px solid black; border-radius: 5px;";
    markerContent.innerHTML = "Marqueur placé"; // Texte affiché sur le marqueur
    
    // Crée un marqueur avancé à l'endroit cliqué, en utilisant Google Maps AdvancedMarkerElement
    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location, // Position du marqueur (emplacement du clic)
        map: map, // Associe le marqueur à la carte
        content: markerContent // Contenu personnalisé du marqueur
    });
    
    markers.push(marker); // Ajoute le marqueur à la liste des marqueurs
    
    validateMarker(location); // Appelle la fonction de validation pour calculer la distance
}

// Fonction pour valider la position du marqueur et calculer la distance par rapport au lieu d'origine de la chanson
function validateMarker(location) {
    // Vérifie que Google Maps et le module geometry sont bien chargés
    if (!google.maps || !google.maps.geometry) {
        console.error("Google Maps non chargée.");
        return;
    }
    
    // Vérifie que `randomSong` contient des coordonnées valides
    if (!randomSong.location) {
        console.error("Coordonnées non valides.");
        return;
    }
    
    // Crée un objet LatLng pour la position d'origine de la chanson
    const songLocation = new google.maps.LatLng(randomSong.location.lat, randomSong.location.lng);
    
    // Calcule la distance en mètres entre le marqueur placé et la position d'origine de la chanson
    const distance = google.maps.geometry.spherical.computeDistanceBetween(location, songLocation);
    
    // Affiche la distance en kilomètres dans la console
    console.log("Distance au lieu d'origine : " + (distance / 1000).toFixed(2) + " km");
}