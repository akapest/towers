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
    ]
  });


}());
