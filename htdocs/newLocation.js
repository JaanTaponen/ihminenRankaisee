import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Cluster, OSM, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';

var distance = document.getElementById('distance');

var courseList = [];
var data =
{
  courses: 'all'
};
//connect to the SQL server for getting all courses to select from
$.ajax({
  type: "POST",
  url: "http://localhost/sql/call.php",
  data: data,
  success: function (data) {
    courseList = data;
  },
  dataType: 'json',
  async: false
});
console.log(courseList);


var count = courseList.length;
var features = new Array(count);
for (var i = 0; i < courseList.length; ++i) {
  console.log(coordinates, "vittu");
  var coordinates = [parseFloat(courseList[i].Latitude),parseFloat(courseList[i].Longitude)];
  coordinates = fromLonLat(coordinates);
  console.log(coordinates,"legit");
  features[i] = new Feature(new Point(coordinates));
  features[i].setProperties({ 'id': courseList[i].Id, 'isVisible': 'false' });
}
console.log("veli ooks terve")
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
  style: function (feature) {
    var size = feature.get('features').length;
    var style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
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

var raster = new TileLayer({
  source: new OSM()
});

var map = new Map({
  layers: [raster, clusters],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

map.on('moveend',function(e){
  var array = map.getLayers().getArray()[1].getLayersArray()[0].getSource();
  //var feature = array.get('features');
  console.log(array);
  var extent = map.getView().calculateExtent(map.getSize());
  console.log(extent);
  
  array.forEachFeatureInExtent(extent, function (feature, layer) {
    console.log("asdsad")
    function isCluster(feature) {
      if (!feature || !feature.get('features')) { 
            return false; 
      }
      return feature.get('features').length > 1;
    }
    if (isCluster(feature)) {
      // is a cluster, so loop through all the underlying features
      var features = feature.get('features');
      for(var i = 0; i < features.length; i++) {
        // here you'll have access to your normal attributes:
        console.log(features[i].get('id'));
      }
    } else {
      // not a cluster
      console.log(feature.get('features')[0].get('id'));
    }
    
  });
});
map.getViewport().addEventListener("click", function (e) {
  console.log(e);
  map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
    function isCluster(feature) {
      if (!feature || !feature.get('features')) { 
            return false; 
      }
      return feature.get('features').length > 1;
    }

    if (isCluster(feature)) {
      // is a cluster, so loop through all the underlying features
      var features = feature.get('features');
      for(var i = 0; i < features.length; i++) {
        // here you'll have access to your normal attributes:
        console.log(features[i].get('id'));
      }
    } else {
      // not a cluster
      console.log(feature.get('features')[0].get('id'));
    }
  });
});
distance.addEventListener('input', function () {
  clusterSource.setDistance(parseInt(distance.value, 10));
});