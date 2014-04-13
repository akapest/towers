/**
 * require(models/Model)
 */
(function(){

  window.Freq = Model.extend({
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
