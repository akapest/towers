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
    },

    render: function(){
      if (this.freqs.length){
        this.$el.show();
      }
      var $ul = this.$el.find('ul');
      $ul.html('');
      this.freqs.each(function(freq){
        var html = _.template(t, freq.attributes, {interpolate:/\$\{(.+?)\}/g})
        $ul.append(html);
      })
      return this;
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
