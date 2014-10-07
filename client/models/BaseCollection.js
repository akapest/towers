/**
 * require(vendor/backbone)
 */
(function(){

  function reverseString(input){
    var str = input.toLowerCase();
    str = str.split("");
    str = _.map(str, function(letter) {
      return String.fromCharCode(-(letter.charCodeAt(0)));
    });
    return str;
  }


  var BaseCollection = Backbone.Collection.extend({

    setSort: function(opts){
      opts = opts || {}
      var attr = opts.attr || 'name',
          dir = opts.dir || (!this.sortOpts || this.sortOpts.attr != attr) ? 'asc' : (this.sortOpts.dir == 'asc') ? 'desc' : 'asc'

      this.comparator = function(el){
        var value = el.get(attr)
        if (dir == 'asc'){
          return value
        } else {
          return (attr == 'freq') ? -value : reverseString(value)
        }
      }
      this.sortOpts = {
        attr: attr,
        dir: dir
      };

    }

  })

  window.createCollection = function(name, model, options, models){

    models = models || getBootstrapData(name);
    var collection = new (BaseCollection.extend({
      model: model
    }))(models, options)
    collection.fields = (new model()).fields;
    collection.setSort()
    collection.sort()
    return collection;

    function getBootstrapData(name){
      try {
        return JSON.parse($('.data-holder.' + name).html())
      } catch (e){
        return [];
      }
    }
  }

}());