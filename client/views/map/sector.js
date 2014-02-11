/**
 * require(views/map/geo)
 */
(function(){

  window.Sector = function(center, towerAttrs, map, geo, raw){
    this.parts =  new ymaps.GeoObjectCollection({}, {
      draggable: false
    });
    this.raw = raw;
    this.center = center;
    this.sector = this.attrs = towerAttrs;
    this.angleSteps = this.sector.type == 'highway' || raw ?  0.5 : Math.floor(this.sector.angle * 10);
    this.gradientSteps = this.sector.type == 'highway'? 1 : 5;
    this.geo = geo;
    this.map = map;
    this.geoObjects = map.geoObjects;
  }

  $.extend(Sector.prototype, {

    render: function(){
      var previous = null,//triangle
        sector = this.sector,
        azimuth = sector.azimuth,
        startAzimuth = azimuth - sector.angle,
        angleStep = sector.angle / this.angleSteps,
        lengthStep = sector.radius / this.gradientSteps,

        part = null,
        a, b, c, d;

      for (var j = 0; j < this.angleSteps * 2 ; j++){

        previous = null;
        azimuth = startAzimuth + j * angleStep;

        for (var i = 1; i <= this.gradientSteps; i++){
          if (!previous){
            a = this.center;
            b = Geo.endPoint(a, azimuth, lengthStep);
            c = Geo.endPoint(a, azimuth + angleStep, lengthStep);
            part = this.createPolygon([a,b,c], i)
            this.first = part;
            previous = [b,c]

          } else {
            a = previous[0];
            b = previous[1];
            c = Geo.endPoint(a, azimuth, lengthStep);
            d = Geo.endPoint(b, azimuth + angleStep, lengthStep);
            part = this.createPolygon([a,c,d,b], i)
            previous = [c,d]
          }
          this.parts.add(part);
        }
      }
      this.geoObjects.add(this.parts);
      if (!this.raw){
        this.renderBase();
      }
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
        strokeColor: yColor,
        strokeWidth: 0,
        opacity: 0.8
      })
      return poly;
    },

    renderBase: function(){
      var circle = new ymaps.Circle([this.center, 20], {}, {
        fill:false,
        strokeWidth:0
      });
      this.geoObjects.add(circle);
      var rectangle = new ymaps.Rectangle(circle.geometry.getBounds(), {
        balloonContent:this.attrs.name + '<br/>' + this.attrs.comment
      }, {
        fillColor: this.sector.color || '#fff',
        coordRendering: "boundsPath",
        strokeWidth: 0
      });
      this.geoObjects.add(rectangle);
      rectangle.balloon.open();
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
