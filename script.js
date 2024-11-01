let player, map, userMarker = null;
let resultLine = null;
let roundCounter = 0;
let scores = [];
let currentPlaylist = []; // Liste des 5 morceaux uniques pour la partie
const maxRounds = 5;
const actionBtn = document.getElementById("actionBtn");
const playBtn = document.getElementById("playBtn");
const roundInfo = document.getElementById("round-info");
const resultDisplay = document.getElementById("result");
const totalScoreDisplay = document.getElementById("total-score");

let hasPlayedOnce = false; // Pour suivre si la lecture a déjà été initiée
let markerPlaced = false; // Pour suivre si un marqueur a été placé

// Fonction pour charger Google Maps dynamiquement
function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (typeof google !== "undefined" && google.maps) {
            resolve();
        } else {
            const script = document.createElement("script");
            script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry,marker&async=1";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject("Erreur de chargement de Google Maps");
            document.head.appendChild(script);
        }
    });
}

// Initialisation de la carte Google Maps
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

// Sélectionner 5 morceaux uniques
function generateUniquePlaylist(data) {
    const playlist = [];
    const availableSongs = [...data];

    while (playlist.length < maxRounds) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        playlist.push(availableSongs[randomIndex]);
        availableSongs.splice(randomIndex, 1);
    }

    return playlist;
}

// Chargement du lecteur YouTube caché
function loadHiddenYoutubePlayer(videoId) {
    if (player) player.destroy();
    
    player = new YT.Player("hidden-youtube-player", {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: { 
            'enablejsapi': 1,
            'modestbranding': 1,
            'controls': 0,
            'disablekb': 1,
            'rel': 0,
            'start': 60 
        },
        events: { 
            'onReady': function(event) {
                if (hasPlayedOnce) {
                    event.target.playVideo();
                    checkEnableActionBtn();
                } else {
                    playBtn.style.display = "block";
                    playBtn.onclick = function() {
                        event.target.playVideo();
                        playBtn.style.display = "none";
                        hasPlayedOnce = true;
                        checkEnableActionBtn();
                    };
                }
            },
            'onStateChange': function(event) {
                if (event.data === YT.PlayerState.PAUSED && !hasPlayedOnce) {
                    playBtn.style.display = "block";
                }
            }
        }
    });
}

// Activer le bouton "Valider" seulement si la musique a démarré et un marqueur est placé
function checkEnableActionBtn() {
    actionBtn.style.display = hasPlayedOnce && markerPlaced ? "block" : "none";
}

// Chargement de la chanson pour la manche actuelle
function loadRandomSong() {
    const song = currentPlaylist[roundCounter];
    randomSong = song;
    loadHiddenYoutubePlayer(song.videoId);
}

// Affichage du résultat de la manche et mise à jour du score total
function displayResult(distance) {
    resultDisplay.innerText = `Score de la manche : ${distance.toFixed(2)} km`;
    
    scores.push(distance);
    const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
    totalScoreDisplay.innerText = `Score total : ${totalScore.toFixed(2)} km`;

    resultLine = new google.maps.Polyline({
        path: [userMarker.position, { lat: randomSong.location.lat, lng: randomSong.location.lng }],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });

    roundCounter++;
    roundInfo.innerText = `Manche : ${roundCounter}/${maxRounds}`;

    if (roundCounter < maxRounds) {
        actionBtn.innerText = "Morceau suivant";
        actionBtn.onclick = startNewRound;
    } else {
        if (player) player.stopVideo();
        totalScoreDisplay.innerHTML = `<strong style="color: red;">Score total : ${totalScore.toFixed(2)} km</strong>`;
        actionBtn.innerText = "RESTART";
        actionBtn.onclick = resetGame;
    }
}

// Placement d'un marqueur unique sur la carte
function placeMarker(location) {
    const pinIcon = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";

    if (userMarker) userMarker.map = null;

    const markerContent = document.createElement("img");
    markerContent.src = pinIcon;
    markerContent.style.width = "24px";
    markerContent.style.height = "24px";

    userMarker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });

    markerPlaced = true;
    checkEnableActionBtn();
}

// Calcul de la distance entre le marqueur et la réponse
function validateMarker() {
    if (!google.maps || !google.maps.geometry || !userMarker) {
        console.error("Google Maps non chargée ou marqueur non placé.");
        return;
    }

    const songLocation = new google.maps.LatLng(randomSong.location.lat, randomSong.location.lng);
    const userLocation = new google.maps.LatLng(userMarker.position.lat, userMarker.position.lng);

    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, songLocation) / 1000;
    displayResult(distance);
}

// Démarrer une nouvelle manche
function startNewRound() {
    resultDisplay.innerText = "Score de la manche : ";
    if (resultLine) resultLine.setMap(null);

    if (userMarker) {
        userMarker.map = null;
        userMarker = null;
    }

    markerPlaced = false;
    loadRandomSong();
    actionBtn.style.display = "none";
}

// Réinitialiser le jeu après les 5 manches
function resetGame() {
    roundCounter = 0;
    scores = [];
    hasPlayedOnce = false;
    markerPlaced = false;
    playBtn.style.display = "none";
    actionBtn.style.display = "none";
    totalScoreDisplay.innerText = "Score total : 0 km";
    totalScoreDisplay.style.fontWeight = "normal";
    totalScoreDisplay.style.color = "black";
    roundInfo.innerText = `Manche : ${roundCounter + 1}/${maxRounds}`;

    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            currentPlaylist = generateUniquePlaylist(data);
            console.log("Playlist de la partie :", currentPlaylist);
            startNewRound();
        });
}

// Initialisation des événements et de la partie
Promise.all([
    new Promise(resolve => window.onYouTubeIframeAPIReady = resolve),
    loadGoogleMaps()
])
.then(() => {
    initMap();
    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            currentPlaylist = generateUniquePlaylist(data);
            console.log("Playlist de la partie :", currentPlaylist);
            loadRandomSong();
        });
})
.catch(error => console.error("Erreur de chargement des API :", error));