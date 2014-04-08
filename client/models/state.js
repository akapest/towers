/**
 * require(vendor/backbone)
 * require(models/freq)
 */
(function(){

  window.State = Backbone.Model.extend({
    fields:['type',
      'angle',
      { name:'freq', type:'float' },
      'color',
      'comment',
      'name'],

    initialize: function(){
      this.set("type", 'tower')
      this.reset();
    },

    reset: function(){
      this.set({
        name:'',
        freq:'',
        comment:''
      })
    }
  })

}());
