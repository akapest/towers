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
      this.listenTo(this.collection, 'add remove reset change', this.renderAsync);
      this.renderAsync();
    },

    _getType: function(){
      return 'tower'
    },

    _createModel : function(){
      if (state.get('location') == null){
        alert("Не выбрана локация")
        return false;
      }
      return new Tower({type:'tower'});
    },

    _removeMsg: function(){
      return "Удалить вышку?"
    }


  })


}());
