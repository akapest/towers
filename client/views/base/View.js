/**
 * require(vendor/backbone)
 */
(function(){

  window.View = Backbone.View.extend({

    fields: [],

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

    remove: function(){
      _.each(this.fields, function(fieldView){
        fieldView.remove();
      })
      Backbone.View.prototype.remove.apply(this);
    }




  });

}());
