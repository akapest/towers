/**
 * require()
 */
$(function(){
  var events = Backbone;
  var acc = $('.accordion');

  window.initAccordion = function(){
    acc.find('.acc-item-data').hide();

    acc.find('.toggle').data('state', false);

    acc.find('.acc-item').click(function(e){

      if ($(e.target).hasClass('acc-item-name') == false) return;

      acc.find('.acc-item').removeClass("active")

      var item = $(this);
      var itemData = item.find('.acc-item-data');

      if (!itemData.length){
        acc.find('.acc-item-data').hide();//others
        return;
      }
      if (itemData.is(':hidden')){

        acc.find('.acc-item-data').hide();//others
        item.addClass("active")
        itemData.show();
        events.trigger('change:accordion', item.data('type'))

      } else {
        itemData.hide();
      }
      e.stopPropagation();
    });

    acc.find('.toggle').click(function(e){
      var $el = $(this);
      var state = !$el.data('state');
      var $actions = $('.acc-item')
      if (state){
        $actions.show();
        $el.find('span').text('◁')

      } else {
        $actions.hide();
        $el.find('span').text('▷')
        $actions.css('min-width', '55px')
      }
      $el.data('state', state);
      $el.show(); //always
      events.trigger('toggle:accordion', state)
      e.preventDefault();
    })

  }
  window.accSelect = function(id){
    var $el = $('.acc-item.toggle')
    $el.data('state', true);
    var $actions = $('.acc-item')
    $actions.show();
    $el.find('span').text('▷')
    $el.find('span').css('font-size', '')
    if (!$('.acc-item.' + id).hasClass("active")){
      $('.acc-item.' + id + ' .acc-item-name').click();
    }

  }

  window.accSelectWithoutEvents = function(el){
    acc.find('.acc-item').removeClass("active");
    acc.find('.acc-item-data').hide();
    el.addClass("active");
    el.find('.acc-item-data').show();
  }

});
