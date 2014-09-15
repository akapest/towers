/**
 * require(views/base/View)
 */
(function(){

  var t = '<li class="freq list-item"><input class="color" type="color" data-freq="${value}" value="${color}"></div><label>${value} Mhz</label></li>'

  window.LegendView = View.extend({

    events:{
      'click .toggle': function(){
        this.$('.list').toggle();
      },
      'change input[type="checkbox"]': function(e){
        var cid = $(e.currentTarget).data('freq-cid')
        var freq = state.get('freqs').get(cid)
        freq.switchVisibility()
      },
      'change .color': 'onColorChange'
    },

    initialize: function(){
      _.bindAll(this)
      this.templatePromise = getTemplate('legend')
      this.freqs = state.get('freqs');
      if (!this.freqs.length){
        this.$el.hide();
      }
      this.listenTo(this.freqs, 'add reset remove', this.render)
      this.listenTo(state, 'change:location', this.render)
    },

    render: function(){
      if (this.freqs.length){
        this.$el.show();
      }
      this.templatePromise.done(_.bind(function(t){
        var html = t.execute({
          freqs: this.freqs,
          towers: state.get('location').getTowers(),
          has: this.has
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
    }



  });


}());
