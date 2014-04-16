/**
 * require(vendor/backbone)
 */
(function(){

  window.FieldView = Backbone.View.extend({

    initialize: function(opts){
      _.bindAll(this)
      var $input = this.$input = opts.$el;
      var field = this.field = _.isString(opts.field) ? opts.field : opts.field.name;
      var model = this.model = opts.model;
      if (!field)
        console.warn('Creating FieldView for "null" field');
      if (!$input.length)
        console.warn("No input found for field `" + field + "`");
      if (!model)
        console.warn('No model defined for field ' + field);
      this.bindField();
    },

    bindField: function(){
      this.isChanging = false;
      this.$input.on(this.getPropertyToListenTo(), this.inputChangeListener)
      this.model.on('change:' + this.field, this.modelChangeListener)
    },

    inputChangeListener: function(){
      this.isChanging = true;
      var value = this.getRawValue();
      if (this.isValid(value)){
        this.model.set(this.field, this.parseValue(value))
      } else {
        this.setValue(this.model.get(this.field)) //revert back to previous value
      }
      this.isChanging = false
    },

    modelChangeListener: function(){
      if (!this.isChanging){
        this.setValue(this.model.get(this.field))
      } else {
        // already changing - so do nothing
      }
    },

    remove: function(){
      this.$input.off(this.getPropertyToListenTo(), this.inputChangeListener)
      this.model.off('change:' + this.field, this.modelChangeListener)
    },

    getRawValue: function(){
      var $input = this.$input;
      var type = $input.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'select-one':
        case 'color':
          return $input.val();
        case 'checkbox':
          return $input.is(':checked');
        default:
          throw new Error("Cant get value of `" + $input.selector + '`')
      }
    },

    getValue: function(){
      return this.parseValue(this.getRawValue());
    },


    getPropertyToListenTo: function(){
      var $input = this.$input;
      switch ($input.prop('type')){
        case 'text':
        case 'textarea':
          return 'keyup';
        case 'select-one':
        case 'color':
        case 'checkbox':
          return 'change';
      }
      console.warn('Cant bind to field `' + this.field + '`');
      return null;
    },

    parseValue: function(value){
      var expectedMethodName = 'parse' + this.field[0].toUpperCase() + this.field.substring(1);
      var prop = this.model[expectedMethodName]
      if (prop){
        if (_.isFunction(prop)){
          console.log('calling "' + expectedMethodName + '" on ' + this.toString())
          return prop.call(this, value)
        } else {
          console.log('property "' + expectedMethodName + '" registered, but is not a function');
        }
      }
      return value;
    },

    prepareValue: function(value){
      var expectedMethodName = 'prepare' + this.field[0].toUpperCase() + this.field.substring(1);
      var prop = this.model[expectedMethodName]
      if (prop){
        if (_.isFunction(prop)){
          console.log('calling "' + expectedMethodName + '" on ' + this.toString())
          return prop.call(this, value)
        } else {
          console.log('property "' + expectedMethodName + '" registered, but is not a function');
        }
      }
      return value;
    },

    setValue: function(v){
      var value = this.prepareValue(v),
          type = this.$input.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'color':
        case 'select-one':
          this.$input.val(value);
          break;
        case 'checkbox':
          this.$input.prop('checked', value);
          break;
        default:
          throw new Error("Cant set value to `" + this.$input.selector + '`')
      }
    },

    isValid: function(value){
      if (this.field.type){
        switch (this.field.type){
          case 'float':
            return !isNaN(value) || value.replace && !isNaN(value.replace(',', '.'));
          case 'int' :
            return !isNaN(value)
        }
      }
      return true;
    },

    getInput: function(){
      return this.$input;
    }


  })

}());