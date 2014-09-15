/**
 * require(models/BaseModel)
 */
(function(){

  window.Freq = BaseModel.extend({

    url: 'freqs',
    fields: [
      {
        name: 'value',
        label: 'Частота'
      },
      {
        name: 'color',
        label: 'Цвет'
      },
      {
        name: 'type',
        label: 'Тип'
      }
    ],

    shouldShow: function(){
      return this.get('show') !== false;
    },

    isShown: function(){
      return this.shouldShow()
    },

    switchVisibility: function(){
      this.set({
        show: !this.shouldShow()
      });
    }

  });


}());
