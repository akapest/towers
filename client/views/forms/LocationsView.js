/**
 * require(views/base/ListView)
 * require(models/Location)
 */
(function(){

  var bottom = '<div role="form" style=" height: 30px; ">\
              <label>Показать границы</label>\
              <input type="checkbox" class="show-locations" checked="checked" style=" margin:9px 0 0 5px;"/>\
           </div>';

  window.LocationsView = ListView.extend({

    initialize: function(options){
      _.bindAll(this);
      this.name = options.name;
      this.templateP = getTemplate('locations');
      this.listenTo(this.collection, 'add remove reset change', this.renderAsync);
    },

    _afterRender: function(){
      var active = state.get('location')
      if (active == this.current){
        return;
      }
      this.current = active;
      if (active){
        this.$el.find('li[data-cid="'+ active.cid +'"]').addClass('active');
      }
      this.$('.show-locations').attr('checked', state.get('showLocations'))
    },

    _getType: function(){
      return 'location'
    },

    _createModel : function(){
      return new Location();
    },

    _removeMsg: function(){
      return "Удалить локацию?"
    },

    _canRemove: function(model){
      var canRemove = !model.getTowers() || model.getTowers().length == 0;
      if (!canRemove) alert('Чтобы удалить локацию, сперва нужно удалить все вышки.')
      return canRemove;
    }

  })


}());
