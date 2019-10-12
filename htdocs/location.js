import 'ol/ol.css';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import {Cluster, OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';

function generateProperLocation(longLat, id, fill, stroke) {
  var addressLocation = longLat;
  var variationX = Math.random() * 500;
  var variationY = Math.random() * 500;
  variationX = variationX / 1000000;
  variationY = variationY / 1000000;
  variationX = variationX.toFixed(6);
  variationY = variationY.toFixed(6);
  if (Math.random() > 0.5) {
    variationX = -variationX;
  }
  if (Math.random() > 0.5) {
    variationY = -variationY;
  }
  addressLocation[0] = addressLocation[0] + variationX;
  addressLocation[1] = addressLocation[1] + variationY;

  var address = new Feature();
  address.setProperties({ 'location': id, 'isVisible': '0' });
  address.setGeometry(new Point(fromLonLat(addressLocation)));
  return address;
}



var mantsalaLocation = [25.320351, 60.635681];
const mantsala = fromLonLat(mantsalaLocation);

var view = new View({
  center: mantsala,
  zoom: 7,
});

var raster = new TileLayer({
  source: new OSM()
});
var defaultLocation = [25.326048, 60.635646];
var count = 10;
var iterator = 0;
var locationArray = new Array(count);
while(iterator < count)
{
  locationArray[iterator] = generateProperLocation(defaultLocation,iterator,null,null);
  iterator++;
}

var source = new VectorSource({
  features: locationArray
});
var clusterSource = new Cluster({
  source: source
});

var styleCache = {};
var clusters = new VectorLayer({
  source: clusterSource,
  style: function(feature) {
    var size = feature.get('features').length;
    console.log("tsek")
    var style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 25,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: '#3399CC'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      });
      styleCache[size] = style;
    }
    return style;
  }
});

var map = new Map({
  layers: [raster,clusters
  ],
  target: 'map',
  view: view
});

var geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true
  },
  projection: view.getProjection()
});
geolocation.on('error', function (error) {
  var info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});


// dummy muuttuja


/*
var raster = new TileLayer({
  source: new OSM()
});
map = new Map({
  layers: [raster,clusters],
  target: 'map',
  view: view
});
*/
console.log(map.getLayers());
var accuracyFeature = new Feature();
var positionFeature = new Feature();
positionFeature.setProperties({ 'location': 'mantsalanSairaala', 'isVisible': '0' });
function locateMe() {
  console.log(document.getElementById('track'));
  // handle geolocation error.


  geolocation.on('change:accuracyGeometry', function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  positionFeature.setStyle(new Style({
    image: new CircleStyle({
      radius: 3,
      fill: new Fill({
        color: '#3399CC'
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 1
      })
    }),

  }));

  // USER CENTERING 
  geolocation.on('change:position', function () {
    var coordinates = geolocation.getPosition();
    var sizeM = map.getSize()
    console.log(sizeM)
    view.centerOn(coordinates, sizeM, [sizeM[0] / 2, sizeM[1] / 2])
    view.setZoom(10)
    positionFeature.setGeometry(coordinates ?
      new Point(coordinates) : null);
  });


}
console.log(document.getElementById('track'));
document.getElementById('track').addEventListener('click', function () {
  geolocation.setTracking(!geolocation.getTracking());
  if (geolocation.getTracking()) {
    locateMe();
  }
});
new VectorLayer({
  map:map,
  source: clusterSource
});
new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature]
  })
});


map.getViewport().addEventListener("click", function (e) {
  map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
    var clickedAddress = feature;
    console.log(clickedAddress.get('location'));
    var isClicked = clickedAddress.get('isVisible') == '0' ? true : false;
    if (!isClicked) {
      clickedAddress.setProperties({ 'location': 'mantsalanSairaala', 'isVisible': '0' });
      var master = document.getElementById("master");
      var newDiv = document.createElement('coolCard');
      newDiv.id = clicked.get('location');
      newDiv.innerHTML = "Mäntsälän Sairaala, Vittu tääl Kuolee";
      newDiv.className = "newCard";
      master.appendChild(newDiv);
    }
    else {
      var master = document.getElementById("master");
      var children = master.childNodes;
      clicked.setProperties({ 'location': 'mantsalanSairaala', 'isVisible': '1' });
      for (var i = 0; i < children.length; i++) {
        if (children[i].getAttribute('id') == 'mantsalanSairaala') {
          master.removeChild(children[i]);
          break;

        }
      }
    }
  });
});