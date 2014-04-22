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
        var active = state.get('location')
        if (active){
          this.$el.find('li[data-cid="'+ active.cid +'"]').addClass('active');
        }
      }, this));
    },

    _setActive: function(el, $el){
      state.set('location', el);
    },

    _createModel : function(){
      return new Location();
    },

    _removeMsg: function(){
      return "Удалить локацию?"
    }

  })


}());
