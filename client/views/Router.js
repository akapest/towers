/**
 * require(views/MainView)
 * require(views/base/TableView)
 */
(function(){

  window.Router = Backbone.Router.extend({

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
        collection: createCollection('users', User),
        collections: {
          locations: createCollection("locations", Location)
        }
      }).show();

      $('.user').hide();
      $('.legend').hide();
      $('.acc-item.toggle').click(function(){
        window.location.href = '/';
      })
    }

  })

  $(function(){
    var router = new Router();
    Backbone.history.start({pushState: true});
  })

}());
