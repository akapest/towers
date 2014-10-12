/**
 * require(models/Location)
 * require(models/Point)
 */
(function(){

  var angles = {
    tower: ['60°', '90°', '120°', '360°'],
    highway: ["15'", "20'", "30'"]
  }

  window.Tower = Location.extend({

    url: 'towers',

    fields: [
      {name: 'angle',
        label: 'Угол'},
      {name: 'name',
        label: 'Название'},
      {name: 'freq',
        type: 'float',
        label: 'Частота'
        },
      {name: 'comment',
        label: 'Комментарий'},
        'type',
        'color'
    ],
    fields2: [
      'start',
      'radius',
      'azimuth',
      'end'
      ],

    initialize: function(attrs){
      if (attrs){
        attrs = this.parse(attrs);
        if (!attrs.angle){ //set default angle
          if (!attrs.type)
            throw new Error("Unable to determine tower type. " + attrs);
          else
            attrs.angle = angles[attrs.type][0];
        }
        this.set(attrs)
      }
      this.on('change:type', _.bind(function(){
        this.set('angle', angles[this.get('type')][0])
      }, this))
    },

    getName: function(){
      if (!this.get('name')){
        return 'Новая ' + (this.isHighway() ? 'точка-точка' : 'вышка');
      } else {
        return (this.isHighway() ? 'Точка-точка' : 'Вышка')  + ' ' + this.get('name');
      }
    },

    _isNew: function(){
      return !this.get('radius')
    },

    getPoints: function(){
      var id = this.get('id')
      var arr = state.get('points').filter(function(el){
        return el.get('towerId') == id
      })
      return _(arr)
    },

    getColor: function(){
      return this.getFreq_().get('color')
    },

    getFreq_: function(){
      var freq = parseFloat(this.get('freq'));
      var result = state.get('freqs').findWhere({value: freq})
      if (!result){
        console.error("freq not found: " + freq)
      } else {
        return result
      }
    },

    updateColor: function(){
      var freq = this.getFreq_();
      this.set({color: freq.get('color')})
    },

    //возвращает true, если объект вышка или точка-точка
    isTower: function(){
      return true;
    },

    is: function(type){
      return this.get("type") == type;
    },

    isHighway: function(){
      return this.is('highway')
    },

    validate: function(){
      return this.__validate(['freq', 'name']);//required
    }

  })

  Tower.angles = angles;

}());
