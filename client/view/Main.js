
$(function(){

  var events = Backbone;

  function onActionClick(){
    $('.action-wrap').removeClass("active")
    var actionForm = $(this).siblings('form')
    var element = $(this).parent(".action-wrap")
    var hidden = actionForm.is(':hidden');
    if (hidden){
      $('.action-wrap form').hide();//others
      actionForm.show();
      element.addClass("active")
      events.trigger('change:accordion', actionForm)

    } else {
      actionForm.hide();
    }

  }
  $('.accordion .action').click(onActionClick)

  var mapView = new MapView();

  $('select.angle').change(function(){
    mapView.setAngle($(this).val()*Math.PI/360)
  })

  events.on('change:accordion', function(){

  })

  TowerView =

//

//

  mapView.on('create:sector', function(sector){

    var modal = $('.create-tower').modal();

    var tower = Tower.create(sector, modal);

    mapView.drawTower(tower);
  })


})

