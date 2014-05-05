/**
 * require(views/base/View)
 */
(function(){

  window.LocationView = View.extend({

    events: {
      'click .remove': function(){
        this.model.restore();
        state.set('editModel', null);
      }
    },

    initialize: function(options){
      _.bindAll(this);
      this.options = options;
      this.locations = options.locations;
      this.template = getTemplate('location');
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var html = t.execute()
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.focus('.name');
      }, this));
    }

  })


}());
