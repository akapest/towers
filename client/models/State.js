
module.exports = (function(){

  return State = Backbone.Model.extend({

    fields:[
      'locations',
      'location',
      'tower',
      'freqs',
      'editModel'
    ],

    initialize: function(){
      this.on('change:editModel', _.bind(function(state, model){
        if (model){
          this.previous = model;
        }
      }, this))
    },

    getPreviousEditModel : function(){
      return this.previous;
    }

//    ,trigger: function(event){
//      console.log(event)
//      Backbone.Model.prototype.trigger.apply(this, arguments)
//    }

  })


}());
