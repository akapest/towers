/**
 * require(views/base/View)
 * require(views/base/FieldView)
 * require(models/Freq)
 */
(function(){

  window.TableView = View.extend({

    events: {
      'click .add': 'addModel',
      'click .remove': 'removeModel',
      'click .edit': 'editModel'
    },

    initialize: function(options){
      this.options = options;
      this.fields = this.collection.fields;
      this.tableTemplate = getTemplate('table');
      this.trTemplate = getTemplate('tr');
      $('body').click(_.bind(function(){
        console.log('body click');
        this.closeInput();
      }, this));
    },

    render: function(){
      this.renderAsync();
      return this;
    },

    renderAsync: function(){
      var collectionP = this.collection.fetch();
      return $.when(this.tableTemplate, this.trTemplate, collectionP).done(_.bind(function(t, trTemplate){
        var model = {
          fields: this.fields,
          collection: this.collection.models,
          trTemplate: trTemplate
        };
        var html = t.execute(model);
        this.$el.html(html);
        return this;
      }, this))
    },

    addModel: function(e){
      this.trTemplate.done(_.bind(function(t){
        var model = new this.collection.model();
        var tr = t.execute({
          model: model,
          fields: this.fields
        })
        this.collection.add(model);
        this.$('tbody').append(tr);
        setTimeout(_.bind(function(){
          this.$('tbody').find('tr:last').find('td:first').click();
        }, this))
      }, this));
    },

    removeModel: function(e){
      var td = $(e.currentTarget),
          model = this._getModel(td);
      if (model){
        if (confirm('Действительно удалить данные?')){
          td.parent('tr').remove();
          model.destroy();
        }
      }
    },

    editModel: function(e){
      var td = $(e.currentTarget),
          field = td.data('field'),
          model = this._getModel(td),
          fieldChanged = field && this.field != field,
          modelChanged = model && this.model != model;

      if (fieldChanged || modelChanged){
        console.log('cell click');
        this.closeInput();
        this.model = model;
        this.field = field;
        this.td = td;
        var input = this.createInput();
      }
      e.stopPropagation();
    },

    saveModel: function(){
      if (this.model && this.model.hasChanged()){
        this.model.save();
      }
    },

    createInput: function(){
      var td = this.td,
          field = this.field,
          model = this.model,
          value = model.get(field);

      var input = $('<input type="text">');
      td.html(input);
      input.val(value);
      this.fieldView = new FieldView({
        $el: input,
        field: field,
        model: model
      })
      input.focus();
      return input;
    },

    closeInput: function(){
      this.saveModel();
      this.closeFieldView();
      this.model = null;
      this.field = null;
      this.td = null;
    },

    closeFieldView: function(){
      if (this.fieldView){
        var input = this.fieldView.getInput();
        var val = input.val();
        input.parent().html(val);
        input.remove()
        this.fieldView.remove();
        this.fieldView = null;
      }
    },

    _getModel: function(td){
      var cid = td.parent('tr').data('model-cid');
      return this.collection.get(cid);
    }


  });


}());
