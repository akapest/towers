/**
 * require(components/accordion)
 * require(models/Tower)
 * require(models/Location)
 * require(models/Freq)
 * require(views/forms/TowerView)
 * require(views/forms/LocationView)
 * require(views/forms/TowersView)
 * require(views/forms/LocationsView)
 * require(views/forms/PointsView)
 * require(views/forms/LegendView)
 * require(views/MapView)
 */
(function(){


  var state = window.state = new State();

  var towers;
  var freqs;
  var locations;

  var mainView = null,
      map;

  window.MainView = View.extend({

    initialize: function(){
      freqs = createCollection('freqs', Freq, { comparator: function(el){
        return parseFloat(el.get('value'))
      }});
      locations = createCollection('locations', Location);
      var startLocation = locations.first();
      state.set({
        locations: locations,
        freqs: freqs,
        location: startLocation
      })

      this.views = {
        'towersList': new TowersView({el: '.acc-item.towers-list', name: 'Вышки'}),
        'locationsList': new LocationsView({el: '.acc-item.locations-list', collection: locations, name: 'Локации'}),
        'pointsList': new PointsView({el: '.acc-item.points-list', name: 'Точки'})
      }
      new LegendView({el: '.legend'})
      ymaps.ready(_.bind(function(){
        map = window.map = new MapView({
          freqs: freqs,
          locations: locations
        });
        if (startLocation){
          state.trigger('change:location')
        }
        Backbone.trigger('show:locations', true)
      }, this))
      var view = null;
      state.on('change:editModel', _.bind(function(state, model){
        view && view.remove();
        if (!model) {
          accSelectWithoutEvents($('.acc-item:eq(' + (state.getPreviousEditModel().isTower() ? 2 : 1) +  ' )'));
        } else {
          view = model.isTower() ? new TowerView({freqs:freqs, model:model}) : (model.is('location')? new LocationView({model:model}): null);
          view && view.renderAsync().done(function(){
            var $el = $('.item-view')
            $el.html(view.$el);
            accSelectWithoutEvents($el);
          });
        }
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

      freqs.on('change', function(freq, b, c){
        var towers = state.get('location').getTowers();
        var filtered = towers.filter(function(tower){
          return tower.getFreq_().cid == freq.cid
        });
        map.redrawTowers(_(filtered))
      })
    },

    initAccordion: function(){
      window.initAccordion();
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
