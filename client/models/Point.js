var GeoObject = require('models/Location');

module.exports = (function(){

  var name = '',
      pointRadius = 12;

  return GeoObject.extend({

    url: 'points',

    initialize: function(attrs){
      attrs = this.parse(attrs || {})
      this.set(attrs)
      this.set({radius: pointRadius})
    },

    getTower: function(){
      var location = state.get('locations').get(this.get('locationId'))
      return location.getTowers().get(this.get("towerId"))
    },

    is: function(type){
      return type == 'point';
    },

    validate: function(){
      return null;
    },

    setName: function(){
      this.set({name: name || 'без имени'})
    }

  }, {
    setName: function(value){
      name = value
    }
  })

}());