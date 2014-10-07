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
    },

    is: function(type){
      return type == 'location';
    },

    isTower: function(){
      return this.is('tower');
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
      if (!attrs) return
      if (attrs.start){
        attrs.start = pointToArray(attrs.start)
      }
      if (attrs.end){
        attrs.end = pointToArray(attrs.end)
        attrs.type = attrs.type || 'highway';
      }
      if (attrs.comment){
        attrs.comment = attrs.comment.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
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
      var id = this.id
      return this.__validate([
        'name', //required
        {
          name: 'name',
          validate: function(name){
            var loc = state.get('locations').find(function(el){
              return el.get('name') == name && el.id != id;
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
    },

    getPoints: function(){
      var id = this.get('id');
      var arr = state.get('points').filter(function(el){
        return el.get('locationId') == id
      })
      return _(arr)
    },

    getName: function(){
      return this.get('name') || 'Новая локация'
    }

  });

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
