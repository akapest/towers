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

  var towers = new (Backbone.Collection.extend({
    url:'towers',
    model:Tower
  }))([]);
  var freqs = new (Backbone.Collection.extend({
    url:'freqs',
    model:Freq
  }))([], {
    comparator:function(el){return parseFloat(el.get('value'))}
  });

  ymaps.ready(function(){

    var state = new State();

    var map = new MapView({model:state});
    var views = {
      'tower': new TowerView({model:state, freqs:freqs, type:'tower'  }),
      'highway': new HighwayView({model:state, freqs:freqs, type:'highway' }),
      'legend': new LegendView({freqs:freqs, $el:$('.legend')})
    }

    $('.action.tower').html(views.tower.render().$el)
    $('.action.highway').html(views.highway.render().$el)

    initAccordion();

    towers.fetch({success:function(){
      towers.each(function(tower){
        map.drawTower(tower);
      })
    }});

    map.on('create', function(){
      console.log('event:map.create')
      var tower = new Tower(state)
      if (tower.validate()){
        towers.add(tower)
        tower.save();
        map.drawTower(tower)
        state.reset();
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

  })

})
