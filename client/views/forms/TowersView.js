var ListView = require('views/base/ListView');
var Templates = require('models/Templates');
var Tower = require('models/Tower');

module.exports = (function(){

  return ListView.extend({

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = Templates.get('list');
      state.on('change:location', _.bind(function(){
        var towers = state.get('location').getTowers();
        this.setCollection(towers)
      }, this));
    },

    _getType: function(){
      return 'tower'
    },

    _createModel : function(){
      if (!state.get('location')){
        alert("Не выбрана локация");
        return false;
      }
      if (!state.get('location').id){
        alert('Локация еще не сохранена. Попробуйте еще раз')
        return false;
      }
      return new Tower({
        type:'tower', // по-умолчанию вышка - бывает еще точка-точка
        locationId: state.get('location').id
      });
    },

    _removeMsg: function(){
      return "Удалить вышку?"
    }


  })


}());
