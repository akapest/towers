/**
 * require(views/base/View)
 */
(function(){

  window.ListView = View.extend({

    _getModel: function($el){
      var cid = $el.parent('li').data('cid');
      return this.collection.get(cid);
    },

    events: {
      'click .list-el': function(e){
        var $el = $(e.currentTarget);
        var el = this.collection.get($el.data('cid'));
        this.__setActive(el, $el);
      },
      'click .add': function(e){
        var $el = $(e.currentTarget);
        $el.removeClass('active')
        var model = this._createModel();
        state.set('editModel', model);
        this.__setActive(model);
        e.stopPropagation();
        return false;
      },
      'click .remove': function(e){
        var $el = $(e.currentTarget);
        var model = this._getModel($el);
        if (this._canRemove(model) && confirm(this._removeMsg())){
          model.destroy();
        }
        e.stopPropagation();
        return false;
      },
      'click .edit': function(e){
        var $el = $(e.currentTarget);
        var model = this._getModel($el);
        state.set('editModel', model);
        this.__setActive(model, $el)
      },

      'mouseenter .list-el': function(e){
        $(e.currentTarget).find('.remove').show();
        $(e.currentTarget).find('.edit').show();
      },
      'mouseleave .list-el': function(e){
        $(e.currentTarget).find('.remove').hide();
        $(e.currentTarget).find('.edit').hide();
      },
      'mousedown .add': function(e){
        var $el = $(e.currentTarget);
        $el.addClass('active')
      },

      'change .show-locations': function(e){
        var $el = $(e.currentTarget);
        Backbone.trigger('show:locations', $el.is(":checked"));
      }
    },

    renderAsync: function(){
      if (!this.collection) return;
      return this.templateP.done(_.bind(function(template){
        var display = this.$el.find('.acc-item-data').css('display');
        var html = template.execute(this._data())
        this.$el.html(html);
        this.$el.find('.acc-item-data').css('display', display);
        this._afterRender();
        this.delegateEvents();
      }, this));
    },

    _data: function(){
      var list = this.collection.map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid
        }
      })
      return {
        name:this.name,
        list: list
      }
    },

    __setActive: function(el, $el){
      this.$el.find('li').removeClass('active');
      if (!$el){
        $el = this.$el.find('li[data-cid="'+ el.cid +'"]')
      }
      $el.addClass('active');
      this._setActive(el)
    },

    _setActive: $.noop,

    _createModel : function(){
      debugger
    },

    _removeMsg: function(){
      debugger
    },

    _canRemove: function(){
      return true;
    },

    _afterRender: function(){
    }


  })


}());
