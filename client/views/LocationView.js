/**
 * require(views/base/View)
 */
(function(){

  window.LocationView = View.extend({

    initialize: function(options){
      _.bindAll(this);
      this.options = options;
      this.locations = options.locations;
      this.model = this.createModel();
      this.template = getTemplate('location');
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var html = t.execute()
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
      }, this));
    },

    createModel: function(){
      return new Location({}, {locations:this.locations});
    },

    getModel: function(){
      return this.model;
    },

    setModel: function(model){
      this.unbindFields();
      this.model = model;
      this.bindFields();
    }

  })


}());
