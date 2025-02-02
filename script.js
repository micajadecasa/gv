const targetLat = 42.846718; // Coordenada del personaje (Plaza de la Virgen Blanca)
const targetLon = -2.671635;

let map;
let userMarker;

document.getElementById('startButton').addEventListener('click', function() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    initMap();
    startGame();
});

function initMap() {
    // Clave de API de Maptiler (reemplaza con tu clave)
    const apiKey = 'UgUaBMws334E5bGPRgsK';

    // Estilo de Maptiler (puedes cambiarlo por otro estilo)
    const mapStyle = `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`;

    // Inicializar el mapa con MapLibre GL JS
    map = new maplibregl.Map({
        container: 'map', // ID del contenedor del mapa
        style: mapStyle, // Estilo de Maptiler
        center: [targetLon, targetLat], // Centro del mapa (longitud, latitud)
        zoom: 17, // Zoom inicial (más cercano para móviles)
        pitch: 60, // Inclinación del mapa para efecto 3D
        bearing: -17.6, // Rotación del mapa
        maxZoom: 19, // Límite máximo de zoom
        minZoom: 14 // Límite mínimo de zoom
    });

    // Añadir controles de navegación
    map.addControl(new maplibregl.NavigationControl());

    // Añadir marcador del personaje
    new maplibregl.Marker({ color: 'red' })
        .setLngLat([targetLon, targetLat])
        .setPopup(new maplibregl.Popup().setHTML("¡Aquí está el personaje! Dirígete aquí para conocer la historia."))
        .addTo(map)
        .togglePopup();

    // Añadir capa de edificios en 3D
    map.on('load', () => {
        map.addLayer({
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        });
    });
}

function startGame() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError);
    } else {
        document.getElementById('locationStatus').innerHTML = "Geolocalización no es soportada por este navegador.";
    }
}

function showPosition(position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    document.getElementById('locationStatus').innerHTML = `Ubicación actual: Latitud ${userLat}, Longitud ${userLon}`;

    // Actualizar o añadir marcador del usuario
    if (userMarker) {
        userMarker.setLngLat([userLon, userLat]);
    } else {
        userMarker = new maplibregl.Marker({ color: 'blue' })
            .setLngLat([userLon, userLat])
            .addTo(map);
    }

    // Verificar si el usuario está cerca del personaje
    const radius = 0.001; // Radio de proximidad en grados (aproximadamente 100 metros)
    if (Math.abs(userLat - targetLat) < radius && Math.abs(userLon - targetLon) < radius) {
        document.getElementById('character').style.display = 'block';
        document.getElementById('story').innerHTML = "¡Bienvenido a la Plaza de la Virgen Blanca! Este es el corazón de Vitoria-Gasteiz, donde se celebran muchas de las fiestas y eventos importantes de la ciudad.";
    } else {
        document.getElementById('character').style.display = 'none';
    }
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('locationStatus').innerHTML = "Permiso denegado para acceder a la ubicación.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('locationStatus').innerHTML = "Información de ubicación no disponible.";
            break;
        case error.TIMEOUT:
            document.getElementById('locationStatus').innerHTML = "Tiempo de espera agotado al intentar obtener la ubicación.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('locationStatus').innerHTML = "Error desconocido.";
            break;
    }
}