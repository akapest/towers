/**
 * require()
 */
(function(){

  window.getTemplate = function(name){

    return $.get('/rest/templates/' + name + '.html');
  }




}());
