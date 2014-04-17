/**
 * require(views/base/View)
 */
(function(){

  window.ListView = View.extend({

    initialize: function(options){
      this.name = options.name;
      this.templateP = getTemplate('list');
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
