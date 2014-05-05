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
      'change .color': 'onColorChange'
    },

    initialize: function(){
      _.bindAll(this)
      this.freqs = state.get('freqs');
      if (!this.freqs.length){
        this.$el.hide();
      }
      _.each(['reset', 'add', 'remove'], _.bind(function(event){
        this.freqs.on(event, this.render, this)
      }, this));
      state.on('change:location', this.render);
    },

    render: function(){
      if (this.freqs.length){
        this.$el.show();
      }
      var $ul = this.$el.find('ul');
      $ul.html('');
      var towers = state.get('location').getTowers();
      this.freqs.each(_.bind(function(freq){
        if (this.has(towers, freq)){
          var html = _.template(t, freq.attributes, {interpolate:/\$\{(.+?)\}/g})
          $ul.append(html);
        }
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
      this.freqs.trigger('change')
    }



  });


}());
