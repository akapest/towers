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
      this.listenTo(window.state, 'change:tower', _.bind(function(){
        var points = state.get('tower').getPoints();
        this.setCollection(points)
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
