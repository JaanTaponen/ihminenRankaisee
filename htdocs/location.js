import 'ol/ol.css';
import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';


var mantsalaLocation = [25.320351, 60.635681];
const mantsala = fromLonLat(mantsalaLocation);

var view = new View({
  center: mantsala,
  zoom: 7,
});

var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
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

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
});
// dummy muuttuja
var sairaalaLocation = [25.326048, 60.635646];
var mantsalanSairaala = new Feature();
mantsalanSairaala.setStyle(new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({
      color: 'green'
    }),
    stroke: new Stroke({
      color: 'pink',
      width: 15
    })
  })
}));
mantsalanSairaala.setGeometry(new Point(fromLonLat(sairaalaLocation)));
// handle geolocation error.
geolocation.on('error', function (error) {
  var info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

var accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

var positionFeature = new Feature();
positionFeature.setStyle(new Style({
  image: new CircleStyle({
    radius: 16,
    fill: new Fill({
      color: '#3399CC'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 20
    })
  }),
  
}));
positionFeature.setProperties({'peruna':'mantsalanSairaala','isVisible':'notTrue'});
console.log(positionFeature);

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

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature, mantsalanSairaala]
  })
});
map.getViewport().addEventListener("click", function (e) {
  
  map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
    var clicked = feature;
    console.log(clicked);
    var isClicked = clicked.get('isVisible') == '0' ? true : false;
    console.log(isClicked);
    if (!isClicked) {
      console.log("?");
      clicked.setProperties({'location':'mantsalanSairaala','isVisible':'0'});
      var master = document.getElementById("master");
      var newDiv = document.createElement('coolCard');
      newDiv.id = clicked.get('location');
      newDiv.innerHTML = "Mäntsälän Sairaala, Vittu tääl Kuolee";
      newDiv.className = "newCard";
      master.appendChild(newDiv);
      master.getc
    }
    else {
      console.log("????");
      var master = document.getElementById("master");
      var children = master.childNodes;
      console.log(children);
      clicked.setProperties({'location':'mantsalanSairaala','isVisible':'1'});
      for (var i = 0; i < children.length; i++) {
        console.log(children[i].getAttribute('id'));
        if (children[i].getAttribute('id') == 'mantsalanSairaala') // any attribute could be used here
        {
          master.removeChild(children[i]);
          console.log("NO POISTATKO SÄ HÄH?");
          break;

        }
      }
    }
    console.log(clicked);
    console.log("END OF BLOCK")
  });
});