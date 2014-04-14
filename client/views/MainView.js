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

  var towers = createCollection('towers', Tower);
  var freqs = createCollection('freqs', Freq, { comparator:function(el){return parseFloat(el.get('value'))} });
  
  var mainView = null,
      state,
      map;

  window.MainView = View.extend({
    
    initialize: function(){
      var self = this;
      state = state = new State();
      this.views = {
        'tower': new TowerView({el: '.action.tower', model:state, freqs:freqs, type:'tower'  }),
        'highway': new HighwayView({el: '.action.highway', model:state, freqs:freqs, type:'highway' }),
        'legend': new LegendView({freqs:freqs, el:'.legend'})
      }
      this.towersPromise = towers.fetch();
      ymaps.ready(function(){
        map = new MapView({model:state, freqs:freqs});
        map.on('create', function(){
          console.log('event:map.create')
          var tower = new Tower(state)
          if (tower.validate()){
            self.getCurrentView().bindColor();
            towers.add(tower)
            tower.save();
            map.drawTower(tower)
          } else {
            alert('Необходимо задать частоту!')
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
      var self = this;
      Backbone.on('change:accordion', function(type){
        state.set('type', type)
        var angle = this.views[type].getAngle();
        state.set('angle', angle);
      });

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
