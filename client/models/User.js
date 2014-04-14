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
        name: 'comment',
        label: 'Комментарий',
        input: 'textarea'
      }
    ]
  });


}());
