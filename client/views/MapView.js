/**
 * require(views/map/Sector)
 */
$(function(){

  var ymaps = window.ymaps;
  var map = null;
  var angle = Math.PI / 6;

  window.MapView = Backbone.View.extend({

    initialize: function(options){
      options = options || {};
      this.model = options.model;
      this.model.set({start: null, end: null});
      this.model.on('change:end', this.updateObjectData, this)
      this.freqs = options.freqs;
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

    keyUpListener: function(e){
      if (e.keyCode == 27){ //ESC
        this.resetObjectCreation();
      }
    },

    resetObjectCreation: function(){
      this.model.set({
        start: null,
        end: null
      });
      if (this.object){
        this.object.remove();
      }
      this.object = null;
    },

    onClick: function(e){
      var point = e.get('coords');
      if (!this.model.get('start')){
        this.model.set({start: point});

      } else {
        this.model.set({end: point});
        this.trigger('create');
        this.resetObjectCreation();
      }
      this.trigger('click')
    },

    onHover: function(e){
      if (!this.model.get('start')) return;
      var end = e.get('coords'),
          _end = this.model.get('end');
      if (_end
          && Math.abs(_end[0] - end[0]) < 0.0001
          && Math.abs(_end[1] - end[1]) < 0.0001){
        return;
      }
      this.model.set({end: end});
      var previous = this.object;

      if (this.model.get('type') != 'location'){
        this.object = new Sector(this.model.get('start'), this.model.attributes, map, Geo, true);
      } else {
        this.object = this._createCircle(this.model);
      }
      this.object.render && this.object.render();
      if (previous){
        previous.remove();
      }
    },

    updateObjectData: function(){
      this.model.set({
        azimuth: Geo.getAzimuth(this.model.get('start'), this.model.get('end')),
        radius: Geo.getDistance(this.model.get('start'), this.model.get('end'))
      });
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
        this._createCircle(loc);
      }, this));
    },

    removeAll: function(){
      _.forOwn(this.towers, function(t){
        t.remove();
      })
      this.towers = [];
    },

    _createCircle: function(model){
      var circle = new ymaps.Circle(
          [
            model.get('start'),
            model.get('radius')
          ],
          {},
          {
            interactivityModel: 'default#transparent',
            draggable:false,
            fillColor: "#DB709377",
            strokeColor: "#990066",
            strokeOpacity: 0.8,
            strokeWidth: 5
          }
      )
      map.geoObjects.add(circle);
      return new Circle(circle);
    }

  });

  var Circle = function(data){
    this.data = data;
  }
  Circle.prototype.remove = function(){
    map.geoObjects.remove(this.data);
  }

});
