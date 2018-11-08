var Map = null;
var CenterLat = 55.80051;
var CenterLon = 49.15009;
var Planes = {};
var NumPlanes = 0;
var Selected = null;

//  добавить маркер на карту со своей иконкой
//задаем параметры для нашей иконки
var LeafIcon = L.Icon.extend({
  options: {
    shadowUrl: "img/shadow.png",
    iconSize: [32, 37],
    shadowSize: [51, 37],
    iconAnchor: [16, 37],
    shadowAnchor: [16, 37],
    popupAnchor: [0, -30]
  }
});

//определяем файл с изображением для каждого из видов иконок
var aircraft_left = new LeafIcon({ iconUrl: "img/aircraft_left.png" });
var aircraft_right = new LeafIcon({ iconUrl: "img/aircraft_right.png" });

function getDirectionPlane([newLat, newLong], [oldLat, oldLong]) {
  if (newLong > oldLong) {
    return aircraft_right;
  } else {
    return aircraft_left;
  }
}

//L.marker([55.77339, 49.22098], { icon: aircraft }).addTo(map);

console.log("script_old");

function getIconForPlane(plane) {
  var r = 255,
    g = 255,
    b = 0;
  var maxalt = 40000; /* Max altitude in the average case */
  var invalt = maxalt - plane.altitude;
  var selected = Selected == plane.hex;

  if (invalt < 0) invalt = 0;
  b = parseInt((255 / maxalt) * invalt);
  return {
    strokeWeight: selected ? 2 : 1,
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 5,
    fillColor: "rgb(" + r + "," + g + "," + b + ")",
    fillOpacity: 0.9,
    rotation: plane.track
  };
}

function onClickPlane(ev) {
  //
  console.log("click onClickPlane");
  console.log("ev = ", ev);
  console.log("Planes = ", Planes);

  console.log("this.planehex = ", this.planehex);

  if (!Planes[this.planehex]) return;
  var old = Selected;
  Selected = this.planehex;
  if (Planes[old]) {
    /* Remove the highlight in the previously selected plane. */
    // Planes[old].marker.setIcon(getIconForPlane(Planes[old]));
  }
  //Planes[Selected].marker.setIcon(getIconForPlane(Planes[Selected]));
  refreshSelectedInfo();
}

function refreshGeneralInfo() {
  var i = document.getElementById("geninfo");

  i.innerHTML = NumPlanes + " planes on screen.";
}

function refreshSelectedInfo() {
  console.log("refreshSelectedInfo()");
  var i = document.getElementById("selinfo");
  var p = Planes[Selected];
  console.log("p = ", p);

  if (!p) return;
  var html = "ICAO: " + p.hex + "<br>";
  if (p.flight.length) {
    html += "<b>" + p.flight + "</b><br>";
  }
  html += "Altitude: " + p.altitude + " feet<br>";
  html += "Speed: " + p.speed + " knots<br>";
  html += "Coordinates: " + p.lat + ", " + p.lon + "<br>";
  i.innerHTML = html;
}

function fetchData() {
  //console.log("fetch");
  $.getJSON("http://localhost:8080/data.json", function(data) {
    //console.log("data = ", data);
    var stillhere = {};
    for (var j = 0; j < data.length; j++) {
      var plane = data[j];
      var marker = null;
      stillhere[plane.hex] = true;
      plane.flight = $.trim(plane.flight);

      if (Planes[plane.hex]) {
        var myplane = Planes[plane.hex];
        if (myplane.lat != plane.lat && myplane.lon != plane.lon) {
          console.log(
            myplane.flight,
            " old pos = ",
            [myplane.lat, myplane.lon],
            " new pos = ",
            [plane.lat, plane.lon]
          );
          Planes[plane.hex].removeFrom(Map);
          Planes[plane.hex] = new L.marker([plane.lat, plane.lon], {
            icon: getDirectionPlane(
              [plane.lat, plane.lon],
              [myplane.lat, myplane.lon]
            )
          });
          Planes[plane.hex].altitude = plane.altitude;
          Planes[plane.hex].planehex = plane.hex;
          Planes[plane.hex].speed = plane.speed;
          Planes[plane.hex].track = plane.track;
          Planes[plane.hex].lon = plane.lon;
          Planes[plane.hex].lat = plane.lat;
          Planes[plane.hex].flight = plane.flight;
          Planes[plane.hex].hex = plane.hex;
          L.DomEvent.addListener(Planes[plane.hex], "click", onClickPlane);
          //refreshSelectedInfo();
          if (Planes[plane.hex].hex == Selected) refreshSelectedInfo();

          if (plane.flight.length == 0) {
            Planes[plane.hex].bindPopup(plane.hex);
          } else {
            Planes[plane.hex].bindPopup(plane.flight + " (" + plane.hex + ")");
          }
          Planes[plane.hex].addTo(Map);
        }
      } else {
        Planes[plane.hex] = new L.marker([plane.lat, plane.lon], {
          icon: aircraft_left
        });
        //Planes[plane.hex] = plane;
        Planes[plane.hex].altitude = plane.altitude;
        Planes[plane.hex].planehex = plane.hex;
        Planes[plane.hex].speed = plane.speed;
        Planes[plane.hex].track = plane.track;
        Planes[plane.hex].lon = plane.lon;
        Planes[plane.hex].lat = plane.lat;
        Planes[plane.hex].flight = plane.flight;
        Planes[plane.hex].hex = plane.hex;

        Planes[plane.hex].addTo(Map);

        L.DomEvent.addListener(Planes[plane.hex], "click", onClickPlane);

        if (plane.flight.length == 0) {
          //marker.setTitle(plane.hex);
          Planes[plane.hex].bindPopup(plane.hex);
        } else {
          //marker.setTitle(plane.flight + "Planes[plane.hex].hex = plane.hex; (" + plane.hex + ")");
          Planes[plane.hex].bindPopup(plane.flight + " (" + plane.hex + ")");
        }
      }
    }
    NumPlanes = data.length;

    /* Remove idle planes. */
    for (var p in Planes) {
      if (!stillhere[p]) {
        //Planes[p].marker.setMap(null);
        Planes[p].removeFrom(Map);
        delete Planes[p];
      }
    }
  });
}

function initialize() {
  console.log("initialize");
  //Определяем карту, координаты центра и начальный масштаб
  Map = L.map("map_canvas").setView([CenterLat, CenterLon], 6);

  //Добавляем на нашу карту слой OpenStreetMap
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a rel="nofollow" href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(Map);

  /* Setup our timer to poll from the server. */
  window.setInterval(function() {
    fetchData();
    refreshGeneralInfo();
  }, 1000);
}
