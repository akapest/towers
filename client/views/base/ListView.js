/**
 * require(views/base/View)
 */
(function(){

  window.ListView = View.extend({

    initialize: function(options){
      this.name = options.name;
      this.templateP = getTemplate('list');
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

        this.$el.html(template.execute({
          name:this.name,
          list: list
        }));

      }, this));
    }


  })


}());
