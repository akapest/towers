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
        label: 'Частота'},
      {name: 'comment',
        label: 'Комментарий'}
    ],
    fields2: ['start',
      'radius',
      'azimuth',
      'end'],

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
      switch (type){
        case 'tower':
          return this.get('end') == null;
        case 'highway':
          return this.get('end') != null;
      }
      throw new Error("Cant find object type!")
    },

    validate: function(){
      return this.__validate(['freq', 'name']);//required
    },

    parseAngle: function(str){
      var anglePattern = /(\d+)([^\d]*)/;
      if (!str){
        return 0;
      }
      function convert(value, unit){
        switch (unit){
          case '':
            return value * Math.PI / 360
          case "m":
            return value * Math.PI / 360 / 60
          case 's':
            return value * Math.PI / 360 / 3600
        }
        throw new Error("Unit not found - " + unit)
      }

      var result = null;
      str.replace(anglePattern, function(m, value, unit){
        result = convert(value, unit);
      })
      return result;
    }



  })

}());
