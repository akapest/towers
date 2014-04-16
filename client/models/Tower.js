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

    initialize: function(model){
      if (!model)
        return;
      if (model.cid){
        var attrs = _.clone(model.attributes);
        if (attrs.type == 'tower'){
          attrs.end = null;
        }
        this.attributes = attrs;
      } else {
        attrs = model;
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
      if (!this.get('freq')){
        return 'Необходимо задать частоту!';
      }
      return null;
    }

  })

}());
