var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl, function (data) {
  console.log(data)
  createFeatures(data);
});

function chooseColor(magnitude) {
  if (magnitude > 5) {
    return "red";
  }
  else if (magnitude > 4) {
    return "orange";
  }
  else if (magnitude > 3) {
    return "yellow";
  }
  else if (magnitude > 2) {
    return "green";
  }
  else if (magnitude > 1) {
    return "blue";
  }
  else {
    return "violet";
  }
};

function circleSize(magnitude) {
  return magnitude ** 2;
}  

function createFeatures(earthquakeData) {
  function onEachLayer(feature) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      radius: circleSize(feature.properties.mag),
      fillOpacity: 0.75,
      color: chooseColor(feature.properties.mag),
      fillColor: chooseColor(feature.properties.mag)
    });
  }

  function addDetails(feature, layer) {
    layer.bindPopup("<h3><a target='_blank' href='" + feature.properties.url + "'>Click here</a><hr> " + "<h3>" + feature.properties.place +
      "</h3> <hr> <h3>" + new Date(feature.properties.time) + "</h3> <hr> <h3> Magnitude: " + feature.properties.mag + "</h3>")
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: addDetails,
    pointToLayer: onEachLayer
  });
  createMap(earthquakes);
}

function createMap(earthquakes) {
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
  };

  var overlayMaps = {
    Earthquakes: earthquakes
  };

  var myMap = L.map("map", {
    center: [
      0.00, 0.00
    ],
    zoom: 2,
    layers: [streetmap, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
      magnitude = [0, 1, 2, 3, 4, 5],
      labels = [];

    for (var i = 0; i < magnitude.length; i++) {
      div.innerHTML +=
        '<i style="background:' + chooseColor(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
};