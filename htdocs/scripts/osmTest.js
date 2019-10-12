var osm = require('osm');
 
// show a map of the current position
var map = osm();
document.body.appendChild(map.show());
 
// show a map of a fixed position
map = osm().position(47.88038, 10.6222475);
document.body.appendChild(map.show());
 
// show a map of the current position with a custom radius
map = osm().radius(0.008);
document.body.appendChild(map.show());