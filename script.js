let player, map, userMarker = null;
let resultLine = null;
let roundCounter = 0;
let scores = [];
let currentPlaylist = []; // Liste des 5 morceaux uniques pour la partie
const maxRounds = 5;
const actionBtn = document.getElementById("actionBtn");
const roundInfo = document.getElementById("round-info");
const resultDisplay = document.getElementById("result");
const totalScoreDisplay = document.getElementById("total-score");

// Fonction pour charger Google Maps dynamiquement avec async et vérification pour éviter les doublons
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

// Fonction pour sélectionner 5 morceaux uniques
function generateUniquePlaylist(data) {
    const playlist = [];
    const availableSongs = [...data];

    while (playlist.length < maxRounds) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        playlist.push(availableSongs[randomIndex]);
        availableSongs.splice(randomIndex, 1); // Supprime l'élément sélectionné pour éviter les doublons
    }

    return playlist;
}

const playBtn = document.getElementById("playBtn"); // Bouton de lecture
let hasPlayedOnce = false; // Variable pour savoir si la lecture a déjà été initiée une fois

// Fonction de chargement du lecteur YouTube en mode caché pour la manche actuelle
function loadHiddenYoutubePlayer(videoId) {
    if (player) {
        player.destroy(); // Supprime le lecteur précédent pour éviter les conflits
    }
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
            'start': 60 // Démarre la vidéo à 60 secondes
        },
        events: { 
            'onReady': function(event) {
                // Si la lecture a déjà été lancée une fois, démarre automatiquement sans bouton
                if (hasPlayedOnce) {
                    event.target.playVideo();
                } else {
                    // Affiche le bouton pour la première fois seulement si la lecture automatique est bloquée
                    playBtn.style.display = "block";
                    playBtn.onclick = function() {
                        event.target.playVideo();
                        playBtn.style.display = "none"; // Masque le bouton après le démarrage
                        hasPlayedOnce = true; // Marque que la lecture a été initiée une fois
                    };
                }
            },
            'onStateChange': function(event) {
                // Affiche le bouton uniquement si la vidéo est en pause au début et que c'est le premier morceau
                if (event.data === YT.PlayerState.PAUSED && !hasPlayedOnce) {
                    playBtn.style.display = "block";
                }
            }
        }
    });
}

// Fonction de chargement de chanson pour la manche actuelle
function loadRandomSong() {
    const song = currentPlaylist[roundCounter];
    randomSong = song;
    loadHiddenYoutubePlayer(song.videoId);
}

// Fonction pour afficher le résultat de la manche et mettre à jour le score total
function displayResult(distance) {
    resultDisplay.innerText = `Score de la manche : ${distance.toFixed(2)} km`;
    
    scores.push(distance);

    const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
    totalScoreDisplay.innerText = `Score total : ${totalScore.toFixed(2)} km`;

    resultLine = new google.maps.Polyline({
        path: [
            userMarker.position,
            { lat: randomSong.location.lat, lng: randomSong.location.lng }
        ],
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
        // Arrête la lecture à la fin de la 5e manche
        if (player) {
            player.stopVideo();
        }
        totalScoreDisplay.innerHTML = `<strong style="color: red;">Score total : ${totalScore.toFixed(2)} km</strong>`;
        actionBtn.innerText = "Recommencer";
        actionBtn.onclick = resetGame;
    }
}

// Fonction pour réinitialiser le jeu après les 5 manches
function resetGame() {
    roundCounter = 0;
    scores = [];
    hasPlayedOnce = false; // Réinitialiser hasPlayedOnce pour la nouvelle partie
    playBtn.style.display = "none"; // Masquer le bouton au début du reset
    totalScoreDisplay.innerText = "Score total : 0 km";
    totalScoreDisplay.style.fontWeight = "normal";
    totalScoreDisplay.style.color = "black";
    roundInfo.innerText = `Manche : ${roundCounter + 1}/${maxRounds}`;

    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            currentPlaylist = generateUniquePlaylist(data); // Crée une nouvelle playlist pour la partie

            // Affiche la playlist dans la console pour le debug
            console.log("Playlist de la partie :", currentPlaylist);

            startNewRound();
        });
}

// Fonction pour valider la position du marqueur et calculer la distance
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

// Fonction pour démarrer une nouvelle manche
function startNewRound() {
    resultDisplay.innerText = "Score de la manche : ";
    if (resultLine) {
        resultLine.setMap(null);
    }

    if (userMarker) {
        userMarker.map = null;
        userMarker = null;
    }

    loadRandomSong();

    actionBtn.innerText = "Valider";
    actionBtn.onclick = validateMarker;
}

// Fonction pour réinitialiser le jeu après les 5 manches
function resetGame() {
    roundCounter = 0;
    scores = [];
    totalScoreDisplay.innerText = "Score total : 0 km";
    totalScoreDisplay.style.fontWeight = "normal";
    totalScoreDisplay.style.color = "black";
    roundInfo.innerText = `Manche : ${roundCounter + 1}/${maxRounds}`;

    fetch("data/songs.json")
        .then(response => response.json())
        .then(data => {
            currentPlaylist = generateUniquePlaylist(data); // Crée une nouvelle playlist pour la partie

            // Affiche la playlist dans la console pour le debug
            console.log("Playlist de la partie :", currentPlaylist);

            startNewRound();
        });
}

// Écouteur d'événement pour le bouton d'action
actionBtn.onclick = validateMarker;

// Initialisation de la partie et génération de la playlist unique
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

            // Affiche la playlist dans la console pour le debug
            console.log("Playlist de la partie :", currentPlaylist);

            loadRandomSong();
        });
})
.catch(error => console.error("Erreur de chargement des API :", error));