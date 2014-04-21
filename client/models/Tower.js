/**
 * require(models/Location)
 */
(function(){

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
        this.set(attrs)
      }
    },

    //возвращает true, если объект вышка, точка-точка
    isTower: function(){
      return true;
    },

    is: function(type){
      return this.get("type") == type;
    },

    validate: function(){
      return this.__validate(['freq', 'name']);//required
    }

  })

}());
