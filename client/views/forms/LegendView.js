var View = require('views/base/View');
var Templates = require('models/Templates');

module.exports = (function(){

  var t = '<li class="freq list-item"><input class="color" type="color" data-freq="${value}" value="${color}"></div><label>${value} Mhz</label></li>'

  return View.extend({

    events:{
      'click .toggle': function(){
        this.$('.form-body').toggle();
      },
      'change input[type="checkbox"]': function(e){
        var $el = $(e.currentTarget);
        if ($el.data('toggle-all')){
          this.toggleAll($el.is(":checked"))

        } else if ($el.data('toggle-points')){
          state.set('showPoints', $el.is(':checked'))

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
      this.showAll = false;
      this.templatePromise = Templates.get('legend')
      this.freqs = state.get('freqs');
      this.freqs.each(function(freq){
        freq.set({show: false})
      })
      if (!this.freqs.length){
        this.$el.hide();
      }
      this.listenTo(this.freqs, 'add reset remove', this.render)
      this.listenTo(state, 'change:location', this.render)
      this.listenTo(state, 'change:location', this.listenToTowersAddition)
    },

    listenToTowersAddition: function(){
      var towers = state.get('location').getTowers();
      this.listenTo(towers, 'add', this.render)
    },

    render: function(){
      if (this.freqs.length){
        this.$el.show();
      }
      var freqs = this.freqs.filter(_.bind(function(freq){
        return this.has(freq)
      }, this));
      this.templatePromise.done(_.bind(function(t){
        var html = t.execute({
          freqs: freqs,
          showAll: this.showAll,
          showPoints: state.get('showPoints')
        });
        this.$el.html(html)
      }, this));
      return this;
    },

    has: function(freq){
      var towers = state.get('location').getTowers()
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
      state.set('showPoints', show)
      this.showAll = show;
      this.freqs.each(function(freq){
        freq.set({show:show})
      });
      this.$('input[type="checkbox"]').prop('checked', show)
    }

  });


}());
