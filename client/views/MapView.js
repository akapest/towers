/**
 * require(models/Tower)
 * require(models/Location)
 * require(views/map/Sector)
 */
$(function(){

  var ymaps = window.ymaps;
  var map = null;

  window.MapView = Backbone.View.extend({

    initialize: function(options){
      options = options || {};
      this.model = null;
      this.freqs = options.freqs;
      this.locations = options.locations;

      if (map) throw new Error('MapView already created');

      map = new ymaps.Map('map', {
        center: options.center || [57, 58],
        zoom: 10,
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);
      map.events.add('click', this.onClick, this);
      map.events.add('mousemove', _.throttle(this.onHover, 50), this);
      document.addEventListener('keyup', _.bind(this.keyUpListener, this));
      this.towers = [];
    },

    setModel: function(model){
      this.model = model;
    },

    keyUpListener: function(e){
      if (e.keyCode == 27){ //ESC
        this.resetObjectCreation();
      }
    },

    resetObjectCreation: function(){
      if (!this.model) return;
      this.model.set({
        start: null,
        end: null
      });
      if (this.object){
        this.object.remove();
        this.object = null;
      }
    },

    onClick: function(e){
      if (!this.model) return;

      var point = e.get('coords');
      if (!this.model.get('start')){
        var start = point,
            locations = [];

        if (this.model.isTower()){
          locations = this.findLocations(start);
          if (!locations.length){
            alert('Данная точка не принаделжит ни одной локации. Сначала нужно создать локацию.')
            start = null;
          } else if (locations.length > 1){
            alert('Данная точка принаделжит нескольким локацииям. Невозможно создать объект.');
            start = null;
          }
        }
        this.model.set({start: start});

      } else {
        if (this.model.isTower()){
          locations = this.findLocations(this.model.get('start'))
          var locId = locations[0].get('id'); //перенес получение id сюда, чтобы на создание локации было чуть больше времени
          if (!locId){
            alert('Невозможно создать вышку. Не найдена соответсвующая локация. Возможно, проблемы со связью.')
          }
          this.model.set({
            locationId: locId
          });
          this.setEnd(point);
        }
        if (this.model.isValid()){
          this.trigger('create', this.model);
          this.resetObjectCreation();
        }
      }
      this.trigger('click')
    },

    onHover: function(e){
      if (!this.model) return;
      if (!this.model.get('start')) return;
      var end = e.get('coords'),
          _end = this.model.get('end');
      if (_end
          && Math.abs(_end[0] - end[0]) < 0.0001
          && Math.abs(_end[1] - end[1]) < 0.0001){
        return;
      }
      this.setEnd(end);

      var previous = this.object;

      if (this.model.isTower()){
        this.object = new Sector(this.model.get('start'), this.model.attributes, map, Geo, true);
      } else {
        this.object = this.drawLocation(this.model);
      }
      this.object.render && this.object.render();
      if (previous){
        previous.remove();
      }
    },

    setEnd: function(end){
      this.model.set({
        azimuth: Geo.getAzimuth(this.model.get('start'), end),
        radius: Geo.getDistance(this.model.get('start'), end),
        end: (this.model.isTower() && this.model.is('highway')) ? end : void 0
      });
    },

    draw: function(model){
      if (model.isTower()){
        this.drawTower(model);
      } else {
        this.drawLocation(model);
      }
    },

    drawTower: function(tower){
      console.log('draw tower ' + tower.get('start'))

      if (tower.is('highway')){
        this.towers[tower.cid + '0'] = new Sector(tower.get('start'), tower.attributes, map, Geo).render();
        var attrs = _.clone(tower.attributes),
            a = attrs.azimuth;
        attrs.azimuth = a > 0 ? a - Math.PI : Math.PI + a;
        this.towers[tower.cid + '1'] = new Sector(tower.get('end'), attrs, map, Geo).render();
      } else {
        this.towers[tower.cid] = new Sector(tower.get('start'), tower.attributes, map, Geo).render();
      }
    },

    drawTowers: function(towers){
      var self = this;
      towers.each(function(tower){
        var model = self.freqs.findWhere({value: parseFloat(tower.get('freq'))})
        tower.set('color', model.get('color'))
        self.drawTower(tower);
      })
    },

    drawLocations: function(locations){
      locations.each(_.bind(function(loc){
        this.drawLocation(loc);
      }, this));
    },

    removeAll: function(){
      _.forOwn(this.towers, function(t){
        t.remove();
      })
      this.towers = [];
    },

    drawLocation: function(model){
      var circle = new ymaps.Circle(
          [
            model.get('start'),
            model.get('radius')
          ],
          {},
          {
            interactivityModel: 'default#transparent',
            draggable: false,
            fillColor: "#DB709377",
            strokeColor: "#990066",
            strokeOpacity: 0.4,
            strokeWidth: 2
          }
      )
      map.geoObjects.add(circle);
      return new Circle(circle);
    },

    findLocations: function(start){
      var result = this.locations.filter(function(location){
        var distance = Geo.getDistance(start, location.get('start'));
        return distance <= location.get('radius');
      })
      return result;
    }

  });

  var Circle = function(data){
    this.data = data;
  }
  Circle.prototype.remove = function(){
    map.geoObjects.remove(this.data);
  }

});
