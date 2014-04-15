/**
 * require(models/Location)
 */
(function(){

  window.Tower = Location.extend({
    url:'towers',
    fields:['angle',
            'name',
            'freq',
            'comment'],
    fields2:['start',
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
        case 'tower': return this.get('end') == null;
        case 'highway': return this.get('end') != null;
      }
      throw new Error("Cant find object type!")
    },

    validate: function(){
      return !!this.get('freq')
    }

  })

}());
