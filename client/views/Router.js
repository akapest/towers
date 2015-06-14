var MainView = require('views/MainView');
var TableView = require('views/base/TableView');

module.exports = (function(){

  var Router = Backbone.Router.extend({

    routes: {
      '': 'main',
      'users': 'users'
    },

    main: function(){
      MainView.get().show();
      $('#users-list').hide();
    },

    users: function(){
      var $users = $('#users-list')
      $users.show();
      new TableView({
        el: $users,
        collection: BaseCollection.createCollection('users', User),
        collections: {
          locations: BaseCollection.createCollection("locations", Location)
        }
      }).show();
      $('.user, .legend').hide();

      $('.acc-item.toggle').click(function(){
        window.location.href = '/';
      })
    }

  })

  var init = function(){
    new Router();
    Backbone.history.start({pushState: true});
  }

  var deps = [],
      resolveDependency = function(name){
        deps.push(name);
        if (deps.length == 2){
          init();
        }
      }

  ymaps.ready(function(){
    resolveDependency('yandex maps');
  })

  $(function(){
    resolveDependency('dom');
  })

  return {};

}());
