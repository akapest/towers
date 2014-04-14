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
    },

    users: function(){
      new TableView({
        el: $('#list'),
        collection: createCollection('users', User)
      }).show();

      $('.user').hide();
      $('.legend').hide();
    }

  })

  $(function(){
    var router = new Router();
    Backbone.history.start({pushState: true});
  })

}());
