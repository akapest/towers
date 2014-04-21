/**
 * require(components/accordion)
 * require(models/Tower)
 * require(models/Location)
 * require(models/Freq)
 * require(views/forms/TowerView)
 * require(views/forms/LocationView)
 * require(views/forms/LocationsView)
 * require(views/forms/LegendView)
 * require(views/MapView)
 */
(function(){


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
      towers = createCollection('towers', Tower, {}, startLocation ? startLocation.get('towers') :[])

      var self = this;
      var views = this.views = {
        'tower': new TowerView({el: '.acc-item.tower', freqs: freqs, type: 'tower'  }),
        'highway': new TowerView({el: '.acc-item.highway', freqs: freqs, type: 'highway' }),
        'location': new LocationView({el: '.acc-item.location', locations: locations }),
        'towersList': new ListView({el: '.acc-item.towers-list', collection: towers, name: 'Вышки'}),
        'locationsList': new LocationsView({el: '.acc-item.locations-list', collection: locations, active: locations.first(), name: 'Локации'}),
        'legend': new LegendView({el: '.legend', freqs: freqs})
      }
      ymaps.ready(function(){
        map = new MapView({freqs: freqs, locations: locations, center: startLocation ? startLocation.get('start') : 0 });
        map.on('create', function(model){
          console.log('event:map.create')

          model.isTower() ? towers.add(model) : locations.add(model);
          model.save({validate: false});
          map.draw(model)

          var view = self.getCurrentView(),
              newModel = view.createModel();
          view.setModel(newModel);
          map.setModel(newModel);
        })
        map.on('click', function(){
          accSelect(type);
        })
        Backbone.trigger('show:locations', true)
        locations.trigger('change:active', locations.first());
      })

      locations.on('change:active', _.bind(function(loc){
        if (loc){
          this.views['towersList'].setCollection(loc.getTowers());
        }
      }, this))

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
      Backbone.on('change:accordion', _.bind(function(type_){
        if (type_ != 'tower' && type_ != 'highway' && type_ != 'location'){
          return;
        }
        type = type_;
        var view = this.views[type];
        if (view.getModel){
          map.setModel(view.getModel());
        }
      }, this));

      $('.accordion').on('hover', function(e){
        e.preventDefault();
        return false;
      });
    },

    getCurrentView: function(){
      return this.views[type];
    }

  });

  window.MainView.get = function(){
    if (!mainView)
      mainView = new MainView();
    return mainView;
  }


}())
