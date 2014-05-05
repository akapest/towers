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
      data[this._getName()] = this._toJSON ? this._toJSON () : this.toJSON();
      opts.url = '/rest/' + this.url + '?' + $.param(data);
      Backbone.Model.prototype.save.call(this, null, opts)
      this.changed = {};
      this.markToRevert();
    },

    set: function(){
      return Backbone.Model.prototype.set.apply(this,arguments);
    },

    markToRevert: function(){
      this.restoreAttributes = _.clone(this.attributes);
    },

    revert: function(){
      if (this.restoreAttributes){
        this.set(this.restoreAttributes, {silent:true});
      }
    },

    //get view presentation of attribute
    getV: function(attr){
      return this.get(attr); //by default
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
          var event = 'invalid:'+ (field.name || field);
          console.log('trigger ' + event)
          this.trigger(event, error);
          errors = errors || {};
          errors[field] = error;
        }

      }, this));

      return errors;
    }

  });


}());
