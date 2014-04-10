/**
 * require(vendor/backbone)
 */
(function(){

  window.Freq = Backbone.Model.extend({
    url:'freqs',
    fields:[
      { name:'value',
        label: 'Частота' },
      { name:'color',
        label: 'Цвет' },
      { name:'type',
        label: 'Тип' }],
    initialize: function(){
    },
    save: function(){
      var url = this.url + '?' + $.param({freq:this.toJSON()});
      Backbone.Model.prototype.save.call(this,null, {url:url})
    }
  });


}());
