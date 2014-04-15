/**
 * require(models/BaseModel)
 */
(function(){

  window.Location = BaseModel.extend({

    url: 'locations',
    fields: [
      {
        name: 'name',
        label: 'Название'
      },
      {
        name: 'comment',
        label: 'Комментарий'
      },
      {
        name: 'color',
        label: 'Цвет'
      }
    ],

    initialize: function(state){
      if (!state)
        return;
      var attrs = _.clone(state.attributes);
      attrs.center = attrs.start;
      delete attrs.start;
      delete attrs.type;
      delete attrs.end;
      delete attrs.azimuth;
      delete attrs.freq;
      if (state.cid){

        this.attributes = attrs;
      } else {
        attrs = state;
        this.set(attrs)
      }
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

}());
