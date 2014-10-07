/**
 * require(views/map/Geo)
 */
(function(){

  window.Sector = function(center, towerAttrs, map, geo, opts){
    this.raw = opts && opts.raw;
    this.center = center;
    this.sector = this.attrs = towerAttrs;
    var angle = parseAngle(this.sector.angle);
    this.angle = angle.rad;
    console.log(angle.deg)
    this.angleSteps = getSteps(this.sector.type, angle.deg, this.raw);
    this.gradientSteps = this.sector.type == 'highway' ? 1 : 5;
    this.geo = geo;
    this.map = map;
    this.geoObjects = map.geoObjects;
    this.text = this.sector.name + '<br>' + (this.sector.comment ? " " + this.sector.comment : '');
    this.parts = new ymaps.GeoObjectCollection({}, {
      draggable: false,
      interactivityModel: 'default#transparent'
    });
    this.parts.events.add(['click'], function(e){
        this.openBalloon();
    }, this)
    this.base = null;
    function getSteps(type, angle, raw){
      if (type == 'highway'){
        return 1;
      } else {
        return raw ? 1 : angle / 30
      }
    }
  }

  $.extend(Sector.prototype, {

    render: function(){
      if (Math.PI - this.angle < 0.01){
        this.renderCircleTower();
      } else {
        this.renderSector();
      }
      if (!this.raw){
        this.renderBase();
      }
      return this;
    },

    openBalloon: function(){
      if (this.base) this.base.balloon.open();
    },

    renderCircleTower: function(){
      var lengthStep = this.getLengthSteps();
      var opacity = 5;
      var yColor = this.sector.color + digitToLetter(opacity) + '0';

      for (var i = 1; i <= this.gradientSteps; i++){
        var radius = lengthStep * i;
        var circle = new ymaps.Circle(
            [this.center, radius],
            {}, {
              interactivityModel: 'default#transparent',
              fillColor: yColor,
              strokeColor: yColor,
              strokeWidth: 0,
              opacity: 0.8
            });
        this.parts.add(circle);
      }
      this.geoObjects.add(this.parts);
    },

    renderSector: function(){
      var previous = null,//triangle
          sector = this.sector,
          azimuth = sector.azimuth,
          startAzimuth = azimuth - this.angle,
          angleStep = this.angle / this.angleSteps,
          lengthStep = this.getLengthSteps(),

          part = null,
          a, b, c, d;

      for (var j = 0; j < this.angleSteps * 2; j++){

        previous = null;
        azimuth = startAzimuth + j * angleStep;

        for (var i = 1; i <= this.gradientSteps; i++){
          if (!previous){
            a = this.center;
            b = Geo.endPoint(a, azimuth, lengthStep);
            c = Geo.endPoint(a, azimuth + angleStep, lengthStep);
            part = this.createPolygon([a, b, c], i)
            this.first = part;
            previous = [b, c]

          } else {
            a = previous[0];
            b = previous[1];
            c = Geo.endPoint(a, azimuth, lengthStep);
            d = Geo.endPoint(b, azimuth + angleStep, lengthStep);
            part = this.createPolygon([a, c, d, b], i)
            previous = [c, d]
          }
          this.parts.add(part);
        }
      }
      this.geoObjects.add(this.parts);
    },

    getLengthSteps: function(){
      return this.sector.radius / this.gradientSteps;
    },

    remove: function(){
      this.parts.removeAll();
      if (this.base){
        this.geoObjects.remove(this.base)
      }
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
      var circle = new ymaps.Circle([this.center, 1], {
        balloonContentBody:this.text
      }, {
        fill:false,
        strokeWidth:0
      });
      this.setBase(circle);
    },

    setBase: function(circle){
      this.base = circle;
      this.geoObjects.add(circle);
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


  var parseAngle = function(str){
    var anglePattern = /(\d+)([^\d]*)/;
    if (!str || !_.isString(str)){
      throw new Error('Invalid angle')
    }
    function convert(value, unit){
      switch (unit){
        case "°":
          return value * Math.PI / 360
        case "'":
          return limit(value * Math.PI / 360 / 60)
        case '':
          return limit(value * Math.PI / 360 / 3600)
      }
      throw new Error("Unit not found - " + unit)
    }
    function convertToDegrees(value, unit){
      if (unit == '°'){
        return value;
      } else {
        return null;
      }
    }

    var result = {};
    str.replace(anglePattern, function(m, value, unit){
      result = {
        rad: convert(value, unit),
        deg: convertToDegrees(value, unit)
      };
    })
    return result;
  }

  var limit = function(angle){
    if (angle < 0.003) return 0.003;
    else return angle;
  }


}());
