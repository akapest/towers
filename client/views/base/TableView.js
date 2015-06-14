var View = require('views/base/View');
var FieldView = require('views/base/FieldView');
var Freq = require('models/Freq');
var Templates = require('models/Templates');

module.exports = (function(){

  return View.extend({

    events: {
      'click .add': 'addModel',
      'click .remove': 'removeModel',
      'click .edit': 'editModel'
    },

    initialize: function(options){
      this.options = options;
      this.fields = this.collection.fields;
      this.collections = this.options.collections;
      this.tableTemplate = Templates.get('table');
      this.trTemplate = Templates.get('tr');
      _.bindAll(this, ['inputHandler', 'closeInput']);
      this.bindEvent($('body'), 'click', this.closeInput);
      this.save = true;
    },

    render: function(){
      this.renderAsync();
      return this;
    },

    remove: function(){
      View.prototype.remove.call(this);
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
        this.closeInput();
        this.model = model;
        this.field = field;
        this.td = td;
        var input = this.createInput();
        this.bindEvent(input, 'keydown', this.inputHandler);
        setTimeout(function(){
          input.focus();
        })

      }
      e.stopPropagation();
    },

    saveModel: function(){
      if (this.model && this.model.hasChanged()){
        this.model.save();
      }
      this.save = true;
    },

    createInput: function(){
      var td = this.td,
          field = this.field,
          model = this.model,
          value = model.get(field);

      var input = null;
      var inputType = this._getField(field).input;
      switch (inputType) {
        case 'textarea':{
          input= $('<textarea>');
          break;
        }
        case 'select-multiple':{
          if (!this.collections || !this.collections[field]) throw new Error('Collection for field ' + field + ' not defined')
          input = $('<select>')
          input.attr('multiple', 'multiple')
          this.collections[field].each(function(el){
            var opt = $('<option>');
            opt.attr('value', el.get('name'))
            opt.html(el.get('name'))
            input.append(opt);
          })
          setTimeout(function(){
            input.select2({
              allowClear:true,
              width: '200px'
            })
          })

          break;
        }
        default:
          input = $('<input>');
      }
      td.html(input);
      input.val(value);
      this.fieldView = new FieldView({
        $el: input,
        field: field,
        model: model
      })
      return input;
    },

    closeInput: function(){
      if (this.save){
        this.saveModel();
      }
      this.closeFieldView();
      this.model = null;
      this.field = null;
      this.td = null;
    },

    closeFieldView: function(){
      if (this.fieldView){
        var input = this.fieldView.getInput();
        input.parent().html(this.model.getV(this.field));
        input.remove()
        this.fieldView.remove();
        this.fieldView = null;
      }
    },

    _getModel: function(td){
      var cid = td.parent('tr').data('model-cid');
      return this.collection.get(cid);
    },

    inputHandler: function(e){
      var key = e.which;
      switch (key){
        case ENTER:
        {
          this.closeInput();
          break;
        }
        case ESC:
        {
          this.save = false;
          this.closeInput();
          break;
        }
        case TAB:
        {
          var next = this._getNextCell();
          if (next.length){
            next.click()
          } else {
            this.closeInput();
          }
        }
      }
    },

    _getNextCell: function(){
      var index = this.td.index(),
          nextIndex = index + 1,
          editableCells = this.td.parent().children('.edit');
      if (nextIndex < editableCells.length){
        return $(editableCells.get(nextIndex));

      } else {
        var trIndex = this.td.parent('tr').index(),
            nextTrIndex = trIndex + 1;
        return this.td.parents('tbody').children(':eq(' + nextTrIndex + ')').find('.edit:first');
      }
    },

    _getField: function(name){
      return _.find(this.fields, function(el){
        return el.name == name;
      })
    }

  });

  var ENTER = 13,
      ESC = 27,
      TAB = 9;

}());
