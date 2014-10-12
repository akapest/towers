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
      this.pointsGeoObjects = {};
      this.initMap();
      this.bindEvents();
    },

    initMap: function(){
      if (map) map.destroy();
      var center = state.get('location') ? state.get('location').get('start') : null;
      map = new ymaps.Map('map', {
        center: center || [56.8, 60.7],
        zoom: 10,
        controls: ['searchControl', 'typeSelector',  'fullscreenControl', 'rulerControl'],
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);
      map.events.add('click', this.onClick, this);
      map.events.add('mousemove', _.throttle(this.onHover, 50), this);
      map.controls.add('zoomControl', { left: 5, bottom: 15 })
//      map.controls.add('typeSelector', {left: 150, bottom: 15}) // Список типов карты
//      map.controls.add('mapTools', { left: 35, bottom: 15 }); // Стандартный набор кнопок
//    вариант контролов сверху
//      map.controls.add('zoomControl', { right: 5, top: 35 })
//          .add('typeSelector', {right: 35, top: 65}) // Список типов карты
//          .add('mapTools', { right: 35, top: 35 }); // Стандартный набор кнопок   ]
      this.drawLocations()
    },

    bindEvents: function(){
      document.addEventListener('keyup', _.bind(this.keyUpListener, this));

      Backbone.on('update:location', _.bind(function(model){
        this.removeLocation(model)
        this.drawLocation(model)
      }, this));

      state.get("locations").on('remove', _.bind(function(model){
        this.removeLocation(model);
      }, this))

      var duration = 300;

      this.listenTo(state, 'click:object', function(object){
        if (object && object.get('start')){
          map.panTo(object.get('start'),{delay:0, duration:duration});
          setTimeout(_.bind(function(){
            if (object.isTower() && this.getTower(object.cid)){
              this.getTower(object.cid).openBalloon();
            } else if (object.is('point')){
              this.showPointHint(object)
            }
          }, this), duration + 50)
        }
      }, this)

      this.listenTo(state, 'change:location', function(){
        var active = state.get('location')
        if (!active) return;
        this.removeTowers();
        this.removePoints();
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
            self.drawPoints();
          }, duration + 50)
        })
      }, this)

      this.listenTo(state, 'change:showLocations', function(state,  val){
       this.drawLocations()
      }, this);

      this.listenTo(state, 'change:showPoints', function(){
        this.drawPoints();
      }, this)

      this.listenTo(state.get('points'), 'destroy', function(model){
        var object = this.pointsGeoObjects[model.cid];
        if (object) object.remove();
      }, this)

      this.listenTo(state, 'redraw:point', function(model){
        var object = this.pointsGeoObjects[model.cid];
        if (object) object.remove();
        this.drawPoint(model)
      }, this)
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
            alert('Данная точка не принадлежит текущей локации.')
            start = null;
          }
        }
        model.set({start: start});
        if (model.is('point')){
          model.setName()
          model.save({validate: false});
          this.draw(model)
          state.get('points').add(model);
          state.set('editModel', null)
        }

      } else {
        if (model.isTower()){
          this.setEnd(point);
        }
        if (model.isValid()){
          model.trigger('beforeSave')
          model.save({validate: false});
          this.draw(model)
          if (model.isTower()){
            state.get('location').getTowers().add(model);

          } else if (model.is('location')){
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
        this.object = new Sector(this.model.get('start'), this.model.attributes, map, Geo, {raw:true});
      } else if (this.model.is('location')){
        this.object = this.drawLocation(this.model);
      } else {
        this.object = this.drawPoint(this.model, {edit: true});
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
        if (!model._isNew()){ //если правка уже существующей вышки
          this.removeTower(model);
        }
        this.drawTower(model);

      } else if (model.is('location')){
        this.drawLocation(model);

      } else {
        this.drawPoint(model);
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
      var arr = this.locationGeoObjects[model.cid];
      arr && _.each(arr, function(el){
        el.remove()
      });
    },

    getTower: function(cid){
      return this.towersGeoObjects[cid];
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

    createCircle: function(model, options){
      var circle = new ymaps.Circle(
        [
          model.get('start'),
          model.get('radius')
        ],
        {},
        _.extend({
          interactivityModel: 'default#transparent',
          draggable: false
        }, options)
      );
      map.geoObjects.add(circle);
      var result = new Circle(circle);
      return result;
    },

    drawLocation: function(model){

      var result = this.createCircle(model, {
        fillColor: "rgb(0,0,0,0)",
        strokeColor: "#83h",
        strokeOpacity: 0.4,
        strokeWidth: 2
      });
      this.locationGeoObjects[model.cid] = this.locationGeoObjects[model.cid] || [];
      this.locationGeoObjects[model.cid].push(result)
      return result;
    },

    drawPoints: function(){
      var value = state.get('showPoints'),
          self = this;
      if (value){
        var points = state.get('location').getPoints()
        points.each(function(point){
          self.drawPoint(point)
        });
      } else {
        this.removePoints()
      }
    },

    drawPoint: function(model, opts){
      opts = opts || {}
      var tower = model.getTower();
      var result = this.createCircle(model, {
        fillColor: tower.getColor(),
        strokeColor: tower.getColor(),
        strokeOpacity: 0.4,
        zIndex: 99999,
        opacity: model.is('point') ? 0.8 : 1
      });
      this.pointsGeoObjects[model.cid] = result

      if (!opts.edit){
        result.data.modelCid = model.cid
        result.data.events.add('mouseenter', _.bind(function (e) {
          var cid = e.get('target').modelCid;
          var point = state.get('points').get(cid)
          this.showPointHint(point)
        }, this))
        .add('mouseleave', function (e) {
            map.hint.close()
        });
      }
      return result;
    },

    showPointHint: function(point){
      map.hint.open(point.get('start'), point.getTower().get('name') + ' - ' + point.get('name'));
    },

    drawTowers: function(towers){
      towers.each(_.bind(function(tower){
        var freq = tower.getFreq_();
        if (freq.shouldShow()){
          tower.set('color', freq.get('color'));
          this.drawTower(tower);
        }
      }, this));
    },

    redrawTowers: function(towers){
      towers.each(_.bind(function(tower){
        this.removeTower(tower)
        if (tower.getFreq_().shouldShow()){
          tower.updateColor()
          this.drawTower(tower)
        }
      }, this))
    },

    isShown: function(tower){
      return this.towersGeoObjects[tower.cid] || this.towersGeoObjects[tower.cid + '0']
    },

    drawLocations: function(){
      var show = state.get('showLocations')
      this.removeLocations();
      if (show){
        state.get('locations').each(_.bind(function(loc){
          this.drawLocation(loc);
        }, this));
      }
    },

    removeAll: function(){
      this.removeLocations();
      this.removeTowers();
      this.removePoints();
    },

    removeTowers: function(){
      _.forOwn(this.towersGeoObjects, function(t){
        t.remove();
      });
      this.towersGeoObjects = {};
    },

    removeLocations: function(){
      _.each(this.locationGeoObjects, _.bind(function(arr){
        _.each(arr, function(el){
          el.remove()
        });
      }, this));
      this.locationGeoObjects = {};
    },

    removePoints: function(){
      _.each(this.pointsGeoObjects, function(point){
        point.remove();
      });
      this.pointsGeoObjects = {};
    }

  });

  var Circle = function(data){
    this.data = data;
  }
  Circle.prototype.remove = function(){
    map.geoObjects.remove(this.data);
  }

});
