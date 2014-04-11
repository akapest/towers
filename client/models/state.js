/**
 * require(vendor/backbone)
 * require(models/freq)
 */
(function(){

  window.State = Backbone.Model.extend({
    fields:['type',
      'angle',
      { name:'freq', type:'float' },
      'color',
      'comment',
      'name'],

    initialize: function(){
      this.set("type", 'tower')
      this.reset();
    },

    reset: function(){
      this.set({
        name:'',
        freq:'',
        comment:''
      })
    },

    //called by EditableField
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
