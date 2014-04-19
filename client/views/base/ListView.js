/**
 * require(views/base/View)
 */
(function(){

  window.ListView = View.extend({

    events:{
      'click .remove' : function(e){
        var el = $(e.currentTarget);
        var cid = el.parent('li').data('cid');
        var model = this.collection.get(cid);
        if (confirm('Удалить вышку?')){
          model.destroy();
        }
      }
    },

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = getTemplate('list');
      this.setCollection(this.collection);
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
    }


  })


}());
