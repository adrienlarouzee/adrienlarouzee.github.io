let player, map, userMarker = null;
let resultLine = null;
let roundCounter = 0;
let scores = [];
let currentPlaylist = [];
const maxRounds = 5;
const actionBtn = document.getElementById("actionBtn");
const playBtn = document.getElementById("playBtn");
const roundInfo = document.getElementById("round-info");
const resultDisplay = document.getElementById("result");
const totalScoreDisplay = document.getElementById("total-score");

let hasPlayedOnce = false;

// Charger Google Maps
function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (typeof google !== "undefined" && google.maps) {
            resolve();
        } else {
            const script = document.createElement("script");
            script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAqrx665fYTb11wQJoRx48kfUjZ5rW-GPw&libraries=geometry,marker&async=1";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject("Erreur de chargement de Google Maps");
            document.head.appendChild(script);
        }
    });
}

// Initialiser la carte Google Maps
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: 'MeloGuessrMap'
    });

    map.addListener("click", (event) => placeMarker(event.latLng));
}

// Générer une playlist unique de morceaux
function generateUniquePlaylist(data) {
    const playlist = [];
    const availableSongs = [...data];
    while (playlist.length < maxRounds) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        playlist.push(availableSongs.splice(randomIndex, 1)[0]);
    }
    return playlist;
}

// Charger le lecteur YouTube pour le morceau actuel
function loadHiddenYoutubePlayer(videoId) {
    if (player) player.destroy();  // Supprime le lecteur précédent
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
            'onReady': (event) => {
                if (hasPlayedOnce) {
                    event.target.playVideo();
                } else {
                    playBtn.style.display = "block";
                    playBtn.onclick = () => {
                        event.target.playVideo();
                        playBtn.style.display = "none";
                        hasPlayedOnce = true;
                    };
                }
            }
        }
    });
}

// Charger un morceau pour la manche actuelle
function loadRandomSong() {
    const song = currentPlaylist[roundCounter];
    loadHiddenYoutubePlayer(song.videoId);
}

// Afficher le résultat de la manche et le score total
function displayResult(distance) {
    resultDisplay.innerText = `Score de la manche : ${distance.toFixed(2)} km`;
    scores.push(distance);

    const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
    totalScoreDisplay.innerText = `Score total : ${totalScore.toFixed(2)} km`;

    // Tracer une ligne entre le marqueur et le lieu d'origine du morceau
    resultLine = new google.maps.Polyline({
        path: [
            userMarker.position,
            { lat: currentPlaylist[roundCounter].location.lat, lng: currentPlaylist[roundCounter].location.lng }
        ],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });

    roundCounter++;
    if (roundCounter < maxRounds) {
        actionBtn.innerText = "Morceau suivant";
        actionBtn.onclick = startNewRound;
    } else {
        if (player) player.stopVideo();
        totalScoreDisplay.innerHTML = `<strong style="color: red;">Score total : ${totalScore.toFixed(2)} km</strong>`;
        actionBtn.innerText = "Recommencer";
        actionBtn.onclick = resetGame;
    }
}

// Placer un marqueur sur la carte
function placeMarker(location) {
    if (userMarker) userMarker.setMap(null);

    userMarker = new google.maps.Marker({
        position: location,
        map: map
    });
}

// Valider la position du marqueur et calculer la distance
function validateMarker() {
    if (!google.maps || !google.maps.geometry || !userMarker) {
        console.error("Google Maps non chargée ou marqueur non placé.");
        return;
    }

    const songLocation = new google.maps.LatLng(currentPlaylist[roundCounter].location.lat, currentPlaylist[roundCounter].location.lng);
    const userLocation = new google.maps.LatLng(userMarker.position.lat(), userMarker.position.lng());

    const distance = google.maps.geometry.spherical.computeDistanceBetween(userLocation, songLocation) / 1000;
    displayResult(distance);
}

// Démarrer une nouvelle manche
function startNewRound() {
    resultDisplay.innerText = "Score de la manche : ";
    if (resultLine) resultLine.setMap(null);
    if (userMarker) userMarker.setMap(null);

    loadRandomSong();
    actionBtn.innerText = "Valider";
    actionBtn.onclick = validateMarker;
}

// Réinitialiser le jeu après les 5 manches
function resetGame() {
    roundCounter = 0;
    scores = [];
    hasPlayedOnce = false;
    playBtn.style.display = "none";
    totalScoreDisplay.innerText = "Score total : 0 km";
    totalScoreDisplay.style.fontWeight = "normal";
    totalScoreDisplay.style.color = "black";
    roundInfo.innerText = `Manche : ${roundCounter + 1}/${maxRounds}`;

    fetch("data/songs.json")
        .then((response) => response.json())
        .then((data) => {
            currentPlaylist = generateUniquePlaylist(data);
            console.log("Nouvelle playlist :", currentPlaylist);  // Debug
            startNewRound();
        });
}

// Initialisation de la partie et génération de la playlist
Promise.all([
    new Promise(resolve => window.onYouTubeIframeAPIReady = resolve),
    loadGoogleMaps()
])
.then(() => {
    initMap();
    fetch("data/songs.json")
        .then((response) => response.json())
        .then((data) => {
            currentPlaylist = generateUniquePlaylist(data);
            console.log("Playlist initiale :", currentPlaylist);  // Debug
            loadRandomSong();
        });
})
.catch((error) => console.error("Erreur de chargement des API :", error));

// Lien du bouton d'action à la fonction de validation
actionBtn.onclick = validateMarker;