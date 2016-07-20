var Map = function(latLng, zoom){
  this.googleMap = new google.maps.Map(document.getElementById('map'), {
    center: latLng,
    zoom: zoom
});
  this.addMarker = function(latLng, title){
      var marker = new google.maps.Marker({
        position:  latLng,
        map: this.googleMap,
        title: title
    })
      return marker; 
  } 

  this.addInfoWindow= function(latLng, title){
    var marker = this.addMarker(latLng, title);
    marker.addListener('click', function(event){
      var infoWindow = new google.maps.InfoWindow({
        content: this.title
      })
      infoWindow.open( this.map, marker ) 
    })
  }
}

var GeoLocator = function(map, countries){
  this.map = map;
  this.setCenter = function(){
    navigator.geolocation.getCurrentPosition(function(response){ 
      var position = {lat: response.coords.latitude, lng: response.coords.longitude}
      this.map.googleMap.panTo(position);
        
      
    }.bind(this))
  }
}

window.onload = function () {
    var url = 'https://restcountries.eu/rest/v1'
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onload = function () {
        if (request.status === 200) {
            var jsonString = request.responseText;
            var countries = JSON.parse(jsonString);
            main(countries);
        }
    }
    request.send();

};

var main = function (countries) {

    var cached = localStorage.getItem("selectedCountry");
    var selected = countries[0];
    if(cached){
        selected = JSON.parse(cached);
        document.querySelector('#countries').selectedIndex = selected.index;
    }
    var center = {lat: selected.latlng[0], lng: selected.latlng[1]}
    var map = new Map(center, 5);
    populateSelect(countries, map);
    updateDisplay(selected, map);
    document.querySelector('#info').style.display = 'block'; 
    var button = document.getElementById("find-button") 
    button.onclick = function(event){
        find(map, countries);
    }
}


var find = function(map,countries){
    var geo = new GeoLocator(map);
    geo.setCenter(map)
}

// var geoFind = function(latLng){
//     var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+latLng.lat+"," +latLng.lng+ "&sensor=false"
//     var request = new XMLHttpRequest();
//     request.open("GET", url);
//     request.onload = function () {
//         if (request.status === 200) {
//             var jsonString = request.responseText;
//             var country = JSON.parse(jsonString);
//             console.log(country)   
//         }
//     }
// }

var updateMap = function(selected, map){
    var center = {lat: selected.latlng[0], lng: selected.latlng[1]}
    map.googleMap.setZoom(2)
    setTimeout(function(){
        map.googleMap.panTo(center);
        setTimeout(function(){map.googleMap.setZoom(6);},1000)
    },1000)
}

var populateSelect = function (countries, map) {
    var parent = document.querySelector('#countries');
    countries.forEach(function (item, index) {
        item.index = index;
        var option = document.createElement("option");
        option.value = index.toString();
        option.text = item.name;
        parent.appendChild(option);
    });
    parent.style.display = 'block';
    parent.addEventListener('change', function (e) {
        var index = this.value;
        var country = countries[index];
        updateDisplay(country, map);
        localStorage.setItem("selectedCountry",JSON.stringify(country));
    });
}

var updateDisplay = function (selected, map) {
    var tags = document.querySelectorAll('#info p');
    tags[0].innerText = selected.name;
    tags[1].innerText = selected.population;
    tags[2].innerText = selected.capital;

    if(map){
        updateMap(selected, map)
    }
    var content = "<h4>Name: <a href='https://www.google.co.uk/#safe=off&q="+selected.name + "' target='_blank'>" + selected.name + "</a></h4><p>Capital: " + selected.capital + "</p><p>Pop: " + selected.population + " people</p><p>Sub/Region: " + selected.subregion + "/" + selected.region + "</p>"

    var center = {lat: selected.latlng[0], lng: selected.latlng[1]}
    map.addInfoWindow(center, content);

}
