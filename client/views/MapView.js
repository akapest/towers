/**
 * require(models/Tower)
 * require(models/Location)
 * require(views/map/Sector)
 */
$(function(){

  var ymaps = window.ymaps;
  var map = null;

  window.MapView = Backbone.View.extend({

    initialize: function(){
      this.model = null;
      this.towersGeoObjects = {};
      this.locationGeoObjects = {};
      this.showLocations = false;
      this.initMap();
      this.bindEvents();
    },

    initMap: function(){
      if (map) map.destroy();
      var center = state.get('location') ? state.get('location').get('start') : null;
      map = new ymaps.Map('map', {
        center: center || [56.8, 60.5],
        zoom: 10,
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);
      map.events.add('click', this.onClick, this);
      map.events.add('mousemove', _.throttle(this.onHover, 50), this);
      map.controls.add('zoomControl', { left: 5, bottom: 15 })
          .add('typeSelector', {left: 150, bottom: 15}) // Список типов карты
          .add('mapTools', { left: 35, bottom: 15 }); // Стандартный набор кнопок
//    вариант контролов сверху
//      map.controls.add('zoomControl', { right: 5, top: 35 })
//          .add('typeSelector', {right: 35, top: 65}) // Список типов карты
//          .add('mapTools', { right: 35, top: 35 }); // Стандартный набор кнопок
    },

    bindEvents: function(){
      document.addEventListener('keyup', _.bind(this.keyUpListener, this));

      Backbone.on('show:locations', _.bind(function(val){
        this.showLocations = val;
        setTimeout(_.bind(function(){
          this.showLocations ? this.drawLocations(state.get('locations')) : this.removeLocations();
        }, this))
      }, this));

      state.get("locations").on('remove', _.bind(function(model){
        this.removeLocation(model);
      }, this))

      var duration = 500;

      state.on('click:object', function(object){
        if (object && object.get('start')){
          map.panTo(object.get('start'),{delay:0, duration:duration})
        }
      })

      state.on('change:location', _.bind(function(){
        var active = state.get('location')
        if (!active) return;
        this.removeTowers();
        this.destroyCurrentObject(); //if any

        if (active.isNew()) return;

        var self = this;
        setTimeout(function(){
          active.getTowers().on('destroy', function(m){
            var object = self.towersGeoObjects[m.cid];
            if (object) object.remove();
          })
          setTimeout(function(){
            self.drawTowers(active.getTowers());
          }, duration + 50)
        })
      }, this))
    },

    /**
     * Устанавливает объект, созданием или редактированием к-го занимается пользователь в текущий момент.
     * Может быть вышкой или локацией.
     */
    setModel: function(model){
      this.model = model;
      this.destroyCurrentObject(); //if any
    },

    keyUpListener: function(e){
      if (e.keyCode == 27){ //ESC
        if (this.model){
          this.model.set({
            start: null,
            end: null
          });
        }
        this.destroyCurrentObject();
      }
    },

    destroyCurrentObject: function(){
      if (this.object){
        this.object.remove();
        this.object = null;
      }
    },

    fitsToLocation: function(start){
      var location = state.get('location');
      var distance = Geo.getDistance(start, location.get('start'));
      return distance <= location.get('radius');
    },

    onClick: function(e){
      if (!this.model) return;
      var model = this.model;
      var point = e.get('coords');
      if (!model.get('start')){
        var start = point;
        if (model.isTower()){
          if (!this.fitsToLocation(start)){
            alert('Данная точка не принадлежит текщей локации.')
            start = null;
          }
        }
        model.set({start: start});

      } else {
        if (model.isTower()){
          model.set({
            locationId: state.get('location').get('id')
          });
          this.setEnd(point);
        }
        if (model.isValid()){

          model.save({validate: false});
          this.draw(model)
          if (model.isTower()){
            state.get('location').getTowers().add(model);

          } else {
            state.set('location', model)
            state.get('locations').add(model);
          }
          state.set('editModel', null)
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
      var radius = Geo.getDistance(this.model.get('start'), end);
      if (this.model.is('tower')){
        radius = Math.min(radius, 15000);
      }
      this.model.set({
        azimuth: Geo.getAzimuth(this.model.get('start'), end),
        radius: radius,
        end: end
      });
    },

    draw: function(model){
      if (model.isTower()){
        if (!model.isNew()){ //если правка уже существующей вышки
          this.removeTower(model);
        }
        this.drawTower(model);
      } else {
        this.drawLocation(model);
      }
    },

    removeTower: function(model){
      if (model.isHighway()){
        this.removeTowerObj(model.cid + '0');
        this.removeTowerObj(model.cid + '1');
      } else {
        this.removeTowerObj(model.cid);
      }
    },

    removeTowerObj: function(id){
      var object = this.towersGeoObjects[id];
      object && object.remove();
    },

    removeLocation: function(model){
      var object = this.locationGeoObjects[model.cid];
      object && object.remove();
    },

    drawTower: function(tower){
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
      //this.removeTowers();
      towers.each(_.bind(function(tower){
        var freq = parseFloat(tower.get('freq'))
        var model = state.get('freqs').findWhere({value: freq})
        if (model){
          tower.set('color', model.get('color'))
          //setTimeout(_.bind(function(){
            this.drawTower(tower);
          //}, this))
        } else {
          console.error("Freq not found:" + freq);
        }
      },this));
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
    }

  });

  var Circle = function(data){
    this.data = data;
  }
  Circle.prototype.remove = function(){
    map.geoObjects.remove(this.data);
  }

});
