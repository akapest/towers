/**
 * require(models/BaseModel)
 */
(function(){

  window.Location = BaseModel.extend({

    url: 'locations',
    fields: [
      {
        name: 'name',
        label: 'Название'
      },
      {
        name: 'comment',
        label: 'Комментарий'
      },
      {
        name: 'color',
        label: 'Цвет'
      }
    ]
  })

}());
