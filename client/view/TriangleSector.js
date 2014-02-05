/**
 * require()
 */
(function(){

  window.TriangleSector = function(sector, map, geo){
    this.triangles = [];
    this.sector = sector;
    this.count = 2;
    this.geo = geo;
    this.geoObjects = map.geoObjects;
  }

  $.extend(TriangleSector.prototype, {

    draw: function(){
      for (var i = 1; i <= this.count; i++){
        var current = this.drawPart(this.sector, this.sector.radius * i / this.count);
        this.triangles.push(current);
        this.geoObjects.add(current);
      }
    },

    remove: function(){
      for (var i = 0; i < this.triangles.length; i++){
        this.geoObjects.remove(this.triangles[i]);
      }
    },

    drawPart: function(sector, distance){
      var a = sector.center,
        angle = sector.angle,
        azimuth = sector.azimuth,
        b = Geo.endPoint(a, azimuth + angle, distance),
        c = Geo.endPoint(a, azimuth - angle, distance);

      return new ymaps.Polygon([
        [a, b, c],
        []
      ])
    }


  });




}());
