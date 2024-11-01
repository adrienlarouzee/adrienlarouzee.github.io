let player, map, markers = [], randomSong = {};

// Fonction pour charger Google Maps dynamiquement en utilisant une Promise
function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAqrx665fYTb11wQJoRx48kfUjZ5rW-GPw&libraries=geometry,marker";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(); // Résout la Promise quand le script est chargé
        script.onerror = () => reject("Erreur de chargement de Google Maps");
        document.head.appendChild(script);
    });
}

// Fonction pour initialiser la carte Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: 'MeloGuessrMap'
    });

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

// Fonction pour placer un marqueur sur la carte
function placeMarker(location) {
    const markerContent = document.createElement("div");
    markerContent.style.cssText = "padding: 10px; background-color: white; border: 1px solid black; border-radius: 5px;";
    markerContent.innerHTML = "Marqueur placé";

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });

    markers.push(marker);
    validateMarker(location);
}

// Fonction pour valider la position du marqueur et calculer la distance par rapport au lieu d'origine de la chanson
function validateMarker(location) {
    if (!google.maps || !google.maps.geometry) {
        console.error("Google Maps non chargée.");
        return;
    }
    if (!randomSong.location) {
        console.error("Coordonnées non valides.");
        return;
    }

    const songLocation = new google.maps.LatLng(randomSong.location.lat, randomSong.location.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(location, songLocation);
    console.log("Distance au lieu d'origine : " + (distance / 1000).toFixed(2) + " km");
}

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