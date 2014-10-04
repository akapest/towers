/**
 * require(models/Location)
 */
(function(){

  var counter = parseInt(localStorage['points'] || '0');

  window.Point = window.Location.extend({

    url: 'points',

    initialize: function(attrs){
      attrs = this.parse(attrs)
      if (attrs && !attrs.name){
        attrs.name = '' + counter
        Point.setCounter(++counter)
      }
      this.set(attrs)
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
    }

  }, {

    setCounter: function(number){
      counter = number;
      localStorage['points'] = counter;
    },

    getCounter: function(){
      return counter;
    }

  })

}());