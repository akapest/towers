/**
 * require(models/Location)
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
            attrs.angle = types[attrs.type].angles[0];
        }
        this.set(attrs)
      }
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

  Tower.types = types;

}());
