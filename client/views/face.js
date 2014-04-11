/**
 * require(components/accordion)
 * require(models/state)
 * require(models/tower)
 * require(models/freq)
 * require(views/tower-view)
 * require(views/legend-view)
 * require(views/map-view)
 */
$(function(){

  function freqModels(){
    var rslt = $('.data-holder.freqs').html();
    return JSON.parse(rslt)
  }

  var towers = new (Backbone.Collection.extend({
    url:'towers',
    model:Tower
  }))([]);
  var freqs = new (Backbone.Collection.extend({
    url:'freqs',
    model:Freq
  }))(freqModels(), {
    comparator:function(el){return parseFloat(el.get('value'))}
  });

  ymaps.ready(function(){

    var state = new State();
    var map = new MapView({model:state, freqs:freqs});
    var views = {
      'tower': new TowerView({el: '.action.tower', model:state, freqs:freqs, type:'tower'  }),
      'highway': new HighwayView({el: '.action.highway', model:state, freqs:freqs, type:'highway' }),
      'legend': new LegendView({freqs:freqs, el:'.legend'})
    }

    var promises = [];
    _.each(views, function(view){
      if (view.render) view.render();
      if (view.renderAsync){
        promises.push(view.renderAsync());
      }
    });

    $.when.apply($, promises).then(function(){
      initAccordion();
    })


    towers.fetch({success:function(){
      map.drawTowers(towers)
    }});

    freqs.on('change', function(){
      map.removeAll();
      map.drawTowers(towers)
    })

    map.on('create', function(){
      console.log('event:map.create')
      var tower = new Tower(state)
      if (tower.validate()){
        currentView().bindColor();
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

    Backbone.on('change:accordion', function(type){
      state.set('type', type)
      var angle = views[type].getAngle();
      state.set('angle', angle);
    });

    window.getState = function(){return state}

    $('.accordion').on('hover',function(e){
      e.preventDefault();
      return false;
    });

    function currentView(){
      return views[state.get('type')];
    }

    new TableView({
      el: $('#list'),
      collection: freqs
    }).render();

  })

})
