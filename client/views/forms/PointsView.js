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
        list: list.__wrapped__
      }
    },

    _afterRender: function(){
      //counter related stuff
      this.$('.list-more')
          .removeClass('hidden')
          .html('<input type="number" class="points-counter"/><li class="counter-btn" title="Значение счетчика будет названием точки">Сбросить счетчик</li>')
      this.$('.counter-btn')
        .on('click', function(){
          Point.setCounter(1)
          $pointsCounter.val(Point.getCounter())
        })
        .on('mousedown', function(){
          $(this).addClass('active')
        })
        .on('mouseup', function(){
          $(this).removeClass('active')
        });
      var $pointsCounter = this.$('.points-counter');
      $pointsCounter
        .val(Point.getCounter())
        .on('change', function(){
          Point.setCounter(parseInt($(this).val()))
        })
      this.listenTo(this.collection, 'add', _.bind(function(){
        $pointsCounter.val(Point.getCounter())
      }, this));
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
