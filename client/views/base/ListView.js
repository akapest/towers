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
      },
      'click .remove': function(e){
        var $el = $(e.currentTarget);
        var model = this._getModel($el);
        if (confirm(this._removeMsg())){
          model.destroy();
        }
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
    }

  })


}());
