/**
 * require(models/Model)
 */
(function(){

  window.User = Model.extend({
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
        label: 'Комментарий'
      }
    ],
  });


}());
