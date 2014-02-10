/**
 * require(views/map/geo)
 */
(function(){

  window.TriangleSector = function(center, towerAttrs, map, geo){
    this.parts =  new ymaps.GeoObjectCollection({}, {
      draggable: false
    });
    this.center = center;
    this.sector = towerAttrs;
    this.gradientSteps = this.sector.type == 'highway'? 1 : 5;
    this.geo = geo;
    this.map = map;
    this.geoObjects = map.geoObjects;
  }

  $.extend(TriangleSector.prototype, {

    render: function(){
      var previous = null,//triangle
        sector = this.sector,
        angle = sector.angle,
        azimuth = sector.azimuth,
        stepLength = sector.radius / this.gradientSteps,
        part = null,
        a, b, c, d;

      for (var i = 1; i <= this.gradientSteps; i++){

        if (!previous){
          a = this.center;
          b = Geo.endPoint(a, azimuth + angle, stepLength);
          c = Geo.endPoint(a, azimuth - angle, stepLength);
          part = this.createPolygon([a,b,c], i)
          this.first = part;
          previous = [b,c]

        } else {
          a = previous[0];
          b = previous[1];
          c = Geo.endPoint(a, azimuth + angle, stepLength);
          d = Geo.endPoint(b, azimuth - angle, stepLength);
          part = this.createPolygon([a,c,d,b], i)
          previous = [c,d]
        }
        this.parts.add(part);
      }
      this.geoObjects.add(this.parts);
      return this;
    },

    remove: function(){
      this.parts.removeAll();
    },

    createPolygon: function(points,step){
      if (this.sector.color){
        opacity = 17 - step * 15 / this.gradientSteps;
        yColor = this.sector.color + digitToLetter(opacity) + '0';

      } else {
        var color = '255,0,0,'
        var opacity = 1.2 - step / this.gradientSteps;
        var yColor = 'rgb('  + color + opacity + ')'
      }
      var poly = new ymaps.Polygon([
        points,
        []
      ],{}, {
        interactivityModel: 'default#transparent',
        fillColor: yColor,
        strokeWidth: 0,
        opacity: 0.8
      })
      return poly;
    }

  });


  function digitToLetter(d){
    if (d > 15 || d < 0){
      throw new Error('Cant convert to hex: ' + d)
    }
    switch (d){
      case 10: return 'A'
      case 11: return 'B'
      case 12: return 'C'
      case 13: return 'D'
      case 14: return 'E'
      case 15: return 'F'
      default: return d;
    }
  }



}());
