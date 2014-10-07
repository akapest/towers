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
      this.listenTo(state, 'change:tower', function(state, tower){
        this.tower = tower;
        if (tower.isNew()){
          this.$el.hide()
        } else {
          this.setCollection(state.get('points'))
          this.$el.show()
        }
      }, this);
      this.listenTo(state, 'change:location', function(){
        this.$el.hide()
      }, this)
    },

    _data: function(){
      var towerId = this.tower.get('id');
      var filtered = this.collection.filter(function(el){
        return towerId == el.get('towerId')
      });
      var list = _(filtered).map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid
        }
      });
      return {
        name:this.name,
        list: list.__wrapped__,
        sort: false
      }
    },

    _afterRender: function(){
      this.$('.list-more')
          .removeClass('hidden')
          .html('<div class="wrapper"><label title="Название следущей точки">Название</label><input type="text" class="point-name"/></div>')
      var $pointName = this.$('.point-name');
      $pointName
        .on('change', function(){
          Point.setName($(this).val())
        })
    },

    _getType: function(){
      return 'point'
    },

    _createModel : function(){
      var tower = state.get('tower');
      if (!tower){
        alert("Не выбрана вышка");
        return false;
      }
      if (!tower.id){
        alert("Вышка не сохранена. Попробуйте еще раз.")
        return false;
      }
      return new Point({
        towerId: tower.get('id'),
        locationId: state.get('location').id
      });
    },

    _removeMsg: function(){
      return "Удалить точку?"
    }


  })


}());
