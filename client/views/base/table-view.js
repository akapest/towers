/**
 * require(views/base/view)
 * require(views/base/field-view)
 * require(models/freq)
 */
(function(){

  window.TableView = View.extend({

    events: {
      'click td' : 'onCellClick'
    },

    initialize: function(options){
      this.options = options;
      this.template = getTemplate('table');
//      $('body').click(_.bind(function(){
//        console.log('body click');
//        this.closeInput();
//      }, this));
    },

    render: function(){
      this.renderAsync();
      return this;
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var model = {
          fields: new Freq().fields,
          collection: this.collection.models
        };
        var html = t.execute(model);
        this.$el.html(html);
        return this;
      }, this))
    },

    onCellClick: function(e){
      var td = $(e.currentTarget),
          field = td.data('field'),
          cid = td.parent('tr').data('model-cid'),
          model = this.collection.get(cid);

      if (field && cid && this.model.cid != cid && this.field != field){
        console.log('cell click');
        this.closeInput();
        this.model = model;
        this.field = field;
        this.td = td;
        this.openInput();
        e.stopPropagation();
      }
    },

    openInput: function(){
      var td = this.td,
        field = this.field,
        model = this.model,
        value = model.get(field);

      var input = $('<input type="text">');
      td.html(input);
      input.val(value);
      this.field = new FieldView({
        $el: input,
        field: field,
        model: model
      })
    },

    closeInput: function(){
      if (this.model){
        this.model.save();
      }
      this.model = null;
      this.field = null;
      this.td = null;
      if (this.field){
        var input = this.field.getInput();
        var val = input.val();
        input.parent().html(val);
        input.remove()
        this.field.remove();
        this.field = null;
      }
    }

  });



}());
