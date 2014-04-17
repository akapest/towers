/**
 * require(vendor/backbone)
 */
(function(){

  window.BaseModel = Backbone.Model.extend({

    _getName: function(){
      return this.name || this.url.replace(/s$/, '');
    },

    save: function(opts){
      opts = opts || {};
      var data = {};
      data[this._getName()] = this.toJSON()
      opts.url = '/rest/' + this.url + '?' + $.param(data);
      Backbone.Model.prototype.save.call(this, null, opts)
    },

    destroy: function(){
      Backbone.Model.prototype.destroy.call(this, {url:'/rest/' + this.url + '/' + this.id})
    },

    __validate: function(fields){
      var errors = null;
      _.each(fields, _.bind(function(field){
        var error = '';
        if (_.isString(field)){
          if (!this.get(field)) {
            error = 'Обязательное поле';
          }
        } else if (_.isObject(field)){
          var value = this.get(field.name);
          error = field.validate(value);

        } else {
          console.log(field);
          throw new Error("Unsupported obj type.")
        }
        if (error){
          this.trigger('invalid:'+field, error);
          errors = errors || {};
          errors[field] = error;
        }

      }, this));

      return errors;
    }

  });


}());
