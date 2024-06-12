let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
});


let baseMaps = {
    "Greyscale": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.carto.com/">Carto</a> contributors, &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }),
    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }),
    "Outdoor": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
};

baseMaps["Greyscale"].addTo(myMap);

let overlays = {
    "Earthquakes": L.layerGroup(),
    "Tectonic Plates": L.layerGroup()
};

L.control.layers(baseMaps, overlays).addTo(myMap);

let earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";


fetch(earthquakeLink)
    .then(response => response.json())
    .then(data => {
        let earthquakesLayer = L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: Math.max(feature.properties.mag, 1) * 5, 
                    fillColor: chooseColor(feature.geometry.coordinates[2]), 
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9
                });
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup(
                    "Magnitude: " + feature.properties.mag + "<br>" +
                    "Location: " + feature.properties.place + "<br>" +
                    "Depth: " + feature.geometry.coordinates[2] + " km"
                );
            }
        }).addTo(overlays["Earthquakes"]);


let tectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

fetch(tectonicPlatesLink)
    .then(response => response.json())
    .then(data => {
        tectonicPlatesLayer = L.geoJSON(data);
    })
    .catch(error => {
        console.log("Error fetching tectonic plates data:", error);
    });

        // Adding legend
        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            let div = L.DomUtil.create('div', 'info legend');
            let depths = [-10, 10, 30, 50, 70, 90];

            
            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + chooseColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
            }

            return div;
        };

        legend.addTo(myMap);
    })
    .catch(error => {
        console.log("Error fetching earthquake data:", error);
    });



function chooseColor(depth) {
    if (depth > 90) return 'orangered' ;
    else if (depth > 70) return 'orange' ;
    else if (depth > 50) return 'yelloworange' ;
    else if (depth > 30) return 'yellow' ;
    else if (depth > 10) return 'greenyellow' ;
    else if (depth > -10) return 'green' ;
    else return 'black';
}

let tectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

fetch(tectonicPlatesLink)
    .then(response => response.json())
    .then(data => {
        let tectonicPlatesLayer = L.geoJSON(data).addTo(overlays["Tectonic Plates"]);
    })
    .catch(error => {
        console.log("Error fetching tectonic plates data:", error);
    });