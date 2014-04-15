/**
 * require(components/accordion)
 * require(models/State)
 * require(models/Tower)
 * require(models/Freq)
 * require(views/TowerView)
 * require(views/LegendView)
 * require(views/MapView)
 */
(function(){

  window.createCollection = function(url, model, options){
    var models = getBootstrapData(url);
    var collection = new (Backbone.Collection.extend({
      url:'rest/' + url,
      model:model
    }))(models, options)
    collection.fields = (new model()).fields;
    return collection;

    function getBootstrapData(name){
      try {
        return JSON.parse($('.data-holder.'+ name).html())
      } catch (e) {
        return [];
      }
    }
  }

  var towers;
  var freqs;
  var locations;
  
  var mainView = null,
      state,
      map;

  window.MainView = View.extend({
    
    initialize: function(){
      towers = createCollection('towers', Tower);
      freqs = createCollection('freqs', Freq, { comparator:function(el){return parseFloat(el.get('value'))} });
      locations = createCollection('locations', Location);

      var self = this;
      state = state = new State();
      this.views = {
        'tower': new TowerView({el: '.action.tower', model:state, freqs:freqs, type:'tower'  }),
        'highway': new HighwayView({el: '.action.highway', model:state, freqs:freqs, type:'highway' }),
        'location': new LocationView({el: '.action.location', model:state}),
        'legend': new LegendView({freqs:freqs, el:'.legend'})
      }
      this.towersPromise = towers.fetch();
      ymaps.ready(function(){
        map = new MapView({model:state, freqs:freqs});
        map.on('create', function(){
          console.log('event:map.create')
          if (state.get('type') != 'location'){
            var tower = new Tower(state)
            if (tower.isValid()){
              self.getCurrentView().bindColor();
              towers.add(tower)
              debugger
              tower.save();
              map.drawTower(tower)
            } else {
              alert(tower.validate())
            }
          } else {
            var location = new Location(state);
            locations.add(location);
            location.save();
          }

        })
        map.on('click', function(){
          console.log('event:map.click')
          accSelect(state.get('type'));
        })
        self.towersPromise.done(function(){
          map.drawTowers(towers)
        });
      })
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
        map.removeAll();
        map.drawTowers(towers)
      })
    },
    
    initAccordion: function(){
      window.initAccordion();
      Backbone.on('change:accordion', _.bind(function(type){
        state.set('type', type)
        var view = this.views[type]
        if (view.getAngle){
          state.set({angle:view.getAngle()}, {silent:true});
        }
      }, this));

      $('.accordion').on('hover',function(e){
        e.preventDefault();
        return false;
      });
    },

    getCurrentView: function(){
      return this.views[state.get('type')];
    }

  });

  window.MainView.get = function(){
    if (!mainView)
      mainView = new MainView();
    return mainView;
  }


}())
