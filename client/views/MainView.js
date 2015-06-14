var accordion = require('components/accordion');
var BaseCollection = require('models/BaseCollection');
var Point = require('models/Point');
var Tower = require('models/Tower');
var Location = require('models/Location');
var Freq = require('models/Freq');
var State = require('models/State');
var View = require('views/base/View');
var TowerView = require('views/forms/TowerView');
var LocationView = require('views/forms/LocationView');
var TowersView = require('views/forms/TowersView');
var LocationsView = require('views/forms/LocationsView');
var PointsView = require('views/forms/PointsView');
var LegendView = require('views/forms/LegendView');
var MapView = require('views/MapView');
var createCollection = BaseCollection.createCollection;

module.exports = (function(){


  var state = window.state = new State();

  var towers;
  var freqs;
  var locations;
  var points;

  var mainView = null,
      map;

  var MainView = View.extend({

    initialize: function(){
      freqs = createCollection('freqs', Freq, { comparator: function(el){
        return parseFloat(el.get('value'))
      }});
      locations = createCollection('locations', Location);
      points = createCollection('points', Point);
      state.set({
        locations: locations,
        freqs: freqs,
        location: locations.first(),
        points: points,
        showLocations: true,
        showPoints: true
      })
      this.views = {
        'towersList': new TowersView({el: '.acc-item.towers-list', name: 'Вышки'}),
        'locationsList': new LocationsView({el: '.acc-item.locations-list', collection: locations, name: 'Локации'}),
        'pointsList': new PointsView({el: '.acc-item.points-list', name: 'Точки'})
      }
      new LegendView({el: '.legend'})

      var view = null;
      state.on('change:editModel', _.bind(function(state, model){
        view && view.remove();
        if (!model) {
          var prevModel = state.getPreviousEditModel();
          var number = prevModel.is('point') ? 3 : prevModel.is('tower') ? 2 : 1;
          accSelectWithoutEvents($('.acc-item:eq(' + number +  ' )'));
        } else {
          view = model.is('tower') ? new TowerView({freqs:freqs, model:model}) : (model.is('location')? new LocationView({model:model}): null);
          view && view.renderAsync().done(function(){
            var $el = $('.item-view')
            $el.html(view.$el);
            accSelectWithoutEvents($el);
          });
          var type = model.url.replace(/s$/, '');
          state.set(type, model)
          model.on('sync', function(){
            state.trigger('sync:' + type, state, model)
          })
        }
        map.setModel(model);
      }, this));
    },

    render: function(){
      this.initViews();
      this.initFreqs();
    },

    initViews: function(){
      var maps = new $.Deferred();

      var promises = []
      ymaps.ready(function(){
        maps.resolve()
      })
      promises.push(maps)
      _.each(this.views, function(view){
        if (view.render) view.render();
        if (view.renderAsync){
          promises.push(view.renderAsync());
        }
      });

      $.when.apply($, promises).then(_.bind(function(){
        map = window.map = new MapView({
          freqs: freqs,
          locations: locations
        });

        this.initAccordion();

        var location = state.get('location');
        if (location){
          setTimeout(function(){
            state.trigger('change:location', state, location)
          })
        }
      }, this));
    },

    initFreqs: function(){
      freqs.on('change', function(freq, b, c){
        var towers = state.get('location').getTowers();
        var filtered = towers.filter(function(tower){
          return tower.getFreq_().cid == freq.cid
        });
        setTimeout(function(){
          map.redrawTowers(_(filtered))
        })
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

  MainView.get = function(){
    if (!mainView)
      mainView = new MainView();
    return mainView;
  }

  return MainView;


}())
