function startDataToMap() {
  const centerCoord = [55.80051, 49.15009];
  const positionCoord = [55.77295, 49.2419];
  const positionCoord2 = [55.7645, 49.20965];

  //Определяем карту, координаты центра и начальный масштаб
  var map = L.map("map").setView(centerCoord, 12);

  //Добавляем на нашу карту слой OpenStreetMap
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a rel="nofollow" href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // добавить маркер на карту
  L.marker(positionCoord).addTo(map);

  // добавить маркер на карту с балуном
  /*
  L.marker(positionCoord2)
    .addTo(map)
    .bindPopup("<strong>Ометьевский лес</strong><br />Адрес: Казань")
    .openPopup();
    */

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
  var aircraft = new LeafIcon({ iconUrl: "img/aircraft_small.png" });
  L.marker([55.77339, 49.22098], { icon: aircraft }).addTo(map);

  // окружность
  L.circle(positionCoord, { radius: 2000 }).addTo(map);

  /* используем плагин src="dist/Leaflet.MovingMarker/MovingMarker.js" */
  //MovingMarker Options
  var animationMarker = L.Marker.movingMarker(
    [positionCoord2, positionCoord],
    20000,
    { autostart: true }
  );
  // Custom Icon Object
  var greenIcon = L.icon({
    iconUrl: "img/aircraft_small.png"
  });
  // Set icon to movingMarker
  animationMarker.options.icon = greenIcon;
  // Add marker to Map
  map.addLayer(animationMarker);
}
