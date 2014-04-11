/**
 * require(models/freq)
 * require(views/base/view)
 */
(function(){

  var types = {
    tower: {
      name: 'Новая вышка',//Редактировать вышку
      angles: [60, 90, 120],
      angleSymbol: '°',
      angleUnit: ''
    },
    highway: {
      name: 'Новая точка-точка',//Редактировать точку-точку
      angles: [15, 20, 30],
      angleSymbol: "'",
      angleUnit: 'm'
    }
  }


  window.TowerView = View.extend({

    events: {
      'click .bind-color': 'bindColor'
    },

    initialize: function(options){
      this.options = options;
      this.freqs = options.freqs;
      this.freq = null;
      this.model = options.model;
      this.template = getTemplate('tower');
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var type = types[this.options.type];
        var html = t.execute(type)
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.initFreqColor();
      }, this));
    },

    initFreqColor: function(){
      var self = this;
      this.model.on('change:color', function(model, color){
        if (!model.get('freq')) return;
        self.$('.bind-color').show();
      })
      var $color = this.$('.color');
      this.model.on('change:freq', function(model, freq){
        if (!freq){
          self.$('.bind-color').hide();
          return;
        }
        if (self.freq){
          self.stopListening(self.freq)
        }
        var found = self.freqs.findWhere({value: parseFloat(freq)});
        if (found){
          self.freq = found;
          self.listenTo(self.freq, 'change:color', function(m, color){
            $color.val(color)
          });
          self.model.set('color', found.get('color'))
          self.$('.color').attr('disabled', 'disabled')
          self.$('.bind-color').hide();
        } else {
          self.$('.color').removeAttr('disabled', 'disabled')
          self.$('.bind-color').show();
        }
      })
    },

    bindColor: function(){
      if (this.freq) return;
      var $color = this.$('.color');
      var freq = new Freq({
        value: parseFloat(this.model.get('freq')),
        color: this.model.get('color')
      })
      this.freq = freq;
      this.listenTo(freq, 'change:color', function(m, color){
        $color.val(color)
      });
      this.freqs.add(freq);
      freq.save();

      this.$('.bind-color').hide();
      $color.attr('disabled', 'disabled')

      console.log('bind color to freq ' + freq.get('value'));
    },


    getAngle: function(){
      return this.fields.angle.getValue();
    },

    setValue: function($el, fieldName){
      debugger
      if (fieldName != 'angle'){
        this[fieldName].setValue.apply(this, arguments);
      }
    },

    toString: function(){
      return 'TowerView'
    }

  })

  window.HighwayView = TowerView.extend({

    toString: function(){
      return 'HighwayView'
    }

  });

}());
