var ListView = require('views/base/ListView');
var Point = require('models/Point');
var Templates = require('models/Templates');

module.exports = (function(){

  return ListView.extend({

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = Templates.get('list');
      this.listenTo(state, 'change:tower', function(state, tower){
        this.tower = tower;
        if (tower._isNew()){
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

    _editModel: function(model, $el){
      var li = $el.parent();

      var $input = $('<input class="edit-point-name" type="text"/>')
      $input.val(model.get('name'))
      var self = this

      var $ok = $('<span class="ok glyphicon glyphicon-ok" title="Готово">').hide()
        .on('click', function(){
          model.set({
            name: $input.val(),
            towerId: $select.val()
          })
          model.save()
          state.trigger('redraw:point', model)
          self._finishEditing(model, li)
        });

      var $cancel = $('<span class="cancel glyphicon glyphicon-remove" title="Отмена">').hide()
        .on('click', function(){
          self._finishEditing(model, li)
        });
      var $select = $('<select id="towerSelect" class=""></select>')
      state.get('location').getTowers().each(function(t){
        $select.append($('<option value="' + t.get('id') + '">' + t.get('name') + '</option>'))
      })
      $select.val(model.get('towerId'))
      li.children().remove()
      var div = $('<div class="wrapper">')
      div.append($input)
      div.append($cancel)
      div.append($ok)
      li.append(div)
      li.append($select)
      $select.select2()
    },

    _finishEditing: function(model, li){
      model.collection.sort()
      li.removeClass('wrapper')
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
