/**
 * require(vendor/backbone)
 */
(function(){

  window.View = Backbone.View.extend({

    fields: [],

    show: function(){
      if (!this.rendered){
        this.render();
        this.rendered = true;
      }
      this.$el.show();
    },

    hide: function(){
      this.$el.hide();
    },

    bindFields: function(fields){
      _.bindAll(this);

      if (!this.model){
        throw new Error("no model to bind to!")
      }
      if (!this.model.fields && !fields){
        throw new Error("no fields to bind to!")
      }
      var self = this;

      this.fields = {};

      _.each(this.model.fields || fields, function(field){

        var fName = _.isString(field) ? field : field.name;

        var $el = self.$('.'  + fName)
        if (!$el.length){
          console.warn("No input found for field `" + fName + "`")
        } else {
          self.fields[fName] = new FieldView({
            $el: $el,
            field: field,
            model: self.model
          })
        }
      })
    },

    unbindFields: function(){
      _.each(this.fields, function(fieldView){
        fieldView.remove();
      })
    },

    bindEvent: function($el, eventName, func){
      this.inputEvents = this.inputEvents || [];
      this.inputEvents.push({
        input: $el,
        name: eventName,
        func: func
      })
      $el.on(eventName, func);
    },

    remove: function(){
      this.unbindFields();
      _.each(this.inputEvents, function(el){
        el.input.off(el.name, el.func);
      });
      this.$el.html("");
      this.stopListening();
    },

    focus: function(selector){
      var $el = this.$(selector)
      setTimeout(function(){
        $el.focus();
      })
    }

  });

}());
