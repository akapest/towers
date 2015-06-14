var BaseModel = require('models/BaseModel');

module.exports = (function(){

  return BaseModel.extend({

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
