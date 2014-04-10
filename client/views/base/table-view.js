/**
 * require(views/base/view)
 * require(views/base/field-view)
 * require(models/freq)
 */
(function(){

  var TableModel = Backbone.Model.extend({
  })

  window.TableView = View.extend({

    events: {
      'click td' : 'onCellClick'
    },

    initialize: function(options){
      this.options = options;
      this.template = getTemplate('table');
      this.model = new TableModel();
      this.model.on('change:td', _.bind(function(){
        this.openInput();
      }, this));
    },

    render: function(){
      this.renderAsync();
      return this;
    },

    renderAsync: function(){
      this.template.done(_.bind(function(t){
        var model = {
          fields: new Freq().fields,
          collection: this.collection.models
        };
        var html = _.template(t, model, {interpolate: /\!\{(.+?)\}/g})
        this.$el.html(html);
        return this;
      }, this))
    },

    onCellClick: function(e){
      var td = $(e.currentTarget),
          field = td.data('field'),
          cid = td.parent('tr').data('model-cid');

      this.model.set({model: this.collection.get(cid), field: field, td: td})
    },

    openInput: function(){
      var td = this.model.get('td'),
        field = this.model.get('field'),
        model = this.model.get('model'),
        value = model.get(field);

      var input = $('<input type="text">');
      td.html(input);
      input.val(value);
      new FieldView({
        $el: input,
        field: field,
        model: model
      })

      //save prev model
      var prevModel = this.model.previous('model');
      if (prevModel){
        model.save();
      }

      //destroy previous input
      var previous = this.model.get('input')
      if (previous){
        var val = previous.val();
        previous.parent().html(val);
        previous.remove()
      }

      //set new
      this.model.set('input', input);
    }

  });



}());
