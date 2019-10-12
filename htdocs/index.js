import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import GeoJSON from 'ol/format/GeoJSON';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Cluster, OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import {fromLonLat} from 'ol/proj';

var distance = document.getElementById('distance');

var count = 20000;
var features = new Array(count);
var e = 4500000;
for (var i = 0; i < count; ++i) {
  var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
  features[i] = new Feature(new Point(coordinates));
}

var source = new VectorSource({
  features: features
});

var clusterSource = new Cluster({
  distance: parseInt(distance.value, 10),
  source: source
});

var styleCache = {};
var clusters = new VectorLayer({
  source: clusterSource,
  style: function(feature) {
    var size = feature.get('features').length;
    var style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: '#eb34b4'
          }),
          fill: new Fill({
            color: 'green'
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

var raster = new TileLayer({
  source: new OSM()
});
var mantsalaLocation = [25.320351,60.635681];
const mantsala = fromLonLat(mantsalaLocation);
console.log(mantsala)
var map = new Map({
  layers: [raster, clusters],
  target: 'map',
  view: new View({
    center: mantsala,
    zoom: 10
  })
 
});


distance.addEventListener('input', function() {
  clusterSource.setDistance(parseInt(distance.value, 10));
});