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
      this.model = null;
      this.freqs = options.freqs;
      this.locations = options.locations;
      this.towersGeoObjects = {};
      this.locationGeoObjects = {};
      this.showLocations = false;

      this.initMap(options);
      this.bindEvents();
    },

    initMap: function(options){
      if (map) throw new Error('MapView already created');
      map = new ymaps.Map('map', {
        center: options.center || [56.8, 60.5],
        zoom: 10,
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);
      map.events.add('click', this.onClick, this);
      map.events.add('mousemove', _.throttle(this.onHover, 50), this);
      map.controls.add('zoomControl', { left: 5, bottom: 15 })
          .add('typeSelector', {left: 150, bottom: 15}) // Список типов карты
          .add('mapTools', { left: 35, bottom: 15 }); // Стандартный набор кнопок
//    вариант сверху
//      map.controls.add('zoomControl', { right: 5, top: 35 })
//          .add('typeSelector', {right: 35, top: 65}) // Список типов карты
//          .add('mapTools', { right: 35, top: 35 }); // Стандартный набор кнопок
    },

    bindEvents: function(){
      document.addEventListener('keyup', _.bind(this.keyUpListener, this));
      Backbone.on('show:locations', _.bind(function(val){
        this.showLocations = val;
        this.showLocations ? this.drawLocations(this.locations) : this.removeLocations();
      }, this));
      this.locations.on('change:active', function(active){
        map.panTo(active.get('start'), {delay: 0});
      })
    },

    /**
     * Устанавливает объект, созданием или редактированием к-го занимается пользователь в текущий момент.
     * Может быть вышкой или локацией.
     */
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
          if (this.model.isTower()) Backbone.trigger('create:tower', this.model);
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
        end: end
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
        this.towersGeoObjects[tower.cid + '0'] = new Sector(tower.get('start'), tower.attributes, map, Geo).render();
        var attrs = _.clone(tower.attributes),
            a = attrs.azimuth;
        attrs.azimuth = a > 0 ? a - Math.PI : Math.PI + a;
        this.towersGeoObjects[tower.cid + '1'] = new Sector(tower.get('end'), attrs, map, Geo).render();
      } else {
        this.towersGeoObjects[tower.cid] = new Sector(tower.get('start'), tower.attributes, map, Geo).render();
      }
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
            fillColor: "rgb(0,0,0,0)",
            strokeColor: "#83h",
            strokeOpacity: 0.4,
            strokeWidth: 2
          }
      )
      map.geoObjects.add(circle);
      var result = new Circle(circle);
      this.locationGeoObjects[model.cid] = result;
      return result;
    },

    drawTowers: function(towers){
      var self = this;
      towers.each(function(tower){
        var freq = parseFloat(tower.get('freq'))
        var model = self.freqs.findWhere({value: freq})
        if (model){
          tower.set('color', model.get('color'))
          self.drawTower(tower);
        } else {
          console.error("Freq not found:" + freq);
        }
      })
    },

    drawLocations: function(locations){
      locations.each(_.bind(function(loc){
        this.drawLocation(loc);
      }, this));
    },

    removeAll: function(){
      this.removeLocations();
      this.removeTowers();
    },

    removeTowers: function(){
      _.forOwn(this.towersGeoObjects, function(t){
        t.remove();
      })
      this.towersGeoObjects = {};
    },

    removeLocations: function(){
      _.forOwn(this.locationGeoObjects, function(l){
        l.remove();
      })
      this.locationGeoObjects = {};
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
