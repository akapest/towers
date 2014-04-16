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

    initialize: function(state){
      if (!state)
        return;
      if (state.cid){
        var attrs = _.clone(state.attributes);
        if (attrs.type == 'tower'){
          attrs.end = null;
        }
        this.attributes = attrs;
      } else {
        attrs = state;
        this.set(attrs)
      }
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
