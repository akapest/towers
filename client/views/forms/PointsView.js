/**
 * require(views/base/ListView)
 * require(models/Point)
 */
(function(){

  window.PointsView = ListView.extend({

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = getTemplate('list');
      this.listenTo(window.state, 'change:tower', _.bind(function(state, tower){
        if (!tower.isNew()){
          var points = tower.getPoints();
          this.setCollection(points)
          this.$el.show()
        } else {
          this.$el.hide()
        }
      }, this));
    },

    _getType: function(){
      return 'point'
    },

    _createModel : function(){
      var tower = state.get('tower');
      if (tower == null){
        alert("Не выбрана вышка");
        return false;
      }
      return new Point({
        tower: tower
      });
    },

    _removeMsg: function(){
      return "Удалить точку?"
    }


  })


}());
