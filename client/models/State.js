/**
 * require(vendor/backbone)
 */
(function(){

  window.State = Backbone.Model.extend({

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

  })


}());
