/**
 * require(vendor/backbone)
 */
(function(){

  window.Model = Backbone.Model.extend({

    save: function(){
      var url = this.url + '?' + $.param({freq:this.toJSON()});
      Backbone.Model.prototype.save.call(this,null, {url:url})
    }
  });


}());
