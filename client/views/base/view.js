/**
 * require(vendor/backbone)
 */
(function(){

  window.View = Backbone.View.extend({

    fields: [],

    bindFields: function(fields){
      _.bindAll(this)

      if (!this.model){
        throw new Error("no model to bind to!")
      }
      if (!this.model.fields && !fields){
        throw new Error("no fields to bind to!")
      }
      var self = this;
      _.each(this.model.fields || fields, function(field){

        var fName = _.isString(field) ? field : field.name;

        var $el = self.$('.'  + fName)
        if (!$el.length){
          console.warn("No input found for field `" + fName + "`")
          return;
        }
        var changing = false; //одна переменная на все поля!

        //привязываем изменение модели при изменении поля
        var property = self.getPropertyToListenTo($el, fName)
        $el.on(property, function(){
          var value = self.getValue($(this));
          if (self.isValid(field, value)){
            changing = true;
            self.model.set(fName, self.parseValue(fName, value))
            changing = false
          } else {
            self.setValue($el, fName, self.model.get(fName))
          }
        })
        //привязываем изменение поля при изменении модели
        self.model.on('change:'+ fName, function(model){
          if (changing){ //already
            //do nothing
          } else {
            self.setValue($el, fName, model.get(fName))
          }
        })
      })
    },

    getValue: function($el){
      var type = $el.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'select-one':
        case 'color':
          return $el.val();
        case 'checkbox':
          return $el.is(':checked');
        default:
          throw new Error("Cant get value of `" + $el.selector + '`')
      }
    },

    getPropertyToListenTo: function($el, fName){
      switch ($el.prop('type')){
        case 'text':
        case 'textarea': return 'keyup';
        case 'select-one':
        case 'color':
        case 'checkbox': return 'change';
      }
      console.warn('Cant bind to field `' + fName + '`');
      return null;
    },

    parseValue: function(fieldName, value){
      var expectedMethodName = 'parse' + fieldName[0].toUpperCase() + fieldName.substring(1);

      if (this.hasOwnProperty(expectedMethodName)) {
        console.log('calling "' + expectedMethodName + '" on ' + this.toString())
        return this[expectedMethodName].call(this, value)
      }

      return value;
    },

    setValue: function($el, fName, value){
      var type = $el.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'color':
          $el.val(value); break;
        case 'checkbox':
          $el.prop('checked',value); break;
        default:
          throw new Error("Cant set value to `" + $el.selector + '`')
      }
    },

    isValid: function(field, value){
      if (field.type){
        switch (field.type){
          case 'float': return !isNaN(value) || value.replace && !isNaN(value.replace(',','.'));
          case 'int' : return !isNaN(value)
        }
      }
      return true;
    }

  });

}());
