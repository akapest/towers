/**
 * require(views/base/View)
 */
(function(){

  window.LocationView = View.extend({

    events: {
      'click .remove': function(){
        this.model.revert();
        state.set('editModel', null);
      }
    },

    remove: function(){
      Backbone.trigger('update:location', this.model);
      View.prototype.remove.apply(this)
    },

    initialize: function(options){
      _.bindAll(this);
      this.options = options;
      this.locations = options.locations;
      this.template = getTemplate('location');
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var data = {
          name: this.model.getName()
        };
        var html = t.execute(data);
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.focus('.name');
      }, this));
    }

  })


}());
