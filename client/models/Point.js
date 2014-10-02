/**
 * require(models/BaseModel)
 */
(function(){

  var counter = parseInt(localStorage['points'] || '0');

  window.Point = window.Location.extend({

    initialize: function(){
      this.set('name', '' + counter++);
      localStorage['points'] = counter;
    },

    isTower: function(){
      return false;
    },

    is: function(type){
      return type == 'point';
    },

    validate: function(){
      return null;
    },

    save: function(){

    }

  })

}());