/**
 * require(lib/backbone)
 */
(function(){

  function pointToArray(point){
    if (!point) return null;
    return [point.latitude, point.longitude]
  }
  function arrayToPoint(array){
    if (!array) return {latitude:null,longitude:null}
    return {
      latitude: array[0],
      longitude: array[1]
    }
  }

  window.Tower = Backbone.Model.extend({
    url:'towers',
    fields:['angle',
            'name',
            'freq',
            'comment'],
    fields2:['start',
             'radius',
             'azimuth',
             'end'],
    initialize: function(state){
      if (!state)
        return;
      if (state.cid){
        var attrs = _.clone(state.attributes);
        if (attrs.type == 'tower'){
          attrs.end = null;
        }
        this.attributes = attrs;
      } else {
        attrs = state;
        this.set(attrs)
      }
    },
    save: function(){
      var url = 'towers?' + $.param({tower:this.toJSON()});
      Backbone.Model.prototype.save.call(this,null, {url:url})
    },
    toJSON: function(){
      var result = _.clone(this.attributes);
      result.start = arrayToPoint(result.start);
      if (result.end){
        result.end = arrayToPoint(result.end);
      }
      return result;
    },
    parse: function(tower){
      tower.start = pointToArray(tower.start)
      if (tower.end){
        tower.end = pointToArray(tower.end)
      }
      return tower;
    },
    is: function(type){
      switch (type){
        case 'tower': return this.get('end') == null;
        case 'highway': return this.get('end') != null;
      }
      throw new Error("Cant find object type!")
    },
    validate: function(){
      return !!this.get('freq')
    },
    ensurePointsFormat:function(){
      var self = this;
      _.each(['start', 'end'], function(prop){
        var value = self.get(prop)
        if (!_.isArray(value)){
          self.set(prop, pointToArray(value))
        }
      })
    }
  })

}());
