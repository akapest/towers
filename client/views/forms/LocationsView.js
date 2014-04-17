/**
 * require(views/base/View)
 */
(function(){

  window.LocationsView = View.extend({

    events: {
      'change .show-locations': function(e){
        var $el = $(e.currentTarget);
        Backbone.trigger('show:locations', $el.is(":checked"));
      },
      'click li': function(e){
        var $el = $(e.currentTarget);
        var el = this.collection.get($el.data('cid'));
        this.collection.active = el;
        this.collection.trigger('change:active', el);
        this.$el.find('li').removeClass('active');
        $el.addClass('active');
      }
    },

    initialize: function(options){
      _.bindAll(this);
      this.name = options.name;
      this.templateP = getTemplate('locations');
      this.listenTo(this.collection, 'add remove reset', this.renderAsync);
    },

    renderAsync: function(){
      var list = this.collection.map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid
        }
      })
      return this.templateP.done(_.bind(function(template){

        this.$el.html(template.execute({
          name:this.name,
          list: list
        }));

      }, this));
    }


  })


}());
