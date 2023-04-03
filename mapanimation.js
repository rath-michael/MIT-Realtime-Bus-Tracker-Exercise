var markers = [];
var map;
var routeDictionary = {};

// Add bus markers to map
async function addMarkers(){
	// get bus data
	var locations = await getBusLocations();
	
	// loop through data, add bus markers
	locations.forEach(function(bus){
		var marker = getMarker(bus.id);		
		if (marker){
			moveMarker(marker,bus);
		}
		else{
			addMarker(bus);			
		}
	});
	
	// timer
	console.log(new Date());
	setTimeout(addMarkers,15000);

	var legendContainer = document.getElementById('legend');
	legendContainer.innerHTML = generateLegend();
}

// Request bus data from MBTA
async function getBusLocations(){
	//var url = 'https://api-v3.mbta.com/vehicles?api_key=2105d1d6f3e04d4d920e9d74819b112f&filter[route]=1&include=trip';	
	var url = 'https://api-v3.mbta.com/vehicles?api_key=2105d1d6f3e04d4d920e9d74819b112f';
	var response = await fetch(url);
	var json = await response.json();
	return json.data;
}

function addMarker(bus){
	var icon = getIcon(bus);
	var marker = new google.maps.Marker({
		position: {
			lat: bus.attributes.latitude, 
			lng: bus.attributes.longitude
		},
		map: map,
		icon: icon,
		id: bus.id
	});
	markers.push(marker);
}

function getIcon(bus){
	// select color based on bus route
	var color = getColor(bus.relationships.route.data.id);

	// create canvas element and draw colored circle
	var canvas = document.createElement('canvas');
	canvas.width = 10;
	canvas.height = 10;
	var context = canvas.getContext('2d');
	context.beginPath();
	context.arc(5, 5, 5, 0, 2 * Math.PI);
	context.fillStyle = color;
	context.fill();
  
	// convert canvas to data URL and use as marker icon
	var icon = canvas.toDataURL();
	return icon;
}

function getColor(routeId){
	// check if color is already in dictionary
	if (routeId in routeDictionary) {
		return routeDictionary[routeId];
	}
	
	var randomColor = "#000000".replace(/0/g, function() {
		return (~~(Math.random() * 16)).toString(16);
	  });
	
	// add color to dictionary
	routeDictionary[routeId] = randomColor;
	return randomColor;
}

function moveMarker(marker,bus) {
	// change icon if bus has changed direction
	var icon = getIcon(bus);
	marker.setIcon(icon);
	
	// move icon to new lat/lon
	marker.setPosition( {
		lat: bus.attributes.latitude, 
		lng: bus.attributes.longitude
	});
}

function getMarker(id){
	var marker = markers.find(function(item){
		return item.id === id;
	});
	return marker;
}

function generateLegend() {
	var legendHtml = '';
	for (var routeId in routeDictionary) {
	  var color = routeDictionary[routeId];
	  legendHtml += '<div class="legend-item">';
	  legendHtml += '<input type="checkbox" id="checkbox-' + routeId + '" class="legend-checkbox">';
	  legendHtml += '<div class="legend-color" style="background-color:' + color + '"></div>';
	  legendHtml += '<div class="legend-label">Route ' + routeId + '</div>';
	  legendHtml += '</div>';
	}
	return legendHtml;
}