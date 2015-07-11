var config = require('views/config');

module.exports = (function(){

  var templatesCache = {};

  var Template = Backbone.Model.extend({
    execute: function(data){
      return executeTemplate(this.get('src'), data)
    }
  })

  var get = function(name){

    if (config.isProd){
      var deferred = new $.Deferred();

      if (templatesCache[name]){
          deferred.resolve(templatesCache[name])
      }
      var $template = $('#template-' + name)

      if (!$template.length){
        deferred.reject('template not found:', name)
      } else {
        templatesCache[name] = new Template({src:$template.html()})
        deferred.resolve(templatesCache[name])
      }
      return deferred

    } else {
      return $.get('/rest/templates/' + name + '.html').pipe(function(src){
        return new Template({src:src});
      });
    }
  }

  return {get: get};

  function executeTemplate(template, data){
    return _.template(template, data, {interpolate: /\!\{(.+?)\}/g});
  }



}());
