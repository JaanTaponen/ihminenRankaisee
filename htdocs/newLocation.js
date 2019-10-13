import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
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
  features[i].setProperties({'style':new Style({
    image: new CircleStyle({
      radius: 20,
      stroke: new Stroke({
        color: '#fff'
      }),
      fill: new Fill({
        color: 'red'
      })
    }),
    text: new Text({
      text: "1",
      fill: new Fill({
        color: '#fff'
      })
    })
  })});
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
  console.log(array);
  var extent = map.getView().calculateExtent(map.getSize());
  var sideCard = document.getElementById("cardContainer2");
  while (sideCard.firstChild) {
    sideCard.removeChild(sideCard.firstChild);
  }
  var sideCardHeader = document.createElement("div");
  sideCardHeader.className = "card-header";
  sideCardHeader.innerHTML = "Top Kannatukset";
  var newSideCard = document.createElement("div");
  newSideCard.className = "card";
  newSideCard.appendChild(sideCardHeader);
  sideCard.appendChild(newSideCard);
  array.forEachFeatureInExtent(extent, function (feature, layer) {


    var sideCardUL = document.createElement("ul");
    sideCardUL.className = "list-group list-group-flush";
  
    function addChild(id)
    {
      var newListItem = document.createElement("li");
      newListItem.className = "list-group-item";
      var mySQLItem = '';
      // refactoroi paska
      for(var i = 0; i < courseList.length; i++)
      {
        if(courseList[i].Id == id)
        {
          mySQLItem = courseList[i];
          break;
        }
      }

      newListItem.innerHTML = mySQLItem.Nimi;
      return newListItem;
    }
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
        sideCardUL.appendChild(addChild(features[i].get('id')));
      }
    } else {
      // not a cluster
      sideCardUL.appendChild(addChild(feature.get('features')[0].get('id')));
    }
    newSideCard.appendChild(sideCardUL);
    
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
      var singleFeature =feature.get('features')[0];
      console.log(singleFeature);
      
      singleFeature.set('style', new Style({
        image: new CircleStyle({
          radius: 20,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: 'red'
          })
        }),
        text: new Text({
          text: "1",
          fill: new Fill({
            color: '#fff'
          })
        })
      }));
      map.render();
      console.log(singleFeature.get('style'));
      var featureID = singleFeature.get('id');
      var mySQLItem = '';
      for(var i = 0; i < courseList.length; i++)
      {
        if(courseList[i].Id == featureID)
        {
          mySQLItem = courseList[i];
          break;
        }
      }
      var leftSideCard = document.getElementById("cardContainer");
      var leftSideCardTitle = document.getElementById("cardContainerTitle");
      if(leftSideCardTitle.innerHTML == mySQLItem.Nimi)
      {
      leftSideCard.className == 'invisible' 
      ? leftSideCard.className = 'cardContainer2' 
      : leftSideCard.className = 'invisible';
      }
      leftSideCardTitle.innerHTML = mySQLItem.Nimi;
      var leftSideCardText = document.getElementById("cardContainerText");
      leftSideCardText.innerHTML = mySQLItem.Kuvaus;

    }
  });
});
distance.addEventListener('input', function () {
  clusterSource.setDistance(parseInt(distance.value, 10));
});