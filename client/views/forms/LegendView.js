/**
 * require(views/base/View)
 */
(function(){

  var t = '<li class="freq list-item"><input class="color" type="color" data-freq="${value}" value="${color}"></div><label>${value} Mhz</label></li>'

  window.LegendView = View.extend({

    events:{
      'click .toggle': function(){
        this.$('.form-body').toggle();
      },
      'change input[type="checkbox"]': function(e){
        var $el = $(e.currentTarget);
        if ($el.data('toggle-all')){
          this.toggleAll($el.is(":checked"))
        } else {
          var cid = $el.data('freq-cid')
          var freq = state.get('freqs').get(cid)
          freq.switchVisibility()
        }
      },
      'change .color': 'onColorChange'
    },

    initialize: function(){
      _.bindAll(this)
      this.showAll = true;
      this.templatePromise = getTemplate('legend')
      this.freqs = state.get('freqs');
      if (!this.freqs.length){
        this.$el.hide();
      }
      this.listenTo(this.freqs, 'add reset remove', this.render)
      this.listenTo(state, 'change:location', this.render)
    },

    render: function(){
      this.freqs = state.get('freqs');
      if (this.freqs.length){
        this.$el.show();
      }
      this.templatePromise.done(_.bind(function(t){
        var html = t.execute({
          freqs: this.freqs,
          towers: state.get('location').getTowers(),
          has: this.has,
          showAll: this.showAll
        });
        this.$el.html(html)
      }, this));
      return this;
    },

    has: function(towers, freq){
      for (var i = 0; i < towers.length; i++){
        var t = towers.at(i);
        if (t.get('freq') == freq.get('value')){
          return true;
        }
      }
      return false;
    },

    onColorChange: function(e){
      var $el = $(e.currentTarget);
      var freq = $el.data('freq')
      var model = this.freqs.findWhere({value:freq})
      model.set('color', $el.val())
      model.save()
      this.freqs.trigger('change', model)
    },

    toggleAll: function(show){
      this.showAll = show;
      this.freqs.each(function(freq){
        freq.set({show:show})
      });
      this.$('input[type="checkbox"]').each(function(index, el){
        $(el).prop('checked', show)
      });

    }

  });


}());
