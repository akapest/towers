/**
 * require(vendor/backbone)
 */
(function(){

  window.FieldView = Backbone.View.extend({

    initialize: function(opts){
      _.bindAll(this)
      var $input = this.$input = opts.$el;
      var field = this.field = _.isString(opts.field) ? opts.field : opts.field.name;
      if (!field) console.warn('Creating FieldView for "null" field');
      if (!$input.length) console.warn("No input found for field `" + field + "`");
      if (!opts.model) console.warn('No model defined for field ' + field);
      this.bindField(opts.field, opts.model);
      this.changing = false;
    },

    bindField: function(field, model){
      this.model = model;
      var self = this;
      var property = this.getPropertyToListenTo() //привязываем изменение модели при изменении поля
      this.$input.on(property, function(){
        self.changing = true;
        self.handleInputChange();
        self.changing = false
      })
      model.on('change:' + field, function(model){ //привязываем изменение поля при изменении модели
        if (!self.changing){
          self.setValue(field, model.get(field))
        } else {
          // already changing - so do nothing
        }
      })
    },

    handleInputChange: function(){
      var value = this.getValue();
      if (this.isValid(value)){
        this.model.set(this.field, this.parseValue(value))
      } else {
        this.setValue(this.model.get(this.field))
      }
    },

    remove: function(){
      this.options.$input.off()
    },

    getValue: function(){
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

      if (this.model.hasOwnProperty(expectedMethodName)){
        console.log('calling "' + expectedMethodName + '" on ' + this.toString())
        return this[expectedMethodName].call(this, value)
      }

      return value;
    },

    setValue: function(value){
      var type = this.$input.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'color':
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
    }


  })

}());
