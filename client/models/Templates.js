
module.exports = (function(){

  var Template = Backbone.Model.extend({
    execute: function(data){
      return executeTemplate(this.get('src'), data)
    }
  })

  var get = function(name){

    return $.get('/rest/templates/' + name + '.html').pipe(function(src){

      return new Template({src:src});
    });
  }

  return {get: get};

  function executeTemplate(template, data){
    return _.template(template, data, {interpolate: /\!\{(.+?)\}/g});
  }


}());
