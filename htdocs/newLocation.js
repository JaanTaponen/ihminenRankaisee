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
//Get SQL data
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

//Generate Features for the map
var count = courseList.length;
var features = new Array(count);
for (var i = 0; i < courseList.length; ++i) {
  var coordinates = [parseFloat(courseList[i].Latitude),parseFloat(courseList[i].Longitude)];
  coordinates = fromLonLat(coordinates);
  features[i] = new Feature(new Point(coordinates));
  features[i].setProperties({ 'id': courseList[i].Id, 'isVisible': 'false' });
}
//Bundle Features together into one source
var source = new VectorSource({
  features: features
});

//Bind the source into a cluster
var clusterSource = new Cluster({
  distance: parseInt(distance.value, 10),
  source: source
});

//Stylize the features and 
var styleCache = {};
var clusters = new VectorLayer({
  source: clusterSource,
  style: function (feature) {
    console.log(feature);
    var size = feature.get('features').length;
    var style = styleCache[size];
    console.log(feature.get('features')[0].get('isVisible'));
    if (feature.get('features')[0].get('isVisible') == 'false') {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: 'white'
          }),
          fill: new Fill({
            color: 'red'
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
    else
    {
      style = new Style({
        image: new CircleStyle({
          radius: 20,
          stroke: new Stroke({
            color: 'black'
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
var mantsalaLocation = [25.320351, 60.635681];
const mantsala = fromLonLat(mantsalaLocation);

var view =  new View({
  center:mantsala,
  zoom: 7
})
var map = new Map({
  layers: [raster, clusters],
  target: 'map',
  view: view
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
  var sideCardUL = document.createElement("ul");
  sideCardUL.className = "list-group list-group-flush";
  array.forEachFeatureInExtent(extent, function (feature, layer) {



  
    function addChild(id,feature)
    {
      var givenFeature = feature;
      console.log(givenFeature);
      var newListItem = document.createElement("li");
      newListItem.className = "list-group-item";
      newListItem.style.cursor = "pointer"; 
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
      newListItem.addEventListener('mouseenter',function()
      {
        newListItem.className = "list-group-item list-group-item-secondary";
      });
      newListItem.addEventListener('mouseleave',function()
      {
        newListItem.className = "list-group-item";
      });
      newListItem.addEventListener('click',function()
      {
        var leftSideCard = document.getElementById("cardContainer");
        leftSideCard.className = "cardContainer2";
        var leftSideCardTitle = document.getElementById("cardContainerTitle");
        leftSideCardTitle.innerHTML = mySQLItem.Nimi;
        var leftSideCardText = document.getElementById("cardContainerText");
        leftSideCardText.innerHTML = mySQLItem.Kuvaus;
        console.log(feature);
        feature.setProperties({'isVisible':'true'});
        var longitude = mySQLItem.Longitude;
        var latitude = mySQLItem.Latitude;
        var coordinates = [parseFloat(latitude),parseFloat(longitude)];
        coordinates = fromLonLat(coordinates);
        view.animate({
          center: coordinates,
          zoom: 12,
          duration: 500
        });

      });
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
        console.log(features[i]);
        sideCardUL.appendChild(addChild(features[i].get('id'),features[i]));
      }
    } else {
      // not a cluster
      sideCardUL.appendChild(addChild(feature.get('features')[0].get('id'),feature.get('features')[0]));
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
      singleFeature.get('isVisible') == 'false' ? 
      singleFeature.setProperties({'isVisible':'true'}) :
      singleFeature.setProperties({'isVisible':'false'});
      console.log(singleFeature.get('isVisible'));
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