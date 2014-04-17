/**
 * require(models/BaseModel)
 */
(function(){

  window.User = BaseModel.extend({
    url: 'users',
    fields: [
      {
        name: 'login',
        label: 'Логин'
      },
      {
        name: 'password',
        label: 'Пароль'
      },
      {
        name: 'locations',
        label: 'Локации',
        input: 'select-multiple'
      },
      {
        name: 'comment',
        label: 'Комментарий',
        input: 'textarea'
      }
    ]
  });


}());
