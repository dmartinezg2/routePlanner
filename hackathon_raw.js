let map;
let markerInicial;
let markerFinal;
let coordinates;
let path;
let triangle;
let directionsService;
let directionsRenderer;
let markers = [];
let geocoder;
let stops= [];
let distanciaTotal = 0;
let conductor;

function initMap(){
    map = new google.maps.Map(document.getElementById('map'),{
        center:{lat:4.66421, lng: -74.07861}, // 
        zoom:16
    });


    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers:true});
    geocoder = new google.maps.Geocoder();
    
}


function clearMarkers(){
    directionsRenderer.setMap(null);
    var endMarkers=markers.length;
    for(var i=0; i<endMarkers; i++){
        markers[0].setMap(null);
        markers.shift();
    }
    conductor.setMap(null);
    conductor=null;
    var endStops=stops.length;
    for(var i=0; i<endStops; i++){
        stops[0].setMap(null);
        stops.shift();
    }
}


function addMarker(){
    var marker
    marker = new google.maps.Marker({
        position: map.getCenter(),  //lat: 4.67909, lng: -74.07723
        map: map,
        title: 'da marker',
        draggable: true
    });
    marker.setMap(map);
    markers.push(marker);
}

function calcularRuta(){
    if(markers.length<2){
        alert("Por favor ingrese al menos 2 marcadores");
        return;
    }
     
    for(var i=1; i<markers.length-1; i++){
        stops.push(markers[i]);
    }
    for(var i=0; i<stops.length; i++){
        stops[i]={location:new google.maps.LatLng(stops[i].position.lat(),stops[i].position.lng()) } ;
    }
    
    let request = {
        origin: {lat: markers[0].position.lat(), lng: markers[0].position.lng()},
        destination:{lat: markers[markers.length-1].position.lat(), lng:  markers[markers.length-1].position.lng()},
        travelMode: 'DRIVING',
        waypoints: stops  
    }
    directionsService.route(request,(result,status)=>{
        if(status == 'OK'){
            directionsRenderer.setDirections(result);
            var legs = result.routes[0].legs;
            for(var i=0; i<legs.length; i++){
                distanciaTotal += legs[i].distance.value;
            }
        }
    } );
    directionsRenderer.setMap(map);
  

    


}

function calcularPDP(){
    if(!conductor){
        alert("Por favor ingrese la posición del conductor");
        return;
    }
    var paradas = prompt("Ingrese el número de paradas que ha recorrido");
  
    if(paradas>markers.length-1){
        alert('Ingrese un número válido de paradas');
        return;
    }
    for(var i=0; i<paradas;i++){
        stops.shift();
    }

    let request = {
        origin: {lat: conductor.position.lat(), lng: conductor.position.lng()},
        destination:{lat: markers[markers.length-1].position.lat(), lng:  markers[markers.length-1].position.lng()},
        travelMode: 'DRIVING',
        waypoints: stops  
    } 
    var distancia = 0;
    directionsService.route(request,(result,status)=>{
        if(status == 'OK'){
            var legs = result.routes[0].legs;
            for(var i=0; i<legs.length; i++){
                distancia += legs[i].distance.value;
            }
            var pdp = (distanciaTotal-distancia)/distanciaTotal*100;
            alert(`El PDP es de ${pdp.toFixed(2)}%`);
        }
    } );

    var intermedios = [];
    for(var i=1; i<paradas+1;i++){
        intermedios.push(markers[i]);
    }

    let request2 = {
        origin: {lat: markers[0].position.lat(), lng:  markers[0].position.lng()},
        destination:{lat: conductor.position.lat(), lng: conductor.position.lng()},
        travelMode: 'DRIVING',
        waypoints: intermedios
    } 
    var distanciaPreDesvio = 0;
    directionsService.route(request2,(result,status)=>{
        if(status == 'OK'){
            var legs = result.routes[0].legs;
            for(var i=0; i<legs.length; i++){
                distanciaPreDesvio += legs[i].distance.value;
            }
            var pdp = (distanciaPreDesvio)/(distanciaPreDesvio+distancia)*100;
            alert(`El PDP es de ${pdp.toFixed(2)}%`);
        }
    } );
    
    

}

function agregarConductor(){
    if(conductor){
        alert('¡Ya existe un conductor!');
        return;
    }
    var marker
    marker = new google.maps.Marker({
        position: map.getCenter(),  //lat: 4.67909, lng: -74.07723
        map: map,
        title: 'da marker',
        draggable: true,
        icon: {
            url:"http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
    });
    conductor = marker;
}



//INFO WINDOWS
