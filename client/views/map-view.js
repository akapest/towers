/**
 * require(views/map/triangle-sector)
 * require(views/map/pretty-sector)
 */
$(function(){

  var ymaps = window.ymaps;
  var map = null;
  var angle = Math.PI / 6;

  window.MapView = Backbone.View.extend({

    initialize: function(options){
      var options = options || {};
      this.model = options.model;
      this.start = null;
      this.end = null;
      this.angle = options.angle || angle;
      var self = this;
      if (map){
        throw new Error("Map already initialized!")
      }

      map = new ymaps.Map('map', {
        center: options.center || [58, 57],
        zoom: 10,
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);

      map.events.add('click', self.onClick, self);
      map.events.add('mousemove', _.throttle(self.onHover, 50), self);

      document.addEventListener('keyup', function(e){
        if (e.keyCode == 27){
          self.onEsc();
        }
      })

      this.model.on('change:angle', function(value){
        self.angle = value.get('angle');
      })

      this.sectors = [];
    },

    reset: function(){
      this.start = null;
      this.end = null;
      if (this.sector){
        this.sector.remove();
      }
      this.sector = null;
    },

    onClick: function(e){
      var point = e.get('coords');
      if (this.start){
        this.end = point;
        var sector = this.getSector();
        this.reset();
        this.model.set(sector)

        setTimeout(_.bind(function(){
          this.trigger('create');
        }, this));
      } else {
        this.start = point;
      }
      this.trigger('click')
    },

    onHover: function(e){
      if (!this.start) return;
      var end = e.get('coords');
      if (this.end
          && Math.abs(this.end[0] - end[0]) < 0.0001
          && Math.abs(this.end[1] - end[1]) < 0.0001){
        return;
      }
      this.end = end;
      this.model.set(this.getSector())

      var newSector = this._createSector();
      newSector.render();
      if (this.sector){
        this.sector.remove();
      }
      this.sector = newSector;
    },

    onEsc: function(){
      if (this.sector){
        this.sector.remove();
        this.reset();
      }
    },

    getSector: function(){
      var sector = {
        start: this.start,
        end: this.end,
        azimuth: Geo.getAzimuth(this.start, this.end),
        radius: Geo.getDistance(this.start, this.end),
        angle: this.angle,
        color: this.model.get('color')
      }
      return sector;
    },

    _createSector: function(){
      var sector = new TriangleSector(this.model.get('start'), this.model.attributes, map, Geo);
      sector.render();
      return sector;
    },

    /*removeTower: function(cid){
      if (!cid){
        console.log('no cid!')
        return;
      }
      this.sectors[cid].remove();
    },*/

    drawTower: function(tower){
      console.log('draw tower ' + tower.get('start'))

      if (tower.is('highway')){
        this.sectors[tower.cid + '0'] = new TriangleSector(tower.get('start'), tower.attributes, map, Geo).render();
        var attrs = _.clone(tower.attributes),
            a = attrs.azimuth;
        attrs.azimuth = a > 0  ? a - Math.PI : Math.PI + a;
        this.sectors[tower.cid + '1'] = new TriangleSector(tower.get('end'), attrs, map, Geo).render();
      } else {
        this.sectors[tower.cid] = new PrettySector(tower.attributes, map, Geo).render();
      }
    },

    _createBase: function(){
      map.geoObjects.add(new ymaps.Circle([line[0], 10]));
    }

  });

});
