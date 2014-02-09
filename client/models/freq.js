/**
 * require(vendor/backbone)
 */
(function(){

  window.Freq = Backbone.Model.extend({
    url:'freq',
    fields:[
      'value',
      'color',
      'type'],
    initialize: function(){
    },
    save: function(){
      var url = this.url + $.param({freq:this.toJSON()});
      Backbone.Model.prototype.save.call(this,null, {url:url})
    }
  });


}());
