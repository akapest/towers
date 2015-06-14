var BaseModel = require('models/BaseModel');

module.exports = (function(){

  return BaseModel.extend({
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
    ],

    getV: function(attr){
      var value = this.get(attr);
      if (attr == 'locations'){
        value = value || [];
        return value.join(', ');
      } else {
        return value;
      }
    }

  });


}());
