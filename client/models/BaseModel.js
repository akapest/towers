/**
 * require(vendor/backbone)
 */
(function(){

  window.BaseModel = Backbone.Model.extend({

    _getName: function(){
      return this.name || this.url.replace(/s$/, '');
    },

    isValid: function(){
      return !this.validate();
    },

    save: function(){
      var data = {};
      data[this._getName()] = this.toJSON()
      var url = '/rest/' + this.url + '?' + $.param(data);
      Backbone.Model.prototype.save.call(this,null, {url:url})
    },

    destroy: function(){
      Backbone.Model.prototype.destroy.call(this, {url:'/rest/' + this.url + '/' + this.id})
    }

  });


}());
