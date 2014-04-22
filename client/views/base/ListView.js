/**
 * require(views/base/View)
 */
(function(){

  window.ListView = View.extend({

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
        var el = $(e.currentTarget);
        var cid = el.parent('li').data('cid');
        var model = this.collection.get(cid);
        if (confirm(this._removeMsg())){
          model.destroy();
        }
      },

      'mouseenter .list-el': function(e){
        $(e.currentTarget).find('.remove').show();
      },
      'mouseleave .list-el': function(e){
        $(e.currentTarget).find('.remove').hide();
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
