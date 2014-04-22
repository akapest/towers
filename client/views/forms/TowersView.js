/**
 * require(views/base/ListView)
 */
(function(){

  window.TowersView = ListView.extend({

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = getTemplate('list');
      this.listenTo(window.state, 'change:location', _.bind(function(){
        var towers = state.get('location').getTowers();
        this.setCollection(towers)
      }, this));
    },

    setCollection: function(collection){
      if (this.collection){
        this.stopListening(this.collection)
      }
      this.collection = collection;
      this.listenTo(this.collection, 'add remove reset', this.renderAsync);
      this.renderAsync();
    },

    renderAsync: function(){
      if (!this.collection) return;
      var list = this.collection.map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid
        }
      })
      return this.templateP.done(_.bind(function(template){
        var display = this.$el.find('.acc-item-data').css('display');
        var html = template.execute({
          name:this.name,
          list: list
        })
        this.$el.html(html);
        this.$el.find('.acc-item-data').css('display', display);
        this.delegateEvents();

      }, this));
    },

    _setActive: function(tower){
      state.set('tower', tower);
    },

    _createModel : function(){
      return new Tower({type:'tower'});
    },

    _removeMsg: function(){
      return "Удалить вышку?"
    }


  })


}());
