/**
 * require()
 */
$(function(){

  var ymaps = window.ymaps;
  var map = null;
  var angle = Math.PI / 6;

  window.MapView = function(options){
    var options = options || {};
    this.start = null;
    this.end = null;
    this.angle = options.angle || angle;
    var self = this;

    ymaps.ready(function(){
      map = new ymaps.Map('map', {
        center: options.center || [58, 57],
        zoom: 10,
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);

      map.events.add('click', self.onClick, self);
      map.events.add('mousemove', _.throttle(self.onHover, 100), self);

      document.addEventListener('keyup', function(e){
        if (e.keyCode == 27){
          self.onEsc();
        }
      })
    });
  }

  $.extend(MapView.prototype, {

    setAngle: function(angle){
      this.angle = angle;
    },

    reset: function(){
      this.start = null;
      this.end = null;
      this.sector = null;
    },

    onClick: function(e){
      var point = e.get('coords');
      if (this.start){
        this.end = point;
        this.trigger('create:sector', this.getSector());
        this.sector.remove();
        this.reset();
      } else {
        this.start = point;
      }
    },

    onHover: function(e){
      if (!this.start) return;
      this.end = e.get('coords');

      var newSector = this._createSector(this.getSector());
      newSector.draw();
      if (this.sector){
        this.sector.remove();
      }
      this.sector = newSector;//чтобы не мигал
    },

    onEsc: function(){
      if (this.sector){
        this.sector.remove();
        this.reset();
      }
    },

    getSector: function(){
      var sector = {
        center: this.start,
        azimuth: Geo.getAzimuth(this.start, this.end),
        radius: Geo.getDistance(this.start, this.end),
        angle: this.angle
      }
      return sector;
    },

    _createSector: function(sector){
      return new TriangleSector(sector, map, Geo);
    },

    removeTower: function(cid){

    },

    drawTower: function(){
      //get color
      //draw sector
      //draw tower label
      //register tower
    },
    
    _createBase: function(){
      map.geoObjects.add(new ymaps.Circle([line[0], 10]));
    }

  });

  $.extend(MapView.prototype, Backbone.Events);



});
