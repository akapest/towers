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
        this.__setActive(el, {$el:$el, click:true});
      },
      'mousedown .add': function(e){
        var $el = $(e.currentTarget);
        $el.addClass('active')
      },
      'click .add': function(e){
        var $el = $(e.currentTarget);
        $el.removeClass('active')
        var model = this._createModel();
        if (model){
          state.set('editModel', model);
          this.__setActive(model, {add:true, click:true});
        }
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
        this._editModel(model, $el)
        this.__setActive(model, {$el:$el, click:true})
      },

      'mouseenter .list-el': function(e){
        $(e.currentTarget).find('.glyphicon').show();
      },
      'mouseleave .list-el': function(e){
        $(e.currentTarget).find('.glyphicon').hide();
      },

      'change .show-locations': function(e){
        var $el = $(e.currentTarget);
        state.set('showLocations', $el.is(":checked"));
      },

      'mousedown .sort': function(e){
        var $el = $(e.currentTarget);
        $el.addClass('active');
      },

      'click .sort': function(e){
        var $el = $(e.currentTarget);
        var attr = $el.data('sort-attr');
        this.collection.setSort({attr: attr})
        this.collection.sort()
        $el.removeClass('active')
      }
    },

    bindToStateEvents: function(){
      this.stopListening(state, 'change:editModel')
      this.listenTo(state, 'change:editModel', _.bind(function(state){
        if (state.get('editModel') == null){
          if (state.getPreviousEditModel() && state.getPreviousEditModel().url == this._getType()){
            this.__dropActive();
          }
        }
      }, this))
      this.stopListening(state, 'sync:' + this._getType())
      this.listenTo(state, 'sync:' + this._getType(), _.bind(function(state, model){
        this.__setActive(model, {click:false})
      }, this))
    },

    renderAsync: function(){
      if (!this.collection) return;
      return this.templateP.done(_.bind(function(template){
        var display = this.$el.find('.acc-item-data').css('display');
        var html = template.execute(this._data())
        this.$el.html(html);
        this.$el.find('.acc-item-data').css('display', display);
        this.$el.find('.glyphicon').hide()
        this._afterRender();
        this.bindToStateEvents();
        this.delegateEvents();
      }, this));
    },

    setCollection: function(collection){
      if (this.collection){
        this.stopListening(this.collection)
      }
      this.collection = collection;
      this.listenTo(this.collection, 'add remove reset change sync sort', this.renderAsync);
      this.renderAsync();
    },

    _data: function(){
      var list = this.collection.map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid,
          freq: el.is('tower') ? el.get('freq') : '',
          color: el.is('tower') ? el.getColor() : ''
        }
      })
      return {
        name: this.name,
        type: this._getType(),
        list: list,
        sort: {
          name: this.mapSortOpts('name'),
          freq: this.mapSortOpts('freq')
        }
      }
    },

    mapSortOpts: function(attr){
      var opts = this.collection.sortOpts

      if (opts.attr == attr){
        return {
          dir: opts.dir == 'asc' ? 'down' : 'up',
          active: 'active'
        }
      } else {
        return {
          dir: 'down',
          active: ''
        }
      }
    },

    //to redefine in PointsView
    _editModel: function(model){
      state.set('editModel', model);
    },

    __setActive: function(el, opts){
      opts = opts || {}
      this.__dropActive();
      if (opts.add){
        opts.$el = this.$el.find('.add')
      }
      else if (!opts.$el){
        opts.$el = this.$el.find('li[data-cid="'+ el.cid +'"]')
      }
      opts.$el.addClass('active');
      if (opts.click){
        state.trigger('click:object', el)
        state.set(this._getType(), el);
      }
    },

    __dropActive: function(){
      this.$el.find('li').removeClass('active');
    },

    _createModel : function(){
      throw new Error('unimplemented')
    },

    _removeMsg: function(){
      throw new Error('unimplemented')
    },

    _canRemove: function(){
      return true;
    },

    _afterRender: function(){
    },

    _getType: function(){
      throw new Error("Type not defined")
    }


  })


}());
