/**
 * require(models/Freq)
 * require(views/base/View)
 */
(function(){

  var types = {
    tower: {
      name: 'Новая вышка',//Редактировать вышку
      angles: ['60°', '90°', '120°', '360°']
    },
    highway: {
      name: 'Новая точка-точка',//Редактировать точку-точку
      angles: ["15'", "20'", "30'"]
    }
  }


  window.TowerView = View.extend({

    events: {
      'click .bind-color': 'bindColor'
    },

    initialize: function(options){
      _.bindAll(this);
      this.type = options.type;
      this.freqs = options.freqs;
      this.freq = null;
      this.model = this.createModel();
      this.template = getTemplate('tower');
      Backbone.on('create:tower', this.bindColor);
    },

    createModel: function(){
      var result = null;
      if (this.model){
        result = this.model.clone();
      } else {
        result = new Tower({type:this.type});
        var angle = this.$el.find(".angle").val() || types[this.type].angles[0];
        result.set({angle: angle},{silent:true});
      }
      return result;
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var type = types[this.type];
        var html = t.execute(type)
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.initFreqColor();
      }, this));
    },

    getModel: function(){
      return this.model;
    },

    setModel: function(model){
      this.unbindFields();
      this.stopListening(this.model);
      this.model = model;
      this.bindFields();
      this.initFreqColor();
    },

    initFreqColor: function(){
      var self = this;
      this.listenTo(this.model, 'change:color', function(model, color){
        if (!model.get('freq')) return;
        self.$('.bind-color').show();
      })
      var $color = this.$('.color');
      this.listenTo(this.model, 'change:freq', function(model, freq){
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
      if (this.$('.bind-color').is(':hidden')) return;
      if (this.freq){
        this.stopListening(this.freq)
      }
      var $color = this.$('.color');
      var freq = new Freq({
        value: parseFloat(this.model.get('freq')),
        color: $color.val()
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


}());
