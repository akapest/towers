/**
 * require(models/Location)
 */
(function(){

  var name = ''

  window.Point = window.Location.extend({

    url: 'points',

    initialize: function(attrs){
      attrs = this.parse(attrs || {})
      this.set(attrs)
      this.set({radius: Point.radius})
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

  window.Point.radius = 12;

}());