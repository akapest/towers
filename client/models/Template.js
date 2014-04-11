/**
 * require(vendor/backbone)
 */
(function(){

  var Template = Backbone.Model.extend({
    execute: function(data){
      return executeTemplate(this.get('src'), data)
    }
  })

  window.getTemplate = function(name){

    return $.get('/rest/templates/' + name + '.html').pipe(function(src){

      return new Template({src:src});
    });
  }

  window.executeTemplate = function(template, data){
    return _.template(template, data, {interpolate: /\!\{(.+?)\}/g});
  }


}());
