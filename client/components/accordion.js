/**
 * require()
 */
$(function(){
  var events = Backbone;

  window.initAccordion = function(){
    $('.accordion .toggle').data('state', false)

    $('.accordion .action-name').click(function(){
      $('.action').removeClass("active")
      var actionForm = $(this).siblings('form')
      if (!actionForm.length){
        $('.action form').hide();//others
        return;
      }
      var element = $(this).parent(".action")
      var hidden = actionForm.is(':hidden');

      if (hidden){
        $('.action form').hide();//others
        actionForm.show();
        element.addClass("active")
        events.trigger('change:accordion', element.data('type'))

      } else {
        actionForm.hide();
      }
    });

    $('.accordion .toggle').click(function(){
      var $el = $(this);
      var state = !$el.data('state');
      var $actions = $('.action')
      if (state){
        $actions.show();
        $el.find('span').text('▶')
        $el.find('span').removeClass('big')

      } else {
        $actions.hide();
        $el.find('span').text('◀')
        $el.find('span').addClass('big')
        $actions.css('min-width','55px')
      }
      $el.data('state', state);
      $el.show(); //always
      events.trigger('toggle:accordion', state)
    })

  }
  window.accSelect = function(id){
    var $el =  $('.action.toggle')
    $el.data('state', true);
    var $actions = $('.action')
    $actions.show();
    $el.find('span').text('▶')
    $el.find('span').css('font-size', '')
    if (!$('.action.' + id).hasClass("active")){
      $('.action.' + id + ' .action-name').click();
    }

  }

});
