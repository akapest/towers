/**
 * require(models/BaseModel)
 */
(function(){

  window.createCollection = function(url, model, options, models){
    models = models || getBootstrapData(url);
    var collection = new (Backbone.Collection.extend({
      url: 'rest/' + url,
      model: model
    }))(models, options)
    collection.fields = (new model()).fields;
    return collection;

    function getBootstrapData(name){
      try {
        return JSON.parse($('.data-holder.' + name).html())
      } catch (e){
        return [];
      }
    }
  }

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
    },

    is: function(type){
      return type == 'location';
    },

    isTower: function(){
      return false;
    },

    _toJSON: function(){
      var result = _.clone(this.attributes);
      result.start = arrayToPoint(result.start);
      if (result.end && this.is && this.is('highway')){
        result.end = arrayToPoint(result.end);
      } else {
        delete result.end;
      }
      delete result._towers;
      delete result.towers;
      return result;
    },

    parse: function(attrs){
      if (attrs.start){
        attrs.start = pointToArray(attrs.start)
      }
      if (attrs.end){
        attrs.end = pointToArray(attrs.end)
        attrs.type = attrs.type || 'highway';
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
      return this.__validate([
        'name', //required
        {
          name: 'name',
          validate: function(name){
            var loc = state.get('locations').find(function(el){
              return el.get('name') == name;
            });
            if (loc) return 'Не уникальное название';
          }
        }
      ])
    },

    getTowers: function(){
      if (!this.get('_towers')){
        var towers = createCollection('towers', Tower, {}, this.get('towers'));
        this.set({_towers:towers});
      } else {
        towers = this.get('_towers');
      }
      return towers;
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
