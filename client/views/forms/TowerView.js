var Freq = require('models/Freq');
var View = require('views/base/View');
var Templates = require('models/Templates');
var Tower = require('models/Tower');

module.exports = (function(){

  return View.extend({

    events: {
      'click .bind-color': 'bindColor',
      'click .remove': function(){
        this.model.revert();
        state.set('editModel', null);
      }
    },

    initialize: function(options){
      _.bindAll(this);
      this.freq = null;
      this.model = options.model;
      this.template = Templates.get('tower');
      this.listenTo(this.model, 'change:type', this.renderAsync)
      this.listenTo(this.model, 'beforeSave', this.bindColor)
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var data = {
          angles: Tower.angles[this.model.get('type')],
          name: this.model.getName()
        };
        var html = t.execute(data)
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.initFreqColor();
        this.afterRender();
        this.focus('.name');
      }, this));
    },

    remove: function(){
      this.bindColor();
      View.prototype.remove.apply(this, arguments);
    },

    afterRender: function(){
      var typeSelect = this.$('.type');
      if (!this.model.  isNew()){
        typeSelect.attr('disabled', 'disabled')
      }
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
        var found = state.get('freqs').findWhere({value: parseFloat(freq)});
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
      var value = parseFloat(this.model.get('freq'))
      if (!value || state.get('freqs').findWhere({value: value})){
        return;
      }
      var $color = this.$('.color');
      var freq = new Freq({
        value: value,
        color: $color.val()
      })
      this.freq = freq;
      this.listenTo(freq, 'change:color', function(m, color){
        $color.val(color)
      });
      state.get('freqs').add(freq);
      freq.save();

      this.$('.bind-color').hide();
      $color.attr('disabled', 'disabled')

      console.log('bind color to freq ' + freq.get('value'));
    },


    getAngle: function(){
      return this.fields.angle.getValue();
    },

    setValue: function($el, fieldName){
      if (fieldName != 'angle'){
        this[fieldName].setValue.apply(this, arguments);
      }
    },

    toString: function(){
      return 'TowerView'
    }

  })


}());
