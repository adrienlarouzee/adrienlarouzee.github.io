let player, map, userMarker = null, randomSong = {};
let resultLine = null; // Variable pour stocker la ligne tracée entre les deux points

// Fonction pour charger Google Maps dynamiquement avec async et vérification pour éviter les doublons
function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (typeof google !== "undefined" && google.maps) {
            resolve(); // Si Google Maps est déjà chargé, on résout la promesse
        } else {
            const script = document.createElement("script");
            script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAqrx665fYTb11wQJoRx48kfUjZ5rW-GPw&libraries=geometry,marker&async=1";
            script.async = true;
            script.onload = () => resolve(); // Résout la Promise quand le script est chargé
            script.onerror = () => reject("Erreur de chargement de Google Maps");
            document.head.appendChild(script);
        }
    });
}

// Fonction pour initialiser la carte Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: 'MeloGuessrMap'
    });

    // Autorise le placement d'un unique marqueur lorsqu'on clique sur la carte
    map.addListener("click", function(event) { 
        placeMarker(event.latLng);
    });
}

// Fonction de chargement de chanson YouTube aléatoire
function loadRandomSong() {
    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            randomSong = data[Math.floor(Math.random() * data.length)];
            if (!randomSong.location) {
                console.error("Coordonnées manquantes :", randomSong);
                return;
            }
            player = new YT.Player("youtube-player", {
                height: "100%",
                width: "100%",
                videoId: randomSong.videoId,
                playerVars: { 'enablejsapi': 1 },
                events: { 'onReady': onPlayerReady }
            });
        })
        .catch(error => console.error("Erreur de chargement:", error));
}

// Fonction appelée lorsque le lecteur YouTube est prêt
function onPlayerReady(event) {
    event.target.playVideo();
}

// Fonction pour afficher le résultat et la ligne entre les points
function displayResult(distance) {
    // Affiche la distance en km dans l'élément HTML du résultat
    document.getElementById("result").innerText = `Score : ${distance.toFixed(2)} km`;

    // Trace une ligne entre le marqueur de l'utilisateur et la bonne réponse
    resultLine = new google.maps.Polyline({
        path: [
            userMarker.position, // Position du marqueur utilisateur
            { lat: randomSong.location.lat, lng: randomSong.location.lng } // Position de la bonne réponse
        ],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });
}

// Fonction pour placer un unique marqueur sur la carte
function placeMarker(location) {
    const pinIcon = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";

    // Si un marqueur existe déjà, on le déplace, sinon on crée un nouveau marqueur
    if (userMarker) {
        userMarker.setPosition(location);
    } else {
        const markerContent = document.createElement("img");
        markerContent.src = pinIcon;
        markerContent.style.width = "24px";
        markerContent.style.height = "24px";

        userMarker = new google.maps.marker.AdvancedMarkerElement({
            position: location,
            map: map,
            content: markerContent
        });
    }
}

// Fonction pour valider la position du marqueur et calculer la distance par rapport au lieu d'origine de la chanson
function validateMarker() {
    if (!google.maps || !google.maps.geometry || !userMarker) {
        console.error("Google Maps non chargée ou marqueur non placé.");
        return;
    }
    if (!randomSong.location) {
        console.error("Coordonnées non valides.");
        return;
    }

    const songLocation = new google.maps.LatLng(randomSong.location.lat, randomSong.location.lng);
    const userLocation = new google.maps.LatLng(userMarker.position.lat(), userMarker.position.lng());

    // Calcule la distance en km entre le marqueur et la position correcte
    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, songLocation) / 1000;

    // Affiche le résultat et trace une ligne entre les deux points
    displayResult(distance);
}

// Écouteur d'événement pour le bouton "Valider"
document.getElementById("validateBtn").addEventListener("click", function() {
    if (resultLine) {
        resultLine.setMap(null); // Supprime la ligne précédente
    }
    validateMarker(); // Valide la position du marqueur
});

// Utilisation de Promises pour charger les deux API
Promise.all([
    new Promise(resolve => window.onYouTubeIframeAPIReady = resolve), // Promise pour l'API YouTube
    loadGoogleMaps() // Promise pour Google Maps
])
.then(() => {
    initMap(); // Initialise la carte après le chargement de Google Maps
    loadRandomSong(); // Charge une chanson après le chargement de l’API YouTube
})
.catch(error => console.error("Erreur de chargement des API :", error));