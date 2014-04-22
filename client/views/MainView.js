/**
 * require(components/accordion)
 * require(models/Tower)
 * require(models/Location)
 * require(models/Freq)
 * require(views/forms/TowerView)
 * require(views/forms/LocationView)
 * require(views/forms/TowersView)
 * require(views/forms/LocationsView)
 * require(views/forms/LegendView)
 * require(views/MapView)
 */
(function(){


  var state = window.state = new State();

  var towers;
  var freqs;
  var locations;

  var mainView = null,
      type,
      map;

  window.MainView = View.extend({

    initialize: function(){
      freqs = createCollection('freqs', Freq, { comparator: function(el){
        return parseFloat(el.get('value'))
      }});
      locations = createCollection('locations', Location);
      var startLocation = locations.first();

      state.set({
        location: startLocation,
        locations: locations,
        freqs: freqs
      })

      this.views = {
        'towersList': new TowersView({el: '.acc-item.towers-list', name: 'Вышки'}),
        'locationsList': new LocationsView({el: '.acc-item.locations-list', collection: locations, name: 'Локации'}),
        'legend': new LegendView({el: '.legend'})
      }
      ymaps.ready(_.bind(function(){
        map = window.map = new MapView({freqs: freqs, locations: locations});

        map.on('create', _.bind(function(model){
          if (model.isTower()){
            state.get('location').getTowers().add(model);
            accSelectWithoutEvents($('.acc-item:eq(2)'));

          } else {
            state.set('location', model)
            locations.add(model);
            accSelectWithoutEvents($('.acc-item:eq(1)'));
          }
          if (this.modelView){
            this.modelView.remove();
          }
        }, this))
        map.on('click', function(){
          //accSelect(type);
        })
        Backbone.trigger('show:locations', true)
      }, this))

      state.on('change:editModel', _.bind(function(state, model){

        if (this.modelView){
          this.modelView.remove();
        }
        var view = this.modelView = model.isTower() ? new TowerView({freqs:freqs, model:model}) : new LocationView({model:model});
        this.modelView.renderAsync().done(function(){
          var $el = $('.item-view')
          $el.html(view.$el);
          accSelectWithoutEvents($el);
        });
        map.setModel(model);

      }, this));
    },

    render: function(){
      var self = this,
          promises = [];

      _.each(this.views, function(view){
        if (view.render) view.render();
        if (view.renderAsync){
          promises.push(view.renderAsync());
        }
      });
      $.when.apply($, promises).then(function(){
        self.initAccordion();
      })

      freqs.on('change', function(){
//        map.removeTowers()
//        map.drawTowers(towers)
      })
    },

    initAccordion: function(){
      window.initAccordion();
//      Backbone.on('change:accordion', _.bind(function(type_){
//        if (type_ != 'tower' && type_ != 'highway' && type_ != 'location'){
//          return;
//        }
//        type = type_;
//        var view = this.views[type];
//        if (view.getModel){
//          map.setModel(view.getModel());
//        }
//      }, this));
      $('.accordion').on('hover', function(e){
        e.preventDefault();
        return false;
      });
    }

  });

  window.MainView.get = function(){
    if (!mainView)
      mainView = new MainView();
    return mainView;
  }


}())
