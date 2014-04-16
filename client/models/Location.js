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
      }
    ],

    initialize: function(state){
      if (!state)
        return;
      var attrs = state.attributes || state;
      delete attrs.type;
      delete attrs.end;
      delete attrs.azimuth;
      delete attrs.freq;

      if (!state.cid){
        attrs = this.parse(attrs);
      }
      this.attributes = _.clone(attrs);
    },

    toJSON: function(){
      var result = _.clone(this.attributes);
      result.start = arrayToPoint(result.start);
      if (result.end){
        result.end = arrayToPoint(result.end);
      }
      return result;
    },

    parse: function(attrs){
      if (attrs.start){
        attrs.start = pointToArray(attrs.start)
      }
      if (attrs.end){
        attrs.end = pointToArray(attrs.end)
      }
      return attrs;
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
