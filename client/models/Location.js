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

    initialize: function(attrs, opts){
      if (attrs){
        attrs = this.parse(attrs);
        this.set(attrs);
      }
      if (opts){
        this.locations = opts.locations;
      }
    },

    isTower: function(){
      return false;
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
    },

    validate: function(){
      var self = this;
      return this.__validate([
        'name', //required
        {
          name: 'name',
          validate: function(name){
            var loc = self.locations.find(function(el){
              return el.get('name') == name;
            });
            if (loc) return 'Не уникальное название';
          }
        }

      ])
    }

  })

  function pointToArray(point){
    if (!point) return null;
    if (_.isArray(point)) return point;
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
