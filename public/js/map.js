
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({

    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});
const markerEl = document.createElement('div');

markerEl.innerHTML = `
  <i class="fa-regular fa-compass" ></i>
`;            
const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25}).setHTML(
        `<h4>${listing.title}</h4> <p>Exact Location will be provided after booking</p>`
        ))
        .addTo(map);