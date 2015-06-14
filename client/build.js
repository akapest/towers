(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/zdespolit/projects/towers/client/views/Router.js":[function(require,module,exports){
var MainView = require('views/MainView');
var TableView = require('views/base/TableView');

module.exports = (function(){

  var Router = Backbone.Router.extend({

    routes: {
      '': 'main',
      'users': 'users'
    },

    main: function(){
      MainView.get().show();
      $('#users-list').hide();
    },

    users: function(){
      var $users = $('#users-list')
      $users.show();
      new TableView({
        el: $users,
        collection: BaseCollection.createCollection('users', User),
        collections: {
          locations: BaseCollection.createCollection("locations", Location)
        }
      }).show();
      $('.user, .legend').hide();

      $('.acc-item.toggle').click(function(){
        window.location.href = '/';
      })
    }

  })

  var init = function(){
    new Router();
    Backbone.history.start({pushState: true});
  }

  var deps = [],
      resolveDependency = function(name){
        deps.push(name);
        if (deps.length == 2){
          init();
        }
      }

  ymaps.ready(function(){
    resolveDependency('yandex maps');
  })

  $(function(){
    resolveDependency('dom');
  })

  return {};

}());

},{"views/MainView":"/home/zdespolit/projects/towers/node_modules/views/MainView.js","views/base/TableView":"/home/zdespolit/projects/towers/node_modules/views/base/TableView.js"}],"/home/zdespolit/projects/towers/node_modules/components/accordion.js":[function(require,module,exports){

$(function(){
  var events = Backbone;
  var acc = $('.accordion');

  window.initAccordion = function(){
    acc.find('.acc-item-data').hide();

    acc.find('.toggle').data('state', false);

    acc.find('.acc-item').click(function(e){

      if ($(e.target).hasClass('acc-item-name') == false) return;

      acc.find('.acc-item').removeClass("active")

      var item = $(this);
      var itemData = item.find('.acc-item-data');

      if (!itemData.length){
        acc.find('.acc-item-data').hide();//others
        return;
      }
      if (itemData.is(':hidden')){

        acc.find('.acc-item-data').hide();//others
        item.addClass("active")
        itemData.show();
        events.trigger('change:accordion', item.data('type'))

      } else {
        itemData.hide();
      }
      e.stopPropagation();
    });

    acc.find('.toggle').click(function(e){
      var $el = $(this);
      var state = !$el.data('state');
      var $actions = $('.acc-item')
      if (state){
        $actions.show();
        $el.find('span').text('◁')

      } else {
        $actions.hide();
        $el.find('span').text('▷')
        $actions.css('min-width', '55px')
      }
      $el.data('state', state);
      $el.show(); //always
      events.trigger('toggle:accordion', state)
      e.preventDefault();
    })

  }
  window.accSelect = function(id){
    var $el = $('.acc-item.toggle')
    $el.data('state', true);
    var $actions = $('.acc-item')
    $actions.show();
    $el.find('span').text('▷')
    $el.find('span').css('font-size', '')
    if (!$('.acc-item.' + id).hasClass("active")){
      $('.acc-item.' + id + ' .acc-item-name').click();
    }

  }

  window.accSelectWithoutEvents = function(el){
    acc.find('.acc-item').removeClass("active");
    acc.find('.acc-item-data').hide();
    el.addClass("active");
    el.find('.acc-item-data').show();
  }

});

},{}],"/home/zdespolit/projects/towers/node_modules/models/BaseCollection.js":[function(require,module,exports){

module.exports = (function(){

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

  BaseCollection.createCollection = function(name, model, options, models){

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
        console.warn('no data for collection "' + name + ' "found')
        return [];
      }
    }
  }

  return BaseCollection;

}());
},{}],"/home/zdespolit/projects/towers/node_modules/models/BaseModel.js":[function(require,module,exports){

module.exports = (function(){

  return Backbone.Model.extend({

    _getName: function(){
      return this.name || this.url.replace(/s$/, '');
    },

    save: function(opts){
      opts = opts || {};
      var data = {};
      data[this._getName()] = this._toJSON ? this._toJSON () : this.toJSON();
      opts.url = '/rest/' + this.url + '?' + $.param(data);
      Backbone.Model.prototype.save.call(this, null, opts)
      this.changed = {};
      this.markToRevert();
    },

    set: function(){
      return Backbone.Model.prototype.set.apply(this,arguments);
    },

    markToRevert: function(){
      this.restoreAttributes = _.clone(this.attributes);
    },

    revert: function(){
      if (this.restoreAttributes){
        this.set(this.restoreAttributes, {silent:true});
      }
    },

    //get view presentation of attribute
    getV: function(attr){
      return this.get(attr); //by default
    },

    destroy: function(){
      Backbone.Model.prototype.destroy.call(this, {url:'/rest/' + this.url + '/' + this.id})
    },

    __validate: function(fields){
      var errors = null;
      _.each(fields, _.bind(function(field){
        var error = '';
        if (_.isString(field)){
          if (!this.get(field)) {
            error = 'Обязательное поле';
          }
        } else if (_.isObject(field)){
          var value = this.get(field.name);
          error = field.validate(value);

        } else {
          console.log(field);
          throw new Error("Unsupported obj type.")
        }
        if (error){
          var event = 'invalid:'+ (field.name || field);
          console.log('trigger ' + event)
          this.trigger(event, error);
          errors = errors || {};
          errors[field] = error;
        }

      }, this));

      return errors;
    }

  });


}());

},{}],"/home/zdespolit/projects/towers/node_modules/models/Freq.js":[function(require,module,exports){
var BaseModel = require('models/BaseModel');

module.exports = (function(){

  return BaseModel.extend({

    url: 'freqs',
    fields: [
      {
        name: 'value',
        label: 'Частота'
      },
      {
        name: 'color',
        label: 'Цвет'
      },
      {
        name: 'type',
        label: 'Тип'
      }
    ],

    shouldShow: function(){
      return this.get('show') !== false;
    },

    isShown: function(){
      return this.shouldShow()
    },

    switchVisibility: function(){
      this.set({
        show: !this.shouldShow()
      });
    }

  });


}());

},{"models/BaseModel":"/home/zdespolit/projects/towers/node_modules/models/BaseModel.js"}],"/home/zdespolit/projects/towers/node_modules/models/GeoObject.js":[function(require,module,exports){
var BaseModel = require('models/BaseModel');

module.exports = (function(){

  return BaseModel.extend({

    fields: [
      {
        name: 'name',
        label: 'Название'
      },
      {
        name: 'comment',
        label: 'Комментарий'
      }
    ],

    initialize: function(attrs, opts){
      if (attrs){
        attrs = this.parse(attrs);
        this.set(attrs);
      }
    },

    _toJSON: function(){
      var result = _.clone(this.attributes);
      result.start = arrayToPoint(result.start);
      if (result.end && this.is && this.is('highway')){
        result.end = arrayToPoint(result.end);
      } else {
        delete result.end;
      }
      delete result._towers;
      delete result.towers;
      return result;
    },

    parse: function(attrs){
      if (!attrs) return
      if (attrs.start){
        attrs.start = pointToArray(attrs.start)
      }
      if (attrs.end){
        attrs.end = pointToArray(attrs.end)
        attrs.type = attrs.type || 'highway';
      }
      if (attrs.comment){
        attrs.comment = attrs.comment.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      }
      return attrs;
    },

    validate: function(){
      var id = this.id
      return this.__validate([
        'name', //required
        {
          name: 'name',
          validate: function(name){
            var loc = state.get('locations').find(function(el){
              return el.get('name') == name && el.id != id;
            });
            if (loc) return 'Не уникальное название';
          }
        }
      ])
    }

  });

  function pointToArray(point){
    if (!point) return null;
    if (_.isArray(point)) return point;
    return [point.latitude, point.longitude]
  }
  function arrayToPoint(array){
    if (!array) return {latitude:null,longitude:null}
    return {
      latitude: array[0],
      longitude: array[1]
    }
  }

}());

},{"models/BaseModel":"/home/zdespolit/projects/towers/node_modules/models/BaseModel.js"}],"/home/zdespolit/projects/towers/node_modules/models/Location.js":[function(require,module,exports){
var BaseModel = require('models/BaseModel');
var BaseCollection = require('models/BaseCollection');
var GeoObject = require('models/GeoObject');
var Tower = require('models/Tower');

module.exports = (function(){

  return GeoObject.extend({

    url: 'locations',

    fields: [
      {
        name: 'name',
        label: 'Название'
      },
      {
        name: 'comment',
        label: 'Комментарий'
      }
    ],

    initialize: function(attrs, opts){
      if (attrs){
        attrs = this.parse(attrs);
        this.set(attrs);
      }
    },

    is: function(type){
      return type == 'location';
    },

    isTower: function(){
      return this.is('tower');
    },

    _toJSON: function(){
      var result = _.clone(this.attributes);
      result.start = arrayToPoint(result.start);
      if (result.end && this.is && this.is('highway')){
        result.end = arrayToPoint(result.end);
      } else {
        delete result.end;
      }
      delete result._towers;
      delete result.towers;
      return result;
    },

    parse: function(attrs){
      if (!attrs) return
      if (attrs.start){
        attrs.start = pointToArray(attrs.start)
      }
      if (attrs.end){
        attrs.end = pointToArray(attrs.end)
        attrs.type = attrs.type || 'highway';
      }
      if (attrs.comment){
        attrs.comment = attrs.comment.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      }
      return attrs;
    },

    validate: function(){
      var id = this.id
      return this.__validate([
        'name', //required
        {
          name: 'name',
          validate: function(name){
            var loc = state.get('locations').find(function(el){
              return el.get('name') == name && el.id != id;
            });
            if (loc) return 'Не уникальное название';
          }
        }
      ])
    },

    getTowers: function(){
      if (!this.get('_towers')){
        var towers = BaseCollection.createCollection('towers', Tower, {}, this.get('towers'));
        this.set({_towers:towers});
      } else {
        towers = this.get('_towers');
      }
      return towers;
    },

    getPoints: function(){
      var id = this.get('id');
      var arr = state.get('points').filter(function(el){
        return el.get('locationId') == id
      })
      return _(arr)
    },

    getName: function(){
      return this.get('name') || 'Новая локация'
    }

  });

  function pointToArray(point){
    if (!point) return null;
    if (_.isArray(point)) return point;
    return [point.latitude, point.longitude]
  }
  function arrayToPoint(array){
    if (!array) return {latitude:null,longitude:null}
    return {
      latitude: array[0],
      longitude: array[1]
    }
  }

}());

},{"models/BaseCollection":"/home/zdespolit/projects/towers/node_modules/models/BaseCollection.js","models/BaseModel":"/home/zdespolit/projects/towers/node_modules/models/BaseModel.js","models/GeoObject":"/home/zdespolit/projects/towers/node_modules/models/GeoObject.js","models/Tower":"/home/zdespolit/projects/towers/node_modules/models/Tower.js"}],"/home/zdespolit/projects/towers/node_modules/models/Point.js":[function(require,module,exports){
var GeoObject = require('models/Location');

module.exports = (function(){

  var name = '',
      pointRadius = 12;

  return GeoObject.extend({

    url: 'points',

    initialize: function(attrs){
      attrs = this.parse(attrs || {})
      this.set(attrs)
      this.set({radius: pointRadius})
    },

    getTower: function(){
      var location = state.get('locations').get(this.get('locationId'))
      return location.getTowers().get(this.get("towerId"))
    },

    is: function(type){
      return type == 'point';
    },

    validate: function(){
      return null;
    },

    setName: function(){
      this.set({name: name || 'без имени'})
    }

  }, {
    setName: function(value){
      name = value
    }
  })

}());
},{"models/Location":"/home/zdespolit/projects/towers/node_modules/models/Location.js"}],"/home/zdespolit/projects/towers/node_modules/models/State.js":[function(require,module,exports){

module.exports = (function(){

  return State = Backbone.Model.extend({

    fields:[
      'locations',
      'location',
      'tower',
      'freqs',
      'editModel'
    ],

    initialize: function(){
      this.on('change:editModel', _.bind(function(state, model){
        if (model){
          this.previous = model;
        }
      }, this))
    },

    getPreviousEditModel : function(){
      return this.previous;
    }

//    ,trigger: function(event){
//      console.log(event)
//      Backbone.Model.prototype.trigger.apply(this, arguments)
//    }

  })


}());

},{}],"/home/zdespolit/projects/towers/node_modules/models/Templates.js":[function(require,module,exports){

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

},{}],"/home/zdespolit/projects/towers/node_modules/models/Tower.js":[function(require,module,exports){
var GeoObject = require('models/GeoObject');
var Point = require('models/Point');

module.exports = (function(){

  var angles = {
    tower: ['60°', '90°', '120°', '360°'],
    highway: ["15'", "20'", "30'"]
  }

  var Tower = GeoObject.extend({

    url: 'towers',

    fields: [
      {name: 'angle',
        label: 'Угол'},
      {name: 'name',
        label: 'Название'},
      {name: 'freq',
        type: 'float',
        label: 'Частота'
        },
      {name: 'comment',
        label: 'Комментарий'},
        'type',
        'color'
    ],
    fields2: [
      'start',
      'radius',
      'azimuth',
      'end'
      ],

    initialize: function(attrs){
      if (attrs){
        attrs = this.parse(attrs);
        if (!attrs.angle){ //set default angle
          if (!attrs.type)
            throw new Error("Unable to determine tower type. " + attrs);
          else
            attrs.angle = angles[attrs.type][0];
        }
        this.set(attrs)
      }
      this.on('change:type', _.bind(function(){
        this.set('angle', angles[this.get('type')][0])
      }, this))
    },

    getName: function(){
      if (!this.get('name')){
        return 'Новая ' + (this.isHighway() ? 'точка-точка' : 'вышка');
      } else {
        return (this.isHighway() ? 'Точка-точка' : 'Вышка')  + ' ' + this.get('name');
      }
    },

    _isNew: function(){
      return !this.get('radius')
    },

    getPoints: function(){
      var id = this.get('id')
      var arr = state.get('points').filter(function(el){
        return el.get('towerId') == id
      })
      return _(arr)
    },

    getColor: function(){
      return this.getFreq_().get('color')
    },

    getFreq_: function(){
      var freq = parseFloat(this.get('freq'));
      var result = state.get('freqs').findWhere({value: freq})
      if (!result){
        console.error("freq not found: " + freq)
      } else {
        return result
      }
    },

    updateColor: function(){
      var freq = this.getFreq_();
      this.set({color: freq.get('color')})
    },

    //возвращает true, если объект вышка или точка-точка
    isTower: function(){
      return true;
    },

    is: function(type){
      return this.get("type") == type;
    },

    isHighway: function(){
      return this.is('highway')
    },

    validate: function(){
      return this.__validate(['freq', 'name']);//required
    }

  })

  Tower.angles = angles;

  return Tower;

}());

},{"models/GeoObject":"/home/zdespolit/projects/towers/node_modules/models/GeoObject.js","models/Point":"/home/zdespolit/projects/towers/node_modules/models/Point.js"}],"/home/zdespolit/projects/towers/node_modules/views/MainView.js":[function(require,module,exports){
var accordion = require('components/accordion');
var BaseCollection = require('models/BaseCollection');
var Point = require('models/Point');
var Tower = require('models/Tower');
var Location = require('models/Location');
var Freq = require('models/Freq');
var State = require('models/State');
var View = require('views/base/View');
var TowerView = require('views/forms/TowerView');
var LocationView = require('views/forms/LocationView');
var TowersView = require('views/forms/TowersView');
var LocationsView = require('views/forms/LocationsView');
var PointsView = require('views/forms/PointsView');
var LegendView = require('views/forms/LegendView');
var MapView = require('views/MapView');
var createCollection = BaseCollection.createCollection;

module.exports = (function(){


  var state = window.state = new State();

  var towers;
  var freqs;
  var locations;
  var points;

  var mainView = null,
      map;

  var MainView = View.extend({

    initialize: function(){
      freqs = createCollection('freqs', Freq, { comparator: function(el){
        return parseFloat(el.get('value'))
      }});
      locations = createCollection('locations', Location);
      points = createCollection('points', Point);
      state.set({
        locations: locations,
        freqs: freqs,
        location: locations.first(),
        points: points,
        showLocations: true,
        showPoints: true
      })
      this.views = {
        'towersList': new TowersView({el: '.acc-item.towers-list', name: 'Вышки'}),
        'locationsList': new LocationsView({el: '.acc-item.locations-list', collection: locations, name: 'Локации'}),
        'pointsList': new PointsView({el: '.acc-item.points-list', name: 'Точки'})
      }
      new LegendView({el: '.legend'})

      var view = null;
      state.on('change:editModel', _.bind(function(state, model){
        view && view.remove();
        if (!model) {
          var prevModel = state.getPreviousEditModel();
          var number = prevModel.is('point') ? 3 : prevModel.is('tower') ? 2 : 1;
          accSelectWithoutEvents($('.acc-item:eq(' + number +  ' )'));
        } else {
          view = model.is('tower') ? new TowerView({freqs:freqs, model:model}) : (model.is('location')? new LocationView({model:model}): null);
          view && view.renderAsync().done(function(){
            var $el = $('.item-view')
            $el.html(view.$el);
            accSelectWithoutEvents($el);
          });
          var type = model.url.replace(/s$/, '');
          state.set(type, model)
          model.on('sync', function(){
            state.trigger('sync:' + type, state, model)
          })
        }
        map.setModel(model);
      }, this));
    },

    render: function(){
      this.initViews();
      this.initFreqs();
    },

    initViews: function(){
      var maps = new $.Deferred();

      var promises = []
      ymaps.ready(function(){
        maps.resolve()
      })
      promises.push(maps)
      _.each(this.views, function(view){
        if (view.render) view.render();
        if (view.renderAsync){
          promises.push(view.renderAsync());
        }
      });

      $.when.apply($, promises).then(_.bind(function(){
        map = window.map = new MapView({
          freqs: freqs,
          locations: locations
        });

        this.initAccordion();

        var location = state.get('location');
        if (location){
          setTimeout(function(){
            state.trigger('change:location', state, location)
          })
        }
      }, this));
    },

    initFreqs: function(){
      freqs.on('change', function(freq, b, c){
        var towers = state.get('location').getTowers();
        var filtered = towers.filter(function(tower){
          return tower.getFreq_().cid == freq.cid
        });
        setTimeout(function(){
          map.redrawTowers(_(filtered))
        })
      })
    },

    initAccordion: function(){
      window.initAccordion();
      $('.accordion').on('hover', function(e){
        e.preventDefault();
        return false;
      });
    }

  });

  MainView.get = function(){
    if (!mainView)
      mainView = new MainView();
    return mainView;
  }

  return MainView;


}())

},{"components/accordion":"/home/zdespolit/projects/towers/node_modules/components/accordion.js","models/BaseCollection":"/home/zdespolit/projects/towers/node_modules/models/BaseCollection.js","models/Freq":"/home/zdespolit/projects/towers/node_modules/models/Freq.js","models/Location":"/home/zdespolit/projects/towers/node_modules/models/Location.js","models/Point":"/home/zdespolit/projects/towers/node_modules/models/Point.js","models/State":"/home/zdespolit/projects/towers/node_modules/models/State.js","models/Tower":"/home/zdespolit/projects/towers/node_modules/models/Tower.js","views/MapView":"/home/zdespolit/projects/towers/node_modules/views/MapView.js","views/base/View":"/home/zdespolit/projects/towers/node_modules/views/base/View.js","views/forms/LegendView":"/home/zdespolit/projects/towers/node_modules/views/forms/LegendView.js","views/forms/LocationView":"/home/zdespolit/projects/towers/node_modules/views/forms/LocationView.js","views/forms/LocationsView":"/home/zdespolit/projects/towers/node_modules/views/forms/LocationsView.js","views/forms/PointsView":"/home/zdespolit/projects/towers/node_modules/views/forms/PointsView.js","views/forms/TowerView":"/home/zdespolit/projects/towers/node_modules/views/forms/TowerView.js","views/forms/TowersView":"/home/zdespolit/projects/towers/node_modules/views/forms/TowersView.js"}],"/home/zdespolit/projects/towers/node_modules/views/MapView.js":[function(require,module,exports){
var Tower = require('models/Tower');
var Location = require('models/Location');
var Sector = require('views/map/Sector');
var Geo = require('views/map/Geo');

module.exports = (function(){

  var ymaps = window.ymaps;
  var map = null;

  var Circle = function(data){
    this.data = data;
  }
  Circle.prototype.remove = function(){
    map.geoObjects.remove(this.data);
  }

  return Backbone.View.extend({

    initialize: function(){
      this.model = null;
      this.towersGeoObjects = {};
      this.locationGeoObjects = {};
      this.pointsGeoObjects = {};
      this.initMap();
      this.bindEvents();
    },

    initMap: function(){
      if (map) map.destroy();
      var center = state.get('location') ? state.get('location').get('start') : null;
      map = new ymaps.Map('map', {
        center: center || [56.8, 60.7],
        zoom: 10,
        controls: ['searchControl', 'typeSelector',  'fullscreenControl', 'rulerControl'],
        behaviors: ['default', 'scrollZoom']
      });
      map.options.set('scrollZoomSpeed', 5);
      map.events.add('click', this.onClick, this);
      map.events.add('mousemove', _.throttle(this.onHover, 50), this);
      console.log(map.events)
      map.controls.add('zoomControl', { left: 5, bottom: 15 })
//      map.controls.add('typeSelector', {left: 150, bottom: 15}) // Список типов карты
//      map.controls.add('mapTools', { left: 35, bottom: 15 }); // Стандартный набор кнопок
//    вариант контролов сверху
//      map.controls.add('zoomControl', { right: 5, top: 35 })
//          .add('typeSelector', {right: 35, top: 65}) // Список типов карты
//          .add('mapTools', { right: 35, top: 35 }); // Стандартный набор кнопок   ]
      this.drawLocations()
    },

    bindEvents: function(){
      document.addEventListener('keyup', _.bind(this.keyUpListener, this));

      Backbone.on('update:location', _.bind(function(model){
        this.removeLocation(model)
        this.drawLocation(model)
      }, this));

      state.get("locations").on('remove', _.bind(function(model){
        this.removeLocation(model);
      }, this))

      var duration = 300;

      this.listenTo(state, 'click:object', function(object){
        if (object && object.get('start')){
          map.panTo(object.get('start'),{delay:0, duration:duration});
          setTimeout(_.bind(function(){
            if (object.isTower() && this.getTower(object.cid)){
              this.getTower(object.cid).openBalloon();
            } else if (object.is('point')){
              this.showPointHint(object)
            }
          }, this), duration + 50)
        }
      }, this)

      this.listenTo(state, 'change:location', function(){
        var active = state.get('location')
        if (!active) return;
        this.removeTowers();
        this.removePoints();
        this.destroyCurrentObject(); //if any

        if (active.isNew()) return;

        var self = this;
        setTimeout(function(){
          active.getTowers().on('destroy', function(m){
            var object = self.towersGeoObjects[m.cid];
            if (object) object.remove();
          })
          setTimeout(function(){
            self.drawTowers(active.getTowers());
            self.drawPoints();
          }, duration + 50)
        })
      }, this)

      this.listenTo(state, 'change:showLocations', function(state,  val){
       this.drawLocations()
      }, this);

      this.listenTo(state, 'change:showPoints', function(){
        this.drawPoints();
      }, this)

      this.listenTo(state.get('points'), 'destroy', function(model){
        var object = this.pointsGeoObjects[model.cid];
        if (object) object.remove();
      }, this)

      this.listenTo(state, 'redraw:point', function(model){
        var object = this.pointsGeoObjects[model.cid];
        if (object) object.remove();
        this.drawPoint(model)
      }, this)
    },

    /**
     * Устанавливает объект, созданием или редактированием к-го занимается пользователь в текущий момент.
     * Может быть вышкой или локацией.
     */
    setModel: function(model){
      this.model = model;
      this.destroyCurrentObject(); //if any
    },

    keyUpListener: function(e){
      if (e.keyCode == 27){ //ESC
        if (this.model){
          this.model.set({
            start: null,
            end: null
          });
        }
        this.destroyCurrentObject();
      }
    },

    destroyCurrentObject: function(){
      if (this.object){
        this.object.remove();
        this.object = null;
      }
    },

    fitsToLocation: function(start){
      var location = state.get('location');
      var distance = Geo.getDistance(start, location.get('start'));
      return distance <= location.get('radius');
    },

    onClick: function(e){
      console.log('click')
      if (!this.model) return;
      var model = this.model;
      var point = e.get('coords');
      if (!model.get('start')){
        var start = point;
        if (model.isTower()){
          if (!this.fitsToLocation(start)){
            alert('Данная точка не принадлежит текущей локации.')
            start = null;
          }
        }
        model.set({start: start});
        if (model.is('point')){
          model.setName()
          model.save({validate: false});
          this.draw(model)
          state.get('points').add(model);
          state.set('editModel', null)
        }

      } else {
        if (model.isTower()){
          this.setEnd(point);
        }
        if (model.isValid()){
          model.trigger('beforeSave')
          model.save({validate: false});
          this.draw(model)
          if (model.isTower()){
            state.get('location').getTowers().add(model);

          } else if (model.is('location')){
            state.set('location', model)
            state.get('locations').add(model);
          }
          state.set('editModel', null)
        }
      }
      this.trigger('click')
    },

    onHover: function(e){
      console.log('hover')
      if (!this.model) return;
      if (!this.model.get('start')) return;
      var end = e.get('coords'),
          _end = this.model.get('end');
      if (_end
          && Math.abs(_end[0] - end[0]) < 0.0001
          && Math.abs(_end[1] - end[1]) < 0.0001){
        return;
      }
      this.setEnd(end);

      var previous = this.object;

      if (this.model.isTower()){
        this.object = new Sector(this.model.get('start'), this.model.attributes, map, {raw:true});
      } else if (this.model.is('location')){
        this.object = this.drawLocation(this.model);
      } else {
        this.object = this.drawPoint(this.model, {edit: true});
      }
      this.object.render && this.object.render();
      if (previous){
        previous.remove();
      }
    },

    setEnd: function(end){
      var radius = Geo.getDistance(this.model.get('start'), end);
      if (this.model.is('tower')){
        radius = Math.min(radius, 15000);
      }
      this.model.set({
        azimuth: Geo.getAzimuth(this.model.get('start'), end),
        radius: radius,
        end: end
      });
    },

    draw: function(model){
      if (model.isTower()){
        if (!model._isNew()){ //если правка уже существующей вышки
          this.removeTower(model);
        }
        this.drawTower(model);

      } else if (model.is('location')){
        this.drawLocation(model);

      } else {
        this.drawPoint(model);
      }
    },

    removeTower: function(model){
      if (model.isHighway()){
        this.removeTowerObj(model.cid + '0');
        this.removeTowerObj(model.cid + '1');
      } else {
        this.removeTowerObj(model.cid);
      }
    },

    removeTowerObj: function(id){
      var object = this.towersGeoObjects[id];
      object && object.remove();
    },

    removeLocation: function(model){
      var arr = this.locationGeoObjects[model.cid];
      arr && _.each(arr, function(el){
        el.remove()
      });
    },

    getTower: function(cid){
      return this.towersGeoObjects[cid];
    },

    drawTower: function(tower){
      if (tower.is('highway')){
        this.towersGeoObjects[tower.cid + '0'] = new Sector(tower.get('start'), tower.attributes, map).render();
        var attrs = _.clone(tower.attributes),
            a = attrs.azimuth;
        attrs.azimuth = a > 0 ? a - Math.PI : Math.PI + a;
        this.towersGeoObjects[tower.cid + '1'] = new Sector(tower.get('end'), attrs, map).render();
      } else {
        this.towersGeoObjects[tower.cid] = new Sector(tower.get('start'), tower.attributes, map).render();
      }
    },

    createCircle: function(model, options){
      var circle = new ymaps.Circle(
        [
          model.get('start'),
          model.get('radius')
        ],
        {},
        _.extend({
          interactivityModel: 'default#transparent',
          draggable: false
        }, options)
      );
      map.geoObjects.add(circle);
      var result = new Circle(circle);
      return result;
    },

    drawLocation: function(model){
      var result = this.createCircle(model, {
        fillColor: "#0000",
        strokeColor: "#83h",
        strokeOpacity: 0.4,
        strokeWidth: 2
      });
      this.locationGeoObjects[model.cid] = this.locationGeoObjects[model.cid] || [];
      this.locationGeoObjects[model.cid].push(result)
      return result;
    },

    drawPoints: function(){
      var value = state.get('showPoints'),
          self = this;
      if (value){
        var points = state.get('location').getPoints()
        points.each(function(point){
          self.drawPoint(point)
        });
      } else {
        this.removePoints()
      }
    },

    drawPoint: function(model, opts){
      opts = opts || {}
      var tower = model.getTower();
      var result = this.createCircle(model, {
        fillColor: tower.getColor(),
        strokeColor: tower.getColor(),
        strokeOpacity: 0.4,
        zIndex: 99999,
        opacity: model.is('point') ? 0.8 : 1
      });
      this.pointsGeoObjects[model.cid] = result

      if (!opts.edit){
        result.data.modelCid = model.cid
        result.data.events.add('mouseenter', _.bind(function (e) {
          var cid = e.get('target').modelCid;
          var point = state.get('points').get(cid)
          this.showPointHint(point)
        }, this))
        .add('mouseleave', function (e) {
            map.hint.close()
        });
      }
      return result;
    },

    showPointHint: function(point){
      map.hint.open(point.get('start'), point.getTower().get('name') + ' - ' + point.get('name'));
    },

    drawTowers: function(towers){
      towers.each(_.bind(function(tower){
        var freq = tower.getFreq_();
        if (freq.shouldShow()){
          tower.set('color', freq.get('color'));
          this.drawTower(tower);
        }
      }, this));
    },

    redrawTowers: function(towers){
      towers.each(_.bind(function(tower){
        this.removeTower(tower)
        if (tower.getFreq_().shouldShow()){
          tower.updateColor()
          this.drawTower(tower)
        }
      }, this))
    },

    isShown: function(tower){
      return this.towersGeoObjects[tower.cid] || this.towersGeoObjects[tower.cid + '0']
    },

    drawLocations: function(){
      var show = state.get('showLocations')
      this.removeLocations();
      if (show){
        state.get('locations').each(_.bind(function(loc){
          this.drawLocation(loc);
        }, this));
      }
    },

    removeAll: function(){
      this.removeLocations();
      this.removeTowers();
      this.removePoints();
    },

    removeTowers: function(){
      _.forOwn(this.towersGeoObjects, function(t){
        t.remove();
      });
      this.towersGeoObjects = {};
    },

    removeLocations: function(){
      _.each(this.locationGeoObjects, _.bind(function(arr){
        _.each(arr, function(el){
          el.remove()
        });
      }, this));
      this.locationGeoObjects = {};
    },

    removePoints: function(){
      _.each(this.pointsGeoObjects, function(point){
        point.remove();
      });
      this.pointsGeoObjects = {};
    }

  });

}());

},{"models/Location":"/home/zdespolit/projects/towers/node_modules/models/Location.js","models/Tower":"/home/zdespolit/projects/towers/node_modules/models/Tower.js","views/map/Geo":"/home/zdespolit/projects/towers/node_modules/views/map/Geo.js","views/map/Sector":"/home/zdespolit/projects/towers/node_modules/views/map/Sector.js"}],"/home/zdespolit/projects/towers/node_modules/views/base/FieldView.js":[function(require,module,exports){

module.exports = (function(){

  window.FieldView = Backbone.View.extend({

    initialize: function(opts){
      _.bindAll(this)
      var $input = this.$input = opts.$el;
      var field = this.fieldName = _.isString(opts.field) ? opts.field : opts.field.name;
      this.field = _.isObject(opts.field) ? opts.field : {name: field};
      var model = this.model = opts.model;
      if (!field)
        console.warn('Creating FieldView for "null" field');
      if (!$input.length)
        console.warn("No input found for field `" + field + "`");
      if (!model)
        console.warn('No model defined for field ' + field);
      this.bindField();
    },

    bindField: function(){
      this.isChanging = false;
      this.$input.on(this.getPropertyToListenTo(), this.inputChangeListener)
      this.model.on('change:' + this.fieldName, this.modelChangeListener)
      this.model.on('invalid:' + this.fieldName, this.invalidListener)
      this.setValue(this.model.get(this.fieldName))
    },

    inputChangeListener: function(){
      this.removeErrors();
      this.isChanging = true;
      var value = this.getRawValue();
      var current = this.model.get(this.fieldName)
      if (this.isValid(value)){
        var val = this.parseValue(value)
        var equals = current == val || _.isEqual(current, val);
        if (!equals){
          this.model.set(this.fieldName, value)
        }
      } else {
        this.model.set(this.fieldName, current) //revert back to previous value
        this.setValue(current)
      }
      this.isChanging = false
    },

    modelChangeListener: function(){
      if (!this.isChanging){
        this.setValue(this.model.get(this.fieldName))
      } else {
        // already changing - so do nothing
      }
    },

    invalidListener: function(msg){
      var group = this.$input.parents('.form-group')
      group.removeClass('has-error')
      this.setErrorMessage(msg)
      setTimeout(function(){
        group.addClass('has-error')
        group.addClass('force')
        setTimeout(function(){
          group.removeClass('force')
        })
      })
    },

    removeErrors: function(){
      var group = this.$input.parents('.form-group')
      group.removeClass('has-error')
      group.removeClass('force')
      this.setErrorMessage('')
    },

    remove: function(){
      this.$input.off(this.getPropertyToListenTo(), this.inputChangeListener)
      this.model.off('change:' + this.fieldName, this.modelChangeListener)
      this.model.off('invalid:' + this.fieldName, this.invalidListener)
      this.off()
    },

    getRawValue: function(){
      var $input = this.$input;
      var type = $input.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'select-one':
        case 'select-multiple':
        case 'color':
          return $input.val();
        case 'checkbox':
          return $input.is(':checked');
        default:
          throw new Error("Cant get value of `" + $input.selector + '`')
      }
    },

    getValue: function(){
      return this.parseValue(this.getRawValue());
    },


    getPropertyToListenTo: function(){
      var $input = this.$input;
      switch ($input.prop('type')){
        case 'text':
        case 'textarea':
          return 'keyup';
        case 'select-one':
        case 'select-multiple':
        case 'color':
        case 'checkbox':
          return 'change';
      }
      console.warn('Cant bind to field `' + this.fieldName + '`');
      return null;
    },

    parseValue: function(value){
      var expectedMethodName = 'parse' + this.fieldName[0].toUpperCase() + this.fieldName.substring(1);
      var prop = this.model[expectedMethodName]
      if (prop){
        if (_.isFunction(prop)){
          console.log('calling "' + expectedMethodName + '" on ' + this.toString())
          return prop.call(this, value)
        } else {
          console.log('property "' + expectedMethodName + '" registered, but is not a function');
        }
      }
      return value;
    },

    prepareValue: function(value){
      var expectedMethodName = 'prepare' + this.fieldName[0].toUpperCase() + this.fieldName.substring(1);
      var prop = this.model[expectedMethodName]
      if (prop){
        if (_.isFunction(prop)){
          console.log('calling "' + expectedMethodName + '" on ' + this.toString())
          return prop.call(this, value)
        } else {
          console.log('property "' + expectedMethodName + '" registered, but is not a function');
        }
      }
      return value;
    },

    setValue: function(v){
      var value = this.prepareValue(v),
          type = this.$input.prop('type');
      switch (type){
        case 'text':
        case 'textarea':
        case 'color':
        case 'select-one':
        case 'select-multiple':
          this.$input.val(value);
          break;
        case 'checkbox':
          this.$input.prop('checked', value);
          break;
        default:
          throw new Error("Cant set value to `" + this.$input.selector + '`')
      }
    },

    isValid: function(value){
      if (this.field.type){
        switch (this.field.type){
          case 'float':
            return !isNaN(value) || value.replace && !isNaN(value.replace(',', '.'));
          case 'int' :
            return !isNaN(value)
        }
      }
      return true;
    },

    getInput: function(){
      return this.$input;
    },

    setErrorMessage: function(msg){
      var el = this.formGroup().find('.error-msg');
      el.html(msg)
    },

    formGroup: function(){
      return this.$input.parents('.form-group');
    }



  })

}());

},{}],"/home/zdespolit/projects/towers/node_modules/views/base/ListView.js":[function(require,module,exports){
var View = require('views/base/View');

module.exports = (function(){

  return View.extend({

    _getModel: function($el){
      var cid = $el.parent('li').data('cid');
      return this.collection.get(cid);
    },

    events: {
      'click .list-el': function(e){
        var $el = $(e.currentTarget);
        var el = this.collection.get($el.data('cid'));
        this.__setActive(el, {$el:$el, click:true});
      },
      'mousedown .add': function(e){
        var $el = $(e.currentTarget);
        $el.addClass('active')
      },
      'click .add': function(e){
        var $el = $(e.currentTarget);
        $el.removeClass('active')
        var model = this._createModel();
        if (model){
          state.set('editModel', model);
          this.__setActive(model, {add:true, click:true});
        }
        e.stopPropagation();
        return false;
      },
      'click .remove': function(e){
        var $el = $(e.currentTarget);
        var model = this._getModel($el);
        if (this._canRemove(model) && confirm(this._removeMsg())){
          model.destroy();
        }
        e.stopPropagation();
        return false;
      },
      'click .edit': function(e){
        var $el = $(e.currentTarget);
        var model = this._getModel($el);
        this._editModel(model, $el)
        this.__setActive(model, {$el:$el, click:true})
      },

      'mouseenter .list-el': function(e){
        $(e.currentTarget).find('.glyphicon').show();
      },
      'mouseleave .list-el': function(e){
        $(e.currentTarget).find('.glyphicon').hide();
      },

      'change .show-locations': function(e){
        var $el = $(e.currentTarget);
        state.set('showLocations', $el.is(":checked"));
      },

      'mousedown .sort': function(e){
        var $el = $(e.currentTarget);
        $el.addClass('active');
      },

      'click .sort': function(e){
        var $el = $(e.currentTarget);
        var attr = $el.data('sort-attr');
        this.collection.setSort({attr: attr})
        this.collection.sort()
        $el.removeClass('active')
      }
    },

    bindToStateEvents: function(){
      this.stopListening(state, 'change:editModel')
      this.listenTo(state, 'change:editModel', _.bind(function(state){
        if (state.get('editModel') == null){
          if (state.getPreviousEditModel() && state.getPreviousEditModel().url == this._getType()){
            this.__dropActive();
          }
        }
      }, this))
      this.stopListening(state, 'sync:' + this._getType())
      this.listenTo(state, 'sync:' + this._getType(), _.bind(function(state, model){
        this.__setActive(model, {click:false})
      }, this))
    },

    renderAsync: function(){
      if (!this.collection) return;
      return this.templateP.done(_.bind(function(template){
        var display = this.$el.find('.acc-item-data').css('display');
        var html = template.execute(this._data())
        this.$el.html(html);
        this.$el.find('.acc-item-data').css('display', display);
        this.$el.find('.glyphicon').hide()
        this._afterRender();
        this.bindToStateEvents();
        this.delegateEvents();
      }, this));
    },

    setCollection: function(collection){
      if (this.collection){
        this.stopListening(this.collection)
      }
      this.collection = collection;
      this.listenTo(this.collection, 'add remove reset change sync sort', this.renderAsync);
      this.renderAsync();
    },

    _data: function(){
      var list = this.collection.map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid,
          freq: el.is('tower') ? el.get('freq') : '',
          color: el.is('tower') ? el.getColor() : ''
        }
      })
      return {
        name: this.name,
        type: this._getType(),
        list: list,
        sort: {
          name: this.mapSortOpts('name'),
          freq: this.mapSortOpts('freq')
        }
      }
    },

    mapSortOpts: function(attr){
      var opts = this.collection.sortOpts

      if (opts.attr == attr){
        return {
          dir: opts.dir == 'asc' ? 'down' : 'up',
          active: 'active'
        }
      } else {
        return {
          dir: 'down',
          active: ''
        }
      }
    },

    //to redefine in PointsView
    _editModel: function(model){
      state.set('editModel', model);
    },

    __setActive: function(el, opts){
      opts = opts || {}
      this.__dropActive();
      if (opts.add){
        opts.$el = this.$el.find('.add')
      }
      else if (!opts.$el){
        opts.$el = this.$el.find('li[data-cid="'+ el.cid +'"]')
      }
      opts.$el.addClass('active');
      if (opts.click){
        state.trigger('click:object', el)
        state.set(this._getType(), el);
      }
    },

    __dropActive: function(){
      this.$el.find('li').removeClass('active');
    },

    _createModel : function(){
      throw new Error('unimplemented')
    },

    _removeMsg: function(){
      throw new Error('unimplemented')
    },

    _canRemove: function(){
      return true;
    },

    _afterRender: function(){
    },

    _getType: function(){
      throw new Error("Type not defined")
    }


  })


}());

},{"views/base/View":"/home/zdespolit/projects/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/towers/node_modules/views/base/TableView.js":[function(require,module,exports){
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

},{"models/Freq":"/home/zdespolit/projects/towers/node_modules/models/Freq.js","models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","views/base/FieldView":"/home/zdespolit/projects/towers/node_modules/views/base/FieldView.js","views/base/View":"/home/zdespolit/projects/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/towers/node_modules/views/base/View.js":[function(require,module,exports){

module.exports = (function(){

  return Backbone.View.extend({

    fields: [],

    show: function(){
      if (!this.rendered){
        this.render();
        this.rendered = true;
      }
      this.$el.show();
    },

    hide: function(){
      this.$el.hide();
    },

    bindFields: function(fields){
      _.bindAll(this);
      if (!this.model){
        throw new Error("no model to bind to!")
      }
      if (!this.model.fields && !fields){
        throw new Error("no fields to bind to!")
      }
      var self = this;
      this.fields = {};
      _.each(this.model.fields || fields, function(field){

        var fName = _.isString(field) ? field : field.name;
        var $el = self.$('.'  + fName)
        if (!$el.length){
          console.warn("No input found for field `" + fName + "`")
        } else {
          self.fields[fName] = new FieldView({
            $el: $el,
            field: field,
            model: self.model
          })
        }
      })
    },

    unbindFields: function(){
      _.each(this.fields, function(fieldView){
        fieldView.remove();
      })
    },

    bindEvent: function($el, eventName, func){
      this.inputEvents = this.inputEvents || [];
      this.inputEvents.push({
        input: $el,
        name: eventName,
        func: func
      })
      $el.on(eventName, func);
    },

    remove: function(){
      this.unbindFields();
      _.each(this.inputEvents, function(el){
        el.input.off(el.name, el.func);
      });
      this.$el.html("");
      this.stopListening();
    },

    focus: function(selector){
      var $el = this.$(selector)
      setTimeout(function(){
        $el.focus();
      })
    }

  });

}());

},{}],"/home/zdespolit/projects/towers/node_modules/views/forms/LegendView.js":[function(require,module,exports){
var View = require('views/base/View');
var Templates = require('models/Templates');

module.exports = (function(){

  var t = '<li class="freq list-item"><input class="color" type="color" data-freq="${value}" value="${color}"></div><label>${value} Mhz</label></li>'

  return View.extend({

    events:{
      'click .toggle': function(){
        this.$('.form-body').toggle();
      },
      'change input[type="checkbox"]': function(e){
        var $el = $(e.currentTarget);
        if ($el.data('toggle-all')){
          this.toggleAll($el.is(":checked"))

        } else if ($el.data('toggle-points')){
          state.set('showPoints', $el.is(':checked'))

        } else {
          var cid = $el.data('freq-cid')
          var freq = state.get('freqs').get(cid)
          freq.switchVisibility()
        }
      },
      'change .color': 'onColorChange'
    },

    initialize: function(){
      _.bindAll(this)
      this.showAll = false;
      this.templatePromise = Templates.get('legend')
      this.freqs = state.get('freqs');
      this.freqs.each(function(freq){
        freq.set({show: false})
      })
      if (!this.freqs.length){
        this.$el.hide();
      }
      this.listenTo(this.freqs, 'add reset remove', this.render)
      this.listenTo(state, 'change:location', this.render)
      this.listenTo(state, 'change:location', this.listenToTowersAddition)
    },

    listenToTowersAddition: function(){
      var towers = state.get('location').getTowers();
      this.listenTo(towers, 'add', this.render)
    },

    render: function(){
      if (this.freqs.length){
        this.$el.show();
      }
      var freqs = this.freqs.filter(_.bind(function(freq){
        return this.has(freq)
      }, this));
      this.templatePromise.done(_.bind(function(t){
        var html = t.execute({
          freqs: freqs,
          showAll: this.showAll,
          showPoints: state.get('showPoints')
        });
        this.$el.html(html)
      }, this));
      return this;
    },

    has: function(freq){
      var towers = state.get('location').getTowers()
      for (var i = 0; i < towers.length; i++){
        var t = towers.at(i);
        if (t.get('freq') == freq.get('value')){
          return true;
        }
      }
      return false;
    },

    onColorChange: function(e){
      var $el = $(e.currentTarget);
      var freq = $el.data('freq')
      var model = this.freqs.findWhere({value:freq})
      model.set('color', $el.val())
      model.save()
      this.freqs.trigger('change', model)
    },

    toggleAll: function(show){
      state.set('showPoints', show)
      this.showAll = show;
      this.freqs.each(function(freq){
        freq.set({show:show})
      });
      this.$('input[type="checkbox"]').prop('checked', show)
    }

  });


}());

},{"models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","views/base/View":"/home/zdespolit/projects/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/towers/node_modules/views/forms/LocationView.js":[function(require,module,exports){
var View = require('views/base/View');
var Templates = require('models/Templates');

module.exports = (function(){

  return View.extend({

    events: {
      'click .remove': function(){
        this.model.revert();
        state.set('editModel', null);
      }
    },

    remove: function(){
      Backbone.trigger('update:location', this.model);
      View.prototype.remove.apply(this)
    },

    initialize: function(options){
      _.bindAll(this);
      this.options = options;
      this.locations = options.locations;
      this.template = Templates.get('location');
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var data = {
          name: this.model.getName()
        };
        var html = t.execute(data);
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.focus('.name');
      }, this));
    }

  })


}());

},{"models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","views/base/View":"/home/zdespolit/projects/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/towers/node_modules/views/forms/LocationsView.js":[function(require,module,exports){
var ListView = require('views/base/ListView');
var Location = require('models/Location');
var Templates = require('models/Templates');

module.exports = (function(){

  var bottom = '<div role="form" style=" height: 30px; ">\
              <label>Показать границы</label>\
              <input type="checkbox" class="show-locations" checked="checked" style=" margin:9px 0 0 5px;"/>\
           </div>';

  return ListView.extend({

    initialize: function(options){
      _.bindAll(this);
      this.name = options.name;
      this.templateP = Templates.get('locations');
      this.listenTo(this.collection, 'add remove reset change', this.renderAsync);
    },

    _afterRender: function(){
      var active = state.get('location')
      if (active == this.current){
        return;
      }
      this.current = active;
      if (active){
        this.$el.find('li[data-cid="'+ active.cid +'"]').addClass('active');
      }
      this.$('.show-locations').attr('checked', state.get('showLocations'))
    },

    _getType: function(){
      return 'location'
    },

    _createModel : function(){
      return new Location();
    },

    _removeMsg: function(){
      return "Удалить локацию?"
    },

    _canRemove: function(model){
      var canRemove = !model.getTowers() || model.getTowers().length == 0;
      if (!canRemove) alert('Чтобы удалить локацию, сперва нужно удалить все вышки.')
      return canRemove;
    }

  })


}());

},{"models/Location":"/home/zdespolit/projects/towers/node_modules/models/Location.js","models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","views/base/ListView":"/home/zdespolit/projects/towers/node_modules/views/base/ListView.js"}],"/home/zdespolit/projects/towers/node_modules/views/forms/PointsView.js":[function(require,module,exports){
var ListView = require('views/base/ListView');
var Point = require('models/Point');
var Templates = require('models/Templates');

module.exports = (function(){

  return ListView.extend({

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = Templates.get('list');
      this.listenTo(state, 'change:tower', function(state, tower){
        this.tower = tower;
        if (tower._isNew()){
          this.$el.hide()
        } else {
          this.setCollection(state.get('points'))
          this.$el.show()
        }
      }, this);
      this.listenTo(state, 'change:location', function(){
        this.$el.hide()
      }, this)
    },

    _data: function(){
      var towerId = this.tower.get('id');
      var filtered = this.collection.filter(function(el){
        return towerId == el.get('towerId')
      });
      var list = _(filtered).map(function(el){
        return {
          name: el.get('name'),
          cid: el.cid
        }
      });
      return {
        name:this.name,
        list: list.__wrapped__,
        sort: false
      }
    },

    _afterRender: function(){
      this.$('.list-more')
          .removeClass('hidden')
          .html('<div class="wrapper"><label title="Название следущей точки">Название</label><input type="text" class="point-name"/></div>')
      var $pointName = this.$('.point-name');
      $pointName
        .on('change', function(){
          Point.setName($(this).val())
        })
    },

    _editModel: function(model, $el){
      var li = $el.parent();

      var $input = $('<input class="edit-point-name" type="text"/>')
      $input.val(model.get('name'))
      var self = this

      var $ok = $('<span class="ok glyphicon glyphicon-ok" title="Готово">').hide()
        .on('click', function(){
          model.set({
            name: $input.val(),
            towerId: $select.val()
          })
          model.save()
          state.trigger('redraw:point', model)
          self._finishEditing(model, li)
        });

      var $cancel = $('<span class="cancel glyphicon glyphicon-remove" title="Отмена">').hide()
        .on('click', function(){
          self._finishEditing(model, li)
        });
      var $select = $('<select id="towerSelect" class=""></select>')
      state.get('location').getTowers().each(function(t){
        $select.append($('<option value="' + t.get('id') + '">' + t.get('name') + '</option>'))
      })
      $select.val(model.get('towerId'))
      li.children().remove()
      var div = $('<div class="wrapper">')
      div.append($input)
      div.append($cancel)
      div.append($ok)
      li.append(div)
      li.append($select)
      $select.select2()
    },

    _finishEditing: function(model, li){
      model.collection.sort()
      li.removeClass('wrapper')
    },

    _getType: function(){
      return 'point'
    },

    _createModel : function(){
      var tower = state.get('tower');
      if (!tower){
        alert("Не выбрана вышка");
        return false;
      }
      if (!tower.id){
        alert("Вышка не сохранена. Попробуйте еще раз.")
        return false;
      }
      return new Point({
        towerId: tower.get('id'),
        locationId: state.get('location').id
      });
    },

    _removeMsg: function(){
      return "Удалить точку?"
    }


  })


}());

},{"models/Point":"/home/zdespolit/projects/towers/node_modules/models/Point.js","models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","views/base/ListView":"/home/zdespolit/projects/towers/node_modules/views/base/ListView.js"}],"/home/zdespolit/projects/towers/node_modules/views/forms/TowerView.js":[function(require,module,exports){
var Freq = require('models/Freq');
var View = require('views/base/View');
var Templates = require('models/Templates');
var Tower = require('models/Tower');

module.exports = (function(){

  return View.extend({

    events: {
      'click .bind-color': 'bindColor',
      'click .remove': function(){
        this.model.revert();
        state.set('editModel', null);
      }
    },

    initialize: function(options){
      _.bindAll(this);
      this.freq = null;
      this.model = options.model;
      this.template = Templates.get('tower');
      this.listenTo(this.model, 'change:type', this.renderAsync)
      this.listenTo(this.model, 'beforeSave', this.bindColor)
    },

    renderAsync: function(){
      return this.template.done(_.bind(function(t){
        var data = {
          angles: Tower.angles[this.model.get('type')],
          name: this.model.getName()
        };
        var html = t.execute(data)
        this.$el.html(html);
        this.delegateEvents()
        this.bindFields();
        this.initFreqColor();
        this.afterRender();
        this.focus('.name');
      }, this));
    },

    remove: function(){
      this.bindColor();
      View.prototype.remove.apply(this, arguments);
    },

    afterRender: function(){
      var typeSelect = this.$('.type');
      if (!this.model.  isNew()){
        typeSelect.attr('disabled', 'disabled')
      }
    },

    initFreqColor: function(){
      var self = this;
      this.listenTo(this.model, 'change:color', function(model, color){
        if (!model.get('freq')) return;
        self.$('.bind-color').show();
      })
      var $color = this.$('.color');
      this.listenTo(this.model, 'change:freq', function(model, freq){
        if (!freq){
          self.$('.bind-color').hide();
          return;
        }
        if (self.freq){
          self.stopListening(self.freq)
        }
        var found = state.get('freqs').findWhere({value: parseFloat(freq)});
        if (found){
          self.freq = found;
          self.listenTo(self.freq, 'change:color', function(m, color){
            $color.val(color)
          });
          self.model.set('color', found.get('color'))
          self.$('.color').attr('disabled', 'disabled')
          self.$('.bind-color').hide();
        } else {
          self.$('.color').removeAttr('disabled', 'disabled')
          self.$('.bind-color').show();
        }
      })
    },

    bindColor: function(){
      if (this.$('.bind-color').is(':hidden')) return;
      if (this.freq){
        this.stopListening(this.freq)
      }
      var value = parseFloat(this.model.get('freq'))
      if (!value || state.get('freqs').findWhere({value: value})){
        return;
      }
      var $color = this.$('.color');
      var freq = new Freq({
        value: value,
        color: $color.val()
      })
      this.freq = freq;
      this.listenTo(freq, 'change:color', function(m, color){
        $color.val(color)
      });
      state.get('freqs').add(freq);
      freq.save();

      this.$('.bind-color').hide();
      $color.attr('disabled', 'disabled')

      console.log('bind color to freq ' + freq.get('value'));
    },


    getAngle: function(){
      return this.fields.angle.getValue();
    },

    setValue: function($el, fieldName){
      if (fieldName != 'angle'){
        this[fieldName].setValue.apply(this, arguments);
      }
    },

    toString: function(){
      return 'TowerView'
    }

  })


}());

},{"models/Freq":"/home/zdespolit/projects/towers/node_modules/models/Freq.js","models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","models/Tower":"/home/zdespolit/projects/towers/node_modules/models/Tower.js","views/base/View":"/home/zdespolit/projects/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/towers/node_modules/views/forms/TowersView.js":[function(require,module,exports){
var ListView = require('views/base/ListView');
var Templates = require('models/Templates');
var Tower = require('models/Tower');

module.exports = (function(){

  return ListView.extend({

    initialize: function(options){
      _.bindAll(this)
      this.name = options.name;
      this.templateP = Templates.get('list');
      state.on('change:location', _.bind(function(){
        var towers = state.get('location').getTowers();
        this.setCollection(towers)
      }, this));
    },

    _getType: function(){
      return 'tower'
    },

    _createModel : function(){
      if (!state.get('location')){
        alert("Не выбрана локация");
        return false;
      }
      if (!state.get('location').id){
        alert('Локация еще не сохранена. Попробуйте еще раз')
        return false;
      }
      return new Tower({
        type:'tower', // по-умолчанию вышка - бывает еще точка-точка
        locationId: state.get('location').id
      });
    },

    _removeMsg: function(){
      return "Удалить вышку?"
    }


  })


}());

},{"models/Templates":"/home/zdespolit/projects/towers/node_modules/models/Templates.js","models/Tower":"/home/zdespolit/projects/towers/node_modules/models/Tower.js","views/base/ListView":"/home/zdespolit/projects/towers/node_modules/views/base/ListView.js"}],"/home/zdespolit/projects/towers/node_modules/views/map/Geo.js":[function(require,module,exports){
module.exports = (function(){

  var geo = function(){
    return ymaps.coordSystem.geo;
  }

  return {

    getAzimuth: function(start, end){
      return this.azimuthFromDelta(geo().solveInverseProblem(start, end).startDirection);
    },

    getDistance: function(start, end){
      return geo().getDistance(start, end)
    },

    endPoint:function(start, azimuth, distance){
      return geo().solveDirectProblem(start, this.deltaFromAzimuth(azimuth), distance).endPoint;
    },

    azimuthFromDelta: function(delta){
      return Math.atan2(delta[0], delta[1])
    },

    deltaFromAzimuth: function(azimuth){
      with (Math){
        var delta = [sin(azimuth), cos(azimuth)]
      }
      return delta;
    }

  }

}());

},{}],"/home/zdespolit/projects/towers/node_modules/views/map/Sector.js":[function(require,module,exports){
var Geo = require('views/map/Geo');

module.exports = (function(){

  var Sector = function(center, towerAttrs, map, opts){
    this.raw = opts && opts.raw;
    this.center = center;
    this.sector = this.attrs = towerAttrs;
    var angle = parseAngle(this.sector.angle);
    this.angle = angle.rad;
    this.angleSteps = getSteps(this.sector.type, angle.deg, this.raw);
    this.gradientSteps = this.sector.type == 'highway' ? 1 : 15;
    this.map = map;
    this.geoObjects = map.geoObjects;
    this.text = this.sector.name + '<br>' + (this.sector.comment ? " " + this.sector.comment : '');
    this.parts = new ymaps.GeoObjectCollection({}, {
      draggable: false,
      interactivityModel: 'default#transparent'
    });
    this.parts.events.add(['click'], function(e){
        this.openBalloon();
    }, this)
    this.base = null;
    function getSteps(type, angle, raw){
      if (type == 'highway'){
        return 1;
      } else {
        return raw ? 1 : angle / 30
      }
    }
  }

  $.extend(Sector.prototype, {

    render: function(){
      if (Math.PI - this.angle < 0.01){
        this.renderCircleTower();
      } else {
        this.renderSector();
      }
      if (!this.raw){
        this.renderBase();
      }
      return this;
    },

    openBalloon: function(){
      if (this.base) this.base.balloon.open();
    },

    renderCircleTower: function(){
      var lengthStep = this.getLengthSteps();
      var opacity = 5;
      var yColor = this.sector.color + digitToLetter(opacity) + '0';

      for (var i = 1; i <= this.gradientSteps; i++){
        var radius = lengthStep * i;
        var circle = new ymaps.Circle(
            [this.center, radius],
            {}, {
              interactivityModel: 'default#transparent',
              fillColor: yColor,
              strokeColor: yColor,
              strokeWidth: 0,
              opacity: 0.8
            });
        this.parts.add(circle);
      }
      this.geoObjects.add(this.parts);
    },

    renderSector: function(){
      var previous = null,//triangle
          sector = this.sector,
          azimuth = sector.azimuth,
          startAzimuth = azimuth - this.angle,
          angleStep = this.angle / this.angleSteps,
          lengthStep = this.getLengthSteps(),

          part = null,
          a, b, c, d;

      for (var j = 0; j < this.angleSteps * 2; j++){

        previous = null;
        azimuth = startAzimuth + j * angleStep;

        for (var i = 1; i <= this.gradientSteps; i++){
          if (!previous){
            a = this.center;
            b = Geo.endPoint(a, azimuth, lengthStep);
            c = Geo.endPoint(a, azimuth + angleStep, lengthStep);
            part = this.createPolygon([a, b, c], i)
            this.first = part;
            previous = [b, c]

          } else {
            a = previous[0];
            b = previous[1];
            c = Geo.endPoint(a, azimuth, lengthStep);
            d = Geo.endPoint(b, azimuth + angleStep, lengthStep);
            part = this.createPolygon([a, c, d, b], i)
            previous = [c, d]
          }
          this.parts.add(part);
        }
      }
      this.geoObjects.add(this.parts);
    },

    getLengthSteps: function(){
      return this.sector.radius / this.gradientSteps;
    },

    remove: function(){
      this.parts.removeAll();
      if (this.base){
        this.geoObjects.remove(this.base)
      }
    },

    createPolygon: function(points,step){
      if (this.sector.color){
        opacity = 16 - step * 15 / this.gradientSteps;
        yColor = this.sector.color + digitToLetter(opacity) + '0';

      } else {
        var color = '255,0,0,'
        var opacity = 1.2 - step / this.gradientSteps;
        var yColor = 'rgb('  + color + opacity + ')'
      }
      var poly = new ymaps.Polygon([
        points,
        []
      ],{}, {
        interactivityModel: 'default#transparent',
        fillColor: yColor,
        strokeColor: yColor,
        strokeWidth: 0,
        opacity: 0.8
      })
      return poly;
    },

    renderBase: function(){
      var circle = new ymaps.Circle([this.center, 1], {
        balloonContentBody:this.text
      }, {
        fill:false,
        strokeWidth:0
      });
      this.setBase(circle);
    },

    setBase: function(circle){
      this.base = circle;
      this.geoObjects.add(circle);
    }
  });

  function digitToLetter(d){
    if (d > 15 || d < 0){
      throw new Error('Cant convert to hex: ' + d)
    }
    switch (d){
      case 10: return 'A'
      case 11: return 'B'
      case 12: return 'C'
      case 13: return 'D'
      case 14: return 'E'
      case 15: return 'F'
      default: return d;
    }
  }


  function parseAngle(str){
    var anglePattern = /(\d+)([^\d]*)/;
    if (!str || !_.isString(str)){
      throw new Error('Invalid angle')
    }
    function convert(value, unit){
      switch (unit){
        case "°":
          return value * Math.PI / 360
        case "'":
          return limit(value * Math.PI / 360 / 60)
        case '':
          return limit(value * Math.PI / 360 / 3600)
      }
      throw new Error("Unit not found - " + unit)
    }
    function convertToDegrees(value, unit){
      if (unit == '°'){
        return value;
      } else {
        return null;
      }
    }

    var result = {};
    str.replace(anglePattern, function(m, value, unit){
      result = {
        rad: convert(value, unit),
        deg: convertToDegrees(value, unit)
      };
    })
    return result;
  }

  function limit(angle){
    if (angle < 0.003) return 0.003;
    else return angle;
  }

  return Sector;


}());

},{"views/map/Geo":"/home/zdespolit/projects/towers/node_modules/views/map/Geo.js"}]},{},["/home/zdespolit/projects/towers/client/views/Router.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvdmlld3MvUm91dGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudHMvYWNjb3JkaW9uLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9CYXNlQ29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9tb2RlbHMvQmFzZU1vZGVsLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9GcmVxLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9HZW9PYmplY3QuanMiLCJub2RlX21vZHVsZXMvbW9kZWxzL0xvY2F0aW9uLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9Qb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9tb2RlbHMvU3RhdGUuanMiLCJub2RlX21vZHVsZXMvbW9kZWxzL1RlbXBsYXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9tb2RlbHMvVG93ZXIuanMiLCJub2RlX21vZHVsZXMvdmlld3MvTWFpblZpZXcuanMiLCJub2RlX21vZHVsZXMvdmlld3MvTWFwVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9iYXNlL0ZpZWxkVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9iYXNlL0xpc3RWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Jhc2UvVGFibGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Jhc2UvVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9mb3Jtcy9MZWdlbmRWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Zvcm1zL0xvY2F0aW9uVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9mb3Jtcy9Mb2NhdGlvbnNWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Zvcm1zL1BvaW50c1ZpZXcuanMiLCJub2RlX21vZHVsZXMvdmlld3MvZm9ybXMvVG93ZXJWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Zvcm1zL1Rvd2Vyc1ZpZXcuanMiLCJub2RlX21vZHVsZXMvdmlld3MvbWFwL0dlby5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9tYXAvU2VjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNYWluVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL01haW5WaWV3Jyk7XG52YXIgVGFibGVWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9UYWJsZVZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XG5cbiAgICByb3V0ZXM6IHtcbiAgICAgICcnOiAnbWFpbicsXG4gICAgICAndXNlcnMnOiAndXNlcnMnXG4gICAgfSxcblxuICAgIG1haW46IGZ1bmN0aW9uKCl7XG4gICAgICBNYWluVmlldy5nZXQoKS5zaG93KCk7XG4gICAgICAkKCcjdXNlcnMtbGlzdCcpLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgdXNlcnM6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJHVzZXJzID0gJCgnI3VzZXJzLWxpc3QnKVxuICAgICAgJHVzZXJzLnNob3coKTtcbiAgICAgIG5ldyBUYWJsZVZpZXcoe1xuICAgICAgICBlbDogJHVzZXJzLFxuICAgICAgICBjb2xsZWN0aW9uOiBCYXNlQ29sbGVjdGlvbi5jcmVhdGVDb2xsZWN0aW9uKCd1c2VycycsIFVzZXIpLFxuICAgICAgICBjb2xsZWN0aW9uczoge1xuICAgICAgICAgIGxvY2F0aW9uczogQmFzZUNvbGxlY3Rpb24uY3JlYXRlQ29sbGVjdGlvbihcImxvY2F0aW9uc1wiLCBMb2NhdGlvbilcbiAgICAgICAgfVxuICAgICAgfSkuc2hvdygpO1xuICAgICAgJCgnLnVzZXIsIC5sZWdlbmQnKS5oaWRlKCk7XG5cbiAgICAgICQoJy5hY2MtaXRlbS50b2dnbGUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvJztcbiAgICAgIH0pXG4gICAgfVxuXG4gIH0pXG5cbiAgdmFyIGluaXQgPSBmdW5jdGlvbigpe1xuICAgIG5ldyBSb3V0ZXIoKTtcbiAgICBCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KHtwdXNoU3RhdGU6IHRydWV9KTtcbiAgfVxuXG4gIHZhciBkZXBzID0gW10sXG4gICAgICByZXNvbHZlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICBkZXBzLnB1c2gobmFtZSk7XG4gICAgICAgIGlmIChkZXBzLmxlbmd0aCA9PSAyKXtcbiAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICB5bWFwcy5yZWFkeShmdW5jdGlvbigpe1xuICAgIHJlc29sdmVEZXBlbmRlbmN5KCd5YW5kZXggbWFwcycpO1xuICB9KVxuXG4gICQoZnVuY3Rpb24oKXtcbiAgICByZXNvbHZlRGVwZW5kZW5jeSgnZG9tJyk7XG4gIH0pXG5cbiAgcmV0dXJuIHt9O1xuXG59KCkpO1xuIiwiXG4kKGZ1bmN0aW9uKCl7XG4gIHZhciBldmVudHMgPSBCYWNrYm9uZTtcbiAgdmFyIGFjYyA9ICQoJy5hY2NvcmRpb24nKTtcblxuICB3aW5kb3cuaW5pdEFjY29yZGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgYWNjLmZpbmQoJy5hY2MtaXRlbS1kYXRhJykuaGlkZSgpO1xuXG4gICAgYWNjLmZpbmQoJy50b2dnbGUnKS5kYXRhKCdzdGF0ZScsIGZhbHNlKTtcblxuICAgIGFjYy5maW5kKCcuYWNjLWl0ZW0nKS5jbGljayhmdW5jdGlvbihlKXtcblxuICAgICAgaWYgKCQoZS50YXJnZXQpLmhhc0NsYXNzKCdhY2MtaXRlbS1uYW1lJykgPT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgYWNjLmZpbmQoJy5hY2MtaXRlbScpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpXG5cbiAgICAgIHZhciBpdGVtID0gJCh0aGlzKTtcbiAgICAgIHZhciBpdGVtRGF0YSA9IGl0ZW0uZmluZCgnLmFjYy1pdGVtLWRhdGEnKTtcblxuICAgICAgaWYgKCFpdGVtRGF0YS5sZW5ndGgpe1xuICAgICAgICBhY2MuZmluZCgnLmFjYy1pdGVtLWRhdGEnKS5oaWRlKCk7Ly9vdGhlcnNcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1EYXRhLmlzKCc6aGlkZGVuJykpe1xuXG4gICAgICAgIGFjYy5maW5kKCcuYWNjLWl0ZW0tZGF0YScpLmhpZGUoKTsvL290aGVyc1xuICAgICAgICBpdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgICAgIGl0ZW1EYXRhLnNob3coKTtcbiAgICAgICAgZXZlbnRzLnRyaWdnZXIoJ2NoYW5nZTphY2NvcmRpb24nLCBpdGVtLmRhdGEoJ3R5cGUnKSlcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXRlbURhdGEuaGlkZSgpO1xuICAgICAgfVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcblxuICAgIGFjYy5maW5kKCcudG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oZSl7XG4gICAgICB2YXIgJGVsID0gJCh0aGlzKTtcbiAgICAgIHZhciBzdGF0ZSA9ICEkZWwuZGF0YSgnc3RhdGUnKTtcbiAgICAgIHZhciAkYWN0aW9ucyA9ICQoJy5hY2MtaXRlbScpXG4gICAgICBpZiAoc3RhdGUpe1xuICAgICAgICAkYWN0aW9ucy5zaG93KCk7XG4gICAgICAgICRlbC5maW5kKCdzcGFuJykudGV4dCgn4peBJylcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGFjdGlvbnMuaGlkZSgpO1xuICAgICAgICAkZWwuZmluZCgnc3BhbicpLnRleHQoJ+KWtycpXG4gICAgICAgICRhY3Rpb25zLmNzcygnbWluLXdpZHRoJywgJzU1cHgnKVxuICAgICAgfVxuICAgICAgJGVsLmRhdGEoJ3N0YXRlJywgc3RhdGUpO1xuICAgICAgJGVsLnNob3coKTsgLy9hbHdheXNcbiAgICAgIGV2ZW50cy50cmlnZ2VyKCd0b2dnbGU6YWNjb3JkaW9uJywgc3RhdGUpXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSlcblxuICB9XG4gIHdpbmRvdy5hY2NTZWxlY3QgPSBmdW5jdGlvbihpZCl7XG4gICAgdmFyICRlbCA9ICQoJy5hY2MtaXRlbS50b2dnbGUnKVxuICAgICRlbC5kYXRhKCdzdGF0ZScsIHRydWUpO1xuICAgIHZhciAkYWN0aW9ucyA9ICQoJy5hY2MtaXRlbScpXG4gICAgJGFjdGlvbnMuc2hvdygpO1xuICAgICRlbC5maW5kKCdzcGFuJykudGV4dCgn4pa3JylcbiAgICAkZWwuZmluZCgnc3BhbicpLmNzcygnZm9udC1zaXplJywgJycpXG4gICAgaWYgKCEkKCcuYWNjLWl0ZW0uJyArIGlkKS5oYXNDbGFzcyhcImFjdGl2ZVwiKSl7XG4gICAgICAkKCcuYWNjLWl0ZW0uJyArIGlkICsgJyAuYWNjLWl0ZW0tbmFtZScpLmNsaWNrKCk7XG4gICAgfVxuXG4gIH1cblxuICB3aW5kb3cuYWNjU2VsZWN0V2l0aG91dEV2ZW50cyA9IGZ1bmN0aW9uKGVsKXtcbiAgICBhY2MuZmluZCgnLmFjYy1pdGVtJykucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgYWNjLmZpbmQoJy5hY2MtaXRlbS1kYXRhJykuaGlkZSgpO1xuICAgIGVsLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgIGVsLmZpbmQoJy5hY2MtaXRlbS1kYXRhJykuc2hvdygpO1xuICB9XG5cbn0pO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIGZ1bmN0aW9uIHJldmVyc2VTdHJpbmcoaW5wdXQpe1xuICAgIHZhciBzdHIgPSBpbnB1dC50b0xvd2VyQ2FzZSgpO1xuICAgIHN0ciA9IHN0ci5zcGxpdChcIlwiKTtcbiAgICBzdHIgPSBfLm1hcChzdHIsIGZ1bmN0aW9uKGxldHRlcikge1xuICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoLShsZXR0ZXIuY2hhckNvZGVBdCgwKSkpO1xuICAgIH0pO1xuICAgIHJldHVybiBzdHI7XG4gIH1cblxuXG4gIHZhciBCYXNlQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuICAgIHNldFNvcnQ6IGZ1bmN0aW9uKG9wdHMpe1xuICAgICAgb3B0cyA9IG9wdHMgfHwge31cbiAgICAgIHZhciBhdHRyID0gb3B0cy5hdHRyIHx8ICduYW1lJyxcbiAgICAgICAgICBkaXIgPSBvcHRzLmRpciB8fCAoIXRoaXMuc29ydE9wdHMgfHwgdGhpcy5zb3J0T3B0cy5hdHRyICE9IGF0dHIpID8gJ2FzYycgOiAodGhpcy5zb3J0T3B0cy5kaXIgPT0gJ2FzYycpID8gJ2Rlc2MnIDogJ2FzYydcblxuICAgICAgdGhpcy5jb21wYXJhdG9yID0gZnVuY3Rpb24oZWwpe1xuICAgICAgICB2YXIgdmFsdWUgPSBlbC5nZXQoYXR0cilcbiAgICAgICAgaWYgKGRpciA9PSAnYXNjJyl7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIChhdHRyID09ICdmcmVxJykgPyAtdmFsdWUgOiByZXZlcnNlU3RyaW5nKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnNvcnRPcHRzID0ge1xuICAgICAgICBhdHRyOiBhdHRyLFxuICAgICAgICBkaXI6IGRpclxuICAgICAgfTtcblxuICAgIH1cblxuICB9KVxuXG4gIEJhc2VDb2xsZWN0aW9uLmNyZWF0ZUNvbGxlY3Rpb24gPSBmdW5jdGlvbihuYW1lLCBtb2RlbCwgb3B0aW9ucywgbW9kZWxzKXtcblxuICAgIG1vZGVscyA9IG1vZGVscyB8fCBnZXRCb290c3RyYXBEYXRhKG5hbWUpO1xuICAgIHZhciBjb2xsZWN0aW9uID0gbmV3IChCYXNlQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgICAgbW9kZWw6IG1vZGVsXG4gICAgfSkpKG1vZGVscywgb3B0aW9ucylcbiAgICBjb2xsZWN0aW9uLmZpZWxkcyA9IChuZXcgbW9kZWwoKSkuZmllbGRzO1xuICAgIGNvbGxlY3Rpb24uc2V0U29ydCgpXG4gICAgY29sbGVjdGlvbi5zb3J0KClcbiAgICByZXR1cm4gY29sbGVjdGlvbjtcblxuICAgIGZ1bmN0aW9uIGdldEJvb3RzdHJhcERhdGEobmFtZSl7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSgkKCcuZGF0YS1ob2xkZXIuJyArIG5hbWUpLmh0bWwoKSlcbiAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICBjb25zb2xlLndhcm4oJ25vIGRhdGEgZm9yIGNvbGxlY3Rpb24gXCInICsgbmFtZSArICcgXCJmb3VuZCcpXG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gQmFzZUNvbGxlY3Rpb247XG5cbn0oKSk7IiwiXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG4gICAgX2dldE5hbWU6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5uYW1lIHx8IHRoaXMudXJsLnJlcGxhY2UoL3MkLywgJycpO1xuICAgIH0sXG5cbiAgICBzYXZlOiBmdW5jdGlvbihvcHRzKXtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgIGRhdGFbdGhpcy5fZ2V0TmFtZSgpXSA9IHRoaXMuX3RvSlNPTiA/IHRoaXMuX3RvSlNPTiAoKSA6IHRoaXMudG9KU09OKCk7XG4gICAgICBvcHRzLnVybCA9ICcvcmVzdC8nICsgdGhpcy51cmwgKyAnPycgKyAkLnBhcmFtKGRhdGEpO1xuICAgICAgQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnNhdmUuY2FsbCh0aGlzLCBudWxsLCBvcHRzKVxuICAgICAgdGhpcy5jaGFuZ2VkID0ge307XG4gICAgICB0aGlzLm1hcmtUb1JldmVydCgpO1xuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnNldC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIG1hcmtUb1JldmVydDogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucmVzdG9yZUF0dHJpYnV0ZXMgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgfSxcblxuICAgIHJldmVydDogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLnJlc3RvcmVBdHRyaWJ1dGVzKXtcbiAgICAgICAgdGhpcy5zZXQodGhpcy5yZXN0b3JlQXR0cmlidXRlcywge3NpbGVudDp0cnVlfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vZ2V0IHZpZXcgcHJlc2VudGF0aW9uIG9mIGF0dHJpYnV0ZVxuICAgIGdldFY6IGZ1bmN0aW9uKGF0dHIpe1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KGF0dHIpOyAvL2J5IGRlZmF1bHRcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKXtcbiAgICAgIEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcywge3VybDonL3Jlc3QvJyArIHRoaXMudXJsICsgJy8nICsgdGhpcy5pZH0pXG4gICAgfSxcblxuICAgIF9fdmFsaWRhdGU6IGZ1bmN0aW9uKGZpZWxkcyl7XG4gICAgICB2YXIgZXJyb3JzID0gbnVsbDtcbiAgICAgIF8uZWFjaChmaWVsZHMsIF8uYmluZChmdW5jdGlvbihmaWVsZCl7XG4gICAgICAgIHZhciBlcnJvciA9ICcnO1xuICAgICAgICBpZiAoXy5pc1N0cmluZyhmaWVsZCkpe1xuICAgICAgICAgIGlmICghdGhpcy5nZXQoZmllbGQpKSB7XG4gICAgICAgICAgICBlcnJvciA9ICfQntCx0Y/Qt9Cw0YLQtdC70YzQvdC+0LUg0L/QvtC70LUnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGZpZWxkKSl7XG4gICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXQoZmllbGQubmFtZSk7XG4gICAgICAgICAgZXJyb3IgPSBmaWVsZC52YWxpZGF0ZSh2YWx1ZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhmaWVsZCk7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgb2JqIHR5cGUuXCIpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yKXtcbiAgICAgICAgICB2YXIgZXZlbnQgPSAnaW52YWxpZDonKyAoZmllbGQubmFtZSB8fCBmaWVsZCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3RyaWdnZXIgJyArIGV2ZW50KVxuICAgICAgICAgIHRoaXMudHJpZ2dlcihldmVudCwgZXJyb3IpO1xuICAgICAgICAgIGVycm9ycyA9IGVycm9ycyB8fCB7fTtcbiAgICAgICAgICBlcnJvcnNbZmllbGRdID0gZXJyb3I7XG4gICAgICAgIH1cblxuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH1cblxuICB9KTtcblxuXG59KCkpO1xuIiwidmFyIEJhc2VNb2RlbCA9IHJlcXVpcmUoJ21vZGVscy9CYXNlTW9kZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gQmFzZU1vZGVsLmV4dGVuZCh7XG5cbiAgICB1cmw6ICdmcmVxcycsXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd2YWx1ZScsXG4gICAgICAgIGxhYmVsOiAn0KfQsNGB0YLQvtGC0LAnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29sb3InLFxuICAgICAgICBsYWJlbDogJ9Cm0LLQtdGCJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3R5cGUnLFxuICAgICAgICBsYWJlbDogJ9Ci0LjQvydcbiAgICAgIH1cbiAgICBdLFxuXG4gICAgc2hvdWxkU2hvdzogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmdldCgnc2hvdycpICE9PSBmYWxzZTtcbiAgICB9LFxuXG4gICAgaXNTaG93bjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnNob3VsZFNob3coKVxuICAgIH0sXG5cbiAgICBzd2l0Y2hWaXNpYmlsaXR5OiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5zZXQoe1xuICAgICAgICBzaG93OiAhdGhpcy5zaG91bGRTaG93KClcbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcblxuXG59KCkpO1xuIiwidmFyIEJhc2VNb2RlbCA9IHJlcXVpcmUoJ21vZGVscy9CYXNlTW9kZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gQmFzZU1vZGVsLmV4dGVuZCh7XG5cbiAgICBmaWVsZHM6IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ25hbWUnLFxuICAgICAgICBsYWJlbDogJ9Cd0LDQt9Cy0LDQvdC40LUnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29tbWVudCcsXG4gICAgICAgIGxhYmVsOiAn0JrQvtC80LzQtdC90YLQsNGA0LjQuSdcbiAgICAgIH1cbiAgICBdLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMsIG9wdHMpe1xuICAgICAgaWYgKGF0dHJzKXtcbiAgICAgICAgYXR0cnMgPSB0aGlzLnBhcnNlKGF0dHJzKTtcbiAgICAgICAgdGhpcy5zZXQoYXR0cnMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfdG9KU09OOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHJlc3VsdCA9IF8uY2xvbmUodGhpcy5hdHRyaWJ1dGVzKTtcbiAgICAgIHJlc3VsdC5zdGFydCA9IGFycmF5VG9Qb2ludChyZXN1bHQuc3RhcnQpO1xuICAgICAgaWYgKHJlc3VsdC5lbmQgJiYgdGhpcy5pcyAmJiB0aGlzLmlzKCdoaWdod2F5Jykpe1xuICAgICAgICByZXN1bHQuZW5kID0gYXJyYXlUb1BvaW50KHJlc3VsdC5lbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHJlc3VsdC5lbmQ7XG4gICAgICB9XG4gICAgICBkZWxldGUgcmVzdWx0Ll90b3dlcnM7XG4gICAgICBkZWxldGUgcmVzdWx0LnRvd2VycztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHBhcnNlOiBmdW5jdGlvbihhdHRycyl7XG4gICAgICBpZiAoIWF0dHJzKSByZXR1cm5cbiAgICAgIGlmIChhdHRycy5zdGFydCl7XG4gICAgICAgIGF0dHJzLnN0YXJ0ID0gcG9pbnRUb0FycmF5KGF0dHJzLnN0YXJ0KVxuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmVuZCl7XG4gICAgICAgIGF0dHJzLmVuZCA9IHBvaW50VG9BcnJheShhdHRycy5lbmQpXG4gICAgICAgIGF0dHJzLnR5cGUgPSBhdHRycy50eXBlIHx8ICdoaWdod2F5JztcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5jb21tZW50KXtcbiAgICAgICAgYXR0cnMuY29tbWVudCA9IGF0dHJzLmNvbW1lbnQucmVwbGFjZSgvJmx0Oy9nLCAnPCcpLnJlcGxhY2UoLyZndDsvZywgJz4nKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJzO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpZCA9IHRoaXMuaWRcbiAgICAgIHJldHVybiB0aGlzLl9fdmFsaWRhdGUoW1xuICAgICAgICAnbmFtZScsIC8vcmVxdWlyZWRcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICB2YWxpZGF0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgICAgICAgICB2YXIgbG9jID0gc3RhdGUuZ2V0KCdsb2NhdGlvbnMnKS5maW5kKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgcmV0dXJuIGVsLmdldCgnbmFtZScpID09IG5hbWUgJiYgZWwuaWQgIT0gaWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChsb2MpIHJldHVybiAn0J3QtSDRg9C90LjQutCw0LvRjNC90L7QtSDQvdCw0LfQstCw0L3QuNC1JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0pXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHBvaW50VG9BcnJheShwb2ludCl7XG4gICAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKF8uaXNBcnJheShwb2ludCkpIHJldHVybiBwb2ludDtcbiAgICByZXR1cm4gW3BvaW50LmxhdGl0dWRlLCBwb2ludC5sb25naXR1ZGVdXG4gIH1cbiAgZnVuY3Rpb24gYXJyYXlUb1BvaW50KGFycmF5KXtcbiAgICBpZiAoIWFycmF5KSByZXR1cm4ge2xhdGl0dWRlOm51bGwsbG9uZ2l0dWRlOm51bGx9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdGl0dWRlOiBhcnJheVswXSxcbiAgICAgIGxvbmdpdHVkZTogYXJyYXlbMV1cbiAgICB9XG4gIH1cblxufSgpKTtcbiIsInZhciBCYXNlTW9kZWwgPSByZXF1aXJlKCdtb2RlbHMvQmFzZU1vZGVsJyk7XG52YXIgQmFzZUNvbGxlY3Rpb24gPSByZXF1aXJlKCdtb2RlbHMvQmFzZUNvbGxlY3Rpb24nKTtcbnZhciBHZW9PYmplY3QgPSByZXF1aXJlKCdtb2RlbHMvR2VvT2JqZWN0Jyk7XG52YXIgVG93ZXIgPSByZXF1aXJlKCdtb2RlbHMvVG93ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gR2VvT2JqZWN0LmV4dGVuZCh7XG5cbiAgICB1cmw6ICdsb2NhdGlvbnMnLFxuXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgbGFiZWw6ICfQndCw0LfQstCw0L3QuNC1J1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbW1lbnQnLFxuICAgICAgICBsYWJlbDogJ9Ca0L7QvNC80LXQvdGC0LDRgNC40LknXG4gICAgICB9XG4gICAgXSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBvcHRzKXtcbiAgICAgIGlmIChhdHRycyl7XG4gICAgICAgIGF0dHJzID0gdGhpcy5wYXJzZShhdHRycyk7XG4gICAgICAgIHRoaXMuc2V0KGF0dHJzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXM6IGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgcmV0dXJuIHR5cGUgPT0gJ2xvY2F0aW9uJztcbiAgICB9LFxuXG4gICAgaXNUb3dlcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmlzKCd0b3dlcicpO1xuICAgIH0sXG5cbiAgICBfdG9KU09OOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHJlc3VsdCA9IF8uY2xvbmUodGhpcy5hdHRyaWJ1dGVzKTtcbiAgICAgIHJlc3VsdC5zdGFydCA9IGFycmF5VG9Qb2ludChyZXN1bHQuc3RhcnQpO1xuICAgICAgaWYgKHJlc3VsdC5lbmQgJiYgdGhpcy5pcyAmJiB0aGlzLmlzKCdoaWdod2F5Jykpe1xuICAgICAgICByZXN1bHQuZW5kID0gYXJyYXlUb1BvaW50KHJlc3VsdC5lbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIHJlc3VsdC5lbmQ7XG4gICAgICB9XG4gICAgICBkZWxldGUgcmVzdWx0Ll90b3dlcnM7XG4gICAgICBkZWxldGUgcmVzdWx0LnRvd2VycztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHBhcnNlOiBmdW5jdGlvbihhdHRycyl7XG4gICAgICBpZiAoIWF0dHJzKSByZXR1cm5cbiAgICAgIGlmIChhdHRycy5zdGFydCl7XG4gICAgICAgIGF0dHJzLnN0YXJ0ID0gcG9pbnRUb0FycmF5KGF0dHJzLnN0YXJ0KVxuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmVuZCl7XG4gICAgICAgIGF0dHJzLmVuZCA9IHBvaW50VG9BcnJheShhdHRycy5lbmQpXG4gICAgICAgIGF0dHJzLnR5cGUgPSBhdHRycy50eXBlIHx8ICdoaWdod2F5JztcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5jb21tZW50KXtcbiAgICAgICAgYXR0cnMuY29tbWVudCA9IGF0dHJzLmNvbW1lbnQucmVwbGFjZSgvJmx0Oy9nLCAnPCcpLnJlcGxhY2UoLyZndDsvZywgJz4nKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJzO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpZCA9IHRoaXMuaWRcbiAgICAgIHJldHVybiB0aGlzLl9fdmFsaWRhdGUoW1xuICAgICAgICAnbmFtZScsIC8vcmVxdWlyZWRcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICB2YWxpZGF0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgICAgICAgICB2YXIgbG9jID0gc3RhdGUuZ2V0KCdsb2NhdGlvbnMnKS5maW5kKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICAgICAgcmV0dXJuIGVsLmdldCgnbmFtZScpID09IG5hbWUgJiYgZWwuaWQgIT0gaWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChsb2MpIHJldHVybiAn0J3QtSDRg9C90LjQutCw0LvRjNC90L7QtSDQvdCw0LfQstCw0L3QuNC1JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0pXG4gICAgfSxcblxuICAgIGdldFRvd2VyczogZnVuY3Rpb24oKXtcbiAgICAgIGlmICghdGhpcy5nZXQoJ190b3dlcnMnKSl7XG4gICAgICAgIHZhciB0b3dlcnMgPSBCYXNlQ29sbGVjdGlvbi5jcmVhdGVDb2xsZWN0aW9uKCd0b3dlcnMnLCBUb3dlciwge30sIHRoaXMuZ2V0KCd0b3dlcnMnKSk7XG4gICAgICAgIHRoaXMuc2V0KHtfdG93ZXJzOnRvd2Vyc30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG93ZXJzID0gdGhpcy5nZXQoJ190b3dlcnMnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b3dlcnM7XG4gICAgfSxcblxuICAgIGdldFBvaW50czogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpZCA9IHRoaXMuZ2V0KCdpZCcpO1xuICAgICAgdmFyIGFyciA9IHN0YXRlLmdldCgncG9pbnRzJykuZmlsdGVyKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgcmV0dXJuIGVsLmdldCgnbG9jYXRpb25JZCcpID09IGlkXG4gICAgICB9KVxuICAgICAgcmV0dXJuIF8oYXJyKVxuICAgIH0sXG5cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KCduYW1lJykgfHwgJ9Cd0L7QstCw0Y8g0LvQvtC60LDRhtC40Y8nXG4gICAgfVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHBvaW50VG9BcnJheShwb2ludCl7XG4gICAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG4gICAgaWYgKF8uaXNBcnJheShwb2ludCkpIHJldHVybiBwb2ludDtcbiAgICByZXR1cm4gW3BvaW50LmxhdGl0dWRlLCBwb2ludC5sb25naXR1ZGVdXG4gIH1cbiAgZnVuY3Rpb24gYXJyYXlUb1BvaW50KGFycmF5KXtcbiAgICBpZiAoIWFycmF5KSByZXR1cm4ge2xhdGl0dWRlOm51bGwsbG9uZ2l0dWRlOm51bGx9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdGl0dWRlOiBhcnJheVswXSxcbiAgICAgIGxvbmdpdHVkZTogYXJyYXlbMV1cbiAgICB9XG4gIH1cblxufSgpKTtcbiIsInZhciBHZW9PYmplY3QgPSByZXF1aXJlKCdtb2RlbHMvTG9jYXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgbmFtZSA9ICcnLFxuICAgICAgcG9pbnRSYWRpdXMgPSAxMjtcblxuICByZXR1cm4gR2VvT2JqZWN0LmV4dGVuZCh7XG5cbiAgICB1cmw6ICdwb2ludHMnLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cnMpe1xuICAgICAgYXR0cnMgPSB0aGlzLnBhcnNlKGF0dHJzIHx8IHt9KVxuICAgICAgdGhpcy5zZXQoYXR0cnMpXG4gICAgICB0aGlzLnNldCh7cmFkaXVzOiBwb2ludFJhZGl1c30pXG4gICAgfSxcblxuICAgIGdldFRvd2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGxvY2F0aW9uID0gc3RhdGUuZ2V0KCdsb2NhdGlvbnMnKS5nZXQodGhpcy5nZXQoJ2xvY2F0aW9uSWQnKSlcbiAgICAgIHJldHVybiBsb2NhdGlvbi5nZXRUb3dlcnMoKS5nZXQodGhpcy5nZXQoXCJ0b3dlcklkXCIpKVxuICAgIH0sXG5cbiAgICBpczogZnVuY3Rpb24odHlwZSl7XG4gICAgICByZXR1cm4gdHlwZSA9PSAncG9pbnQnO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBzZXROYW1lOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5zZXQoe25hbWU6IG5hbWUgfHwgJ9Cx0LXQtyDQuNC80LXQvdC4J30pXG4gICAgfVxuXG4gIH0sIHtcbiAgICBzZXROYW1lOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBuYW1lID0gdmFsdWVcbiAgICB9XG4gIH0pXG5cbn0oKSk7IiwiXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBTdGF0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cbiAgICBmaWVsZHM6W1xuICAgICAgJ2xvY2F0aW9ucycsXG4gICAgICAnbG9jYXRpb24nLFxuICAgICAgJ3Rvd2VyJyxcbiAgICAgICdmcmVxcycsXG4gICAgICAnZWRpdE1vZGVsJ1xuICAgIF0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5vbignY2hhbmdlOmVkaXRNb2RlbCcsIF8uYmluZChmdW5jdGlvbihzdGF0ZSwgbW9kZWwpe1xuICAgICAgICBpZiAobW9kZWwpe1xuICAgICAgICAgIHRoaXMucHJldmlvdXMgPSBtb2RlbDtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpXG4gICAgfSxcblxuICAgIGdldFByZXZpb3VzRWRpdE1vZGVsIDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnByZXZpb3VzO1xuICAgIH1cblxuLy8gICAgLHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50KXtcbi8vICAgICAgY29uc29sZS5sb2coZXZlbnQpXG4vLyAgICAgIEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS50cmlnZ2VyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbi8vICAgIH1cblxuICB9KVxuXG5cbn0oKSk7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIFRlbXBsYXRlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICBleGVjdXRlOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgIHJldHVybiBleGVjdXRlVGVtcGxhdGUodGhpcy5nZXQoJ3NyYycpLCBkYXRhKVxuICAgIH1cbiAgfSlcblxuICB2YXIgZ2V0ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgICByZXR1cm4gJC5nZXQoJy9yZXN0L3RlbXBsYXRlcy8nICsgbmFtZSArICcuaHRtbCcpLnBpcGUoZnVuY3Rpb24oc3JjKXtcblxuICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZSh7c3JjOnNyY30pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtnZXQ6IGdldH07XG5cbiAgZnVuY3Rpb24gZXhlY3V0ZVRlbXBsYXRlKHRlbXBsYXRlLCBkYXRhKXtcbiAgICByZXR1cm4gXy50ZW1wbGF0ZSh0ZW1wbGF0ZSwgZGF0YSwge2ludGVycG9sYXRlOiAvXFwhXFx7KC4rPylcXH0vZ30pO1xuICB9XG5cblxufSgpKTtcbiIsInZhciBHZW9PYmplY3QgPSByZXF1aXJlKCdtb2RlbHMvR2VvT2JqZWN0Jyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCdtb2RlbHMvUG9pbnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgYW5nbGVzID0ge1xuICAgIHRvd2VyOiBbJzYwwrAnLCAnOTDCsCcsICcxMjDCsCcsICczNjDCsCddLFxuICAgIGhpZ2h3YXk6IFtcIjE1J1wiLCBcIjIwJ1wiLCBcIjMwJ1wiXVxuICB9XG5cbiAgdmFyIFRvd2VyID0gR2VvT2JqZWN0LmV4dGVuZCh7XG5cbiAgICB1cmw6ICd0b3dlcnMnLFxuXG4gICAgZmllbGRzOiBbXG4gICAgICB7bmFtZTogJ2FuZ2xlJyxcbiAgICAgICAgbGFiZWw6ICfQo9Cz0L7Quyd9LFxuICAgICAge25hbWU6ICduYW1lJyxcbiAgICAgICAgbGFiZWw6ICfQndCw0LfQstCw0L3QuNC1J30sXG4gICAgICB7bmFtZTogJ2ZyZXEnLFxuICAgICAgICB0eXBlOiAnZmxvYXQnLFxuICAgICAgICBsYWJlbDogJ9Cn0LDRgdGC0L7RgtCwJ1xuICAgICAgICB9LFxuICAgICAge25hbWU6ICdjb21tZW50JyxcbiAgICAgICAgbGFiZWw6ICfQmtC+0LzQvNC10L3RgtCw0YDQuNC5J30sXG4gICAgICAgICd0eXBlJyxcbiAgICAgICAgJ2NvbG9yJ1xuICAgIF0sXG4gICAgZmllbGRzMjogW1xuICAgICAgJ3N0YXJ0JyxcbiAgICAgICdyYWRpdXMnLFxuICAgICAgJ2F6aW11dGgnLFxuICAgICAgJ2VuZCdcbiAgICAgIF0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycyl7XG4gICAgICBpZiAoYXR0cnMpe1xuICAgICAgICBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMpO1xuICAgICAgICBpZiAoIWF0dHJzLmFuZ2xlKXsgLy9zZXQgZGVmYXVsdCBhbmdsZVxuICAgICAgICAgIGlmICghYXR0cnMudHlwZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBkZXRlcm1pbmUgdG93ZXIgdHlwZS4gXCIgKyBhdHRycyk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXR0cnMuYW5nbGUgPSBhbmdsZXNbYXR0cnMudHlwZV1bMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQoYXR0cnMpXG4gICAgICB9XG4gICAgICB0aGlzLm9uKCdjaGFuZ2U6dHlwZScsIF8uYmluZChmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLnNldCgnYW5nbGUnLCBhbmdsZXNbdGhpcy5nZXQoJ3R5cGUnKV1bMF0pXG4gICAgICB9LCB0aGlzKSlcbiAgICB9LFxuXG4gICAgZ2V0TmFtZTogZnVuY3Rpb24oKXtcbiAgICAgIGlmICghdGhpcy5nZXQoJ25hbWUnKSl7XG4gICAgICAgIHJldHVybiAn0J3QvtCy0LDRjyAnICsgKHRoaXMuaXNIaWdod2F5KCkgPyAn0YLQvtGH0LrQsC3RgtC+0YfQutCwJyA6ICfQstGL0YjQutCwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKHRoaXMuaXNIaWdod2F5KCkgPyAn0KLQvtGH0LrQsC3RgtC+0YfQutCwJyA6ICfQktGL0YjQutCwJykgICsgJyAnICsgdGhpcy5nZXQoJ25hbWUnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2lzTmV3OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuICF0aGlzLmdldCgncmFkaXVzJylcbiAgICB9LFxuXG4gICAgZ2V0UG9pbnRzOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGlkID0gdGhpcy5nZXQoJ2lkJylcbiAgICAgIHZhciBhcnIgPSBzdGF0ZS5nZXQoJ3BvaW50cycpLmZpbHRlcihmdW5jdGlvbihlbCl7XG4gICAgICAgIHJldHVybiBlbC5nZXQoJ3Rvd2VySWQnKSA9PSBpZFxuICAgICAgfSlcbiAgICAgIHJldHVybiBfKGFycilcbiAgICB9LFxuXG4gICAgZ2V0Q29sb3I6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGcmVxXygpLmdldCgnY29sb3InKVxuICAgIH0sXG5cbiAgICBnZXRGcmVxXzogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBmcmVxID0gcGFyc2VGbG9hdCh0aGlzLmdldCgnZnJlcScpKTtcbiAgICAgIHZhciByZXN1bHQgPSBzdGF0ZS5nZXQoJ2ZyZXFzJykuZmluZFdoZXJlKHt2YWx1ZTogZnJlcX0pXG4gICAgICBpZiAoIXJlc3VsdCl7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJmcmVxIG5vdCBmb3VuZDogXCIgKyBmcmVxKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVDb2xvcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBmcmVxID0gdGhpcy5nZXRGcmVxXygpO1xuICAgICAgdGhpcy5zZXQoe2NvbG9yOiBmcmVxLmdldCgnY29sb3InKX0pXG4gICAgfSxcblxuICAgIC8v0LLQvtC30LLRgNCw0YnQsNC10YIgdHJ1ZSwg0LXRgdC70Lgg0L7QsdGK0LXQutGCINCy0YvRiNC60LAg0LjQu9C4INGC0L7Rh9C60LAt0YLQvtGH0LrQsFxuICAgIGlzVG93ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgaXM6IGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwidHlwZVwiKSA9PSB0eXBlO1xuICAgIH0sXG5cbiAgICBpc0hpZ2h3YXk6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5pcygnaGlnaHdheScpXG4gICAgfSxcblxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuX192YWxpZGF0ZShbJ2ZyZXEnLCAnbmFtZSddKTsvL3JlcXVpcmVkXG4gICAgfVxuXG4gIH0pXG5cbiAgVG93ZXIuYW5nbGVzID0gYW5nbGVzO1xuXG4gIHJldHVybiBUb3dlcjtcblxufSgpKTtcbiIsInZhciBhY2NvcmRpb24gPSByZXF1aXJlKCdjb21wb25lbnRzL2FjY29yZGlvbicpO1xudmFyIEJhc2VDb2xsZWN0aW9uID0gcmVxdWlyZSgnbW9kZWxzL0Jhc2VDb2xsZWN0aW9uJyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCdtb2RlbHMvUG9pbnQnKTtcbnZhciBUb3dlciA9IHJlcXVpcmUoJ21vZGVscy9Ub3dlcicpO1xudmFyIExvY2F0aW9uID0gcmVxdWlyZSgnbW9kZWxzL0xvY2F0aW9uJyk7XG52YXIgRnJlcSA9IHJlcXVpcmUoJ21vZGVscy9GcmVxJyk7XG52YXIgU3RhdGUgPSByZXF1aXJlKCdtb2RlbHMvU3RhdGUnKTtcbnZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG52YXIgVG93ZXJWaWV3ID0gcmVxdWlyZSgndmlld3MvZm9ybXMvVG93ZXJWaWV3Jyk7XG52YXIgTG9jYXRpb25WaWV3ID0gcmVxdWlyZSgndmlld3MvZm9ybXMvTG9jYXRpb25WaWV3Jyk7XG52YXIgVG93ZXJzVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2Zvcm1zL1Rvd2Vyc1ZpZXcnKTtcbnZhciBMb2NhdGlvbnNWaWV3ID0gcmVxdWlyZSgndmlld3MvZm9ybXMvTG9jYXRpb25zVmlldycpO1xudmFyIFBvaW50c1ZpZXcgPSByZXF1aXJlKCd2aWV3cy9mb3Jtcy9Qb2ludHNWaWV3Jyk7XG52YXIgTGVnZW5kVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2Zvcm1zL0xlZ2VuZFZpZXcnKTtcbnZhciBNYXBWaWV3ID0gcmVxdWlyZSgndmlld3MvTWFwVmlldycpO1xudmFyIGNyZWF0ZUNvbGxlY3Rpb24gPSBCYXNlQ29sbGVjdGlvbi5jcmVhdGVDb2xsZWN0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG5cbiAgdmFyIHN0YXRlID0gd2luZG93LnN0YXRlID0gbmV3IFN0YXRlKCk7XG5cbiAgdmFyIHRvd2VycztcbiAgdmFyIGZyZXFzO1xuICB2YXIgbG9jYXRpb25zO1xuICB2YXIgcG9pbnRzO1xuXG4gIHZhciBtYWluVmlldyA9IG51bGwsXG4gICAgICBtYXA7XG5cbiAgdmFyIE1haW5WaWV3ID0gVmlldy5leHRlbmQoe1xuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgIGZyZXFzID0gY3JlYXRlQ29sbGVjdGlvbignZnJlcXMnLCBGcmVxLCB7IGNvbXBhcmF0b3I6IGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoZWwuZ2V0KCd2YWx1ZScpKVxuICAgICAgfX0pO1xuICAgICAgbG9jYXRpb25zID0gY3JlYXRlQ29sbGVjdGlvbignbG9jYXRpb25zJywgTG9jYXRpb24pO1xuICAgICAgcG9pbnRzID0gY3JlYXRlQ29sbGVjdGlvbigncG9pbnRzJywgUG9pbnQpO1xuICAgICAgc3RhdGUuc2V0KHtcbiAgICAgICAgbG9jYXRpb25zOiBsb2NhdGlvbnMsXG4gICAgICAgIGZyZXFzOiBmcmVxcyxcbiAgICAgICAgbG9jYXRpb246IGxvY2F0aW9ucy5maXJzdCgpLFxuICAgICAgICBwb2ludHM6IHBvaW50cyxcbiAgICAgICAgc2hvd0xvY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgc2hvd1BvaW50czogdHJ1ZVxuICAgICAgfSlcbiAgICAgIHRoaXMudmlld3MgPSB7XG4gICAgICAgICd0b3dlcnNMaXN0JzogbmV3IFRvd2Vyc1ZpZXcoe2VsOiAnLmFjYy1pdGVtLnRvd2Vycy1saXN0JywgbmFtZTogJ9CS0YvRiNC60LgnfSksXG4gICAgICAgICdsb2NhdGlvbnNMaXN0JzogbmV3IExvY2F0aW9uc1ZpZXcoe2VsOiAnLmFjYy1pdGVtLmxvY2F0aW9ucy1saXN0JywgY29sbGVjdGlvbjogbG9jYXRpb25zLCBuYW1lOiAn0JvQvtC60LDRhtC40LgnfSksXG4gICAgICAgICdwb2ludHNMaXN0JzogbmV3IFBvaW50c1ZpZXcoe2VsOiAnLmFjYy1pdGVtLnBvaW50cy1saXN0JywgbmFtZTogJ9Ci0L7Rh9C60LgnfSlcbiAgICAgIH1cbiAgICAgIG5ldyBMZWdlbmRWaWV3KHtlbDogJy5sZWdlbmQnfSlcblxuICAgICAgdmFyIHZpZXcgPSBudWxsO1xuICAgICAgc3RhdGUub24oJ2NoYW5nZTplZGl0TW9kZWwnLCBfLmJpbmQoZnVuY3Rpb24oc3RhdGUsIG1vZGVsKXtcbiAgICAgICAgdmlldyAmJiB2aWV3LnJlbW92ZSgpO1xuICAgICAgICBpZiAoIW1vZGVsKSB7XG4gICAgICAgICAgdmFyIHByZXZNb2RlbCA9IHN0YXRlLmdldFByZXZpb3VzRWRpdE1vZGVsKCk7XG4gICAgICAgICAgdmFyIG51bWJlciA9IHByZXZNb2RlbC5pcygncG9pbnQnKSA/IDMgOiBwcmV2TW9kZWwuaXMoJ3Rvd2VyJykgPyAyIDogMTtcbiAgICAgICAgICBhY2NTZWxlY3RXaXRob3V0RXZlbnRzKCQoJy5hY2MtaXRlbTplcSgnICsgbnVtYmVyICsgICcgKScpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2aWV3ID0gbW9kZWwuaXMoJ3Rvd2VyJykgPyBuZXcgVG93ZXJWaWV3KHtmcmVxczpmcmVxcywgbW9kZWw6bW9kZWx9KSA6IChtb2RlbC5pcygnbG9jYXRpb24nKT8gbmV3IExvY2F0aW9uVmlldyh7bW9kZWw6bW9kZWx9KTogbnVsbCk7XG4gICAgICAgICAgdmlldyAmJiB2aWV3LnJlbmRlckFzeW5jKCkuZG9uZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyICRlbCA9ICQoJy5pdGVtLXZpZXcnKVxuICAgICAgICAgICAgJGVsLmh0bWwodmlldy4kZWwpO1xuICAgICAgICAgICAgYWNjU2VsZWN0V2l0aG91dEV2ZW50cygkZWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHZhciB0eXBlID0gbW9kZWwudXJsLnJlcGxhY2UoL3MkLywgJycpO1xuICAgICAgICAgIHN0YXRlLnNldCh0eXBlLCBtb2RlbClcbiAgICAgICAgICBtb2RlbC5vbignc3luYycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzdGF0ZS50cmlnZ2VyKCdzeW5jOicgKyB0eXBlLCBzdGF0ZSwgbW9kZWwpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBtYXAuc2V0TW9kZWwobW9kZWwpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLmluaXRWaWV3cygpO1xuICAgICAgdGhpcy5pbml0RnJlcXMoKTtcbiAgICB9LFxuXG4gICAgaW5pdFZpZXdzOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIG1hcHMgPSBuZXcgJC5EZWZlcnJlZCgpO1xuXG4gICAgICB2YXIgcHJvbWlzZXMgPSBbXVxuICAgICAgeW1hcHMucmVhZHkoZnVuY3Rpb24oKXtcbiAgICAgICAgbWFwcy5yZXNvbHZlKClcbiAgICAgIH0pXG4gICAgICBwcm9taXNlcy5wdXNoKG1hcHMpXG4gICAgICBfLmVhY2godGhpcy52aWV3cywgZnVuY3Rpb24odmlldyl7XG4gICAgICAgIGlmICh2aWV3LnJlbmRlcikgdmlldy5yZW5kZXIoKTtcbiAgICAgICAgaWYgKHZpZXcucmVuZGVyQXN5bmMpe1xuICAgICAgICAgIHByb21pc2VzLnB1c2godmlldy5yZW5kZXJBc3luYygpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgICQud2hlbi5hcHBseSgkLCBwcm9taXNlcykudGhlbihfLmJpbmQoZnVuY3Rpb24oKXtcbiAgICAgICAgbWFwID0gd2luZG93Lm1hcCA9IG5ldyBNYXBWaWV3KHtcbiAgICAgICAgICBmcmVxczogZnJlcXMsXG4gICAgICAgICAgbG9jYXRpb25zOiBsb2NhdGlvbnNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbml0QWNjb3JkaW9uKCk7XG5cbiAgICAgICAgdmFyIGxvY2F0aW9uID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpO1xuICAgICAgICBpZiAobG9jYXRpb24pe1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHN0YXRlLnRyaWdnZXIoJ2NoYW5nZTpsb2NhdGlvbicsIHN0YXRlLCBsb2NhdGlvbilcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIGluaXRGcmVxczogZnVuY3Rpb24oKXtcbiAgICAgIGZyZXFzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihmcmVxLCBiLCBjKXtcbiAgICAgICAgdmFyIHRvd2VycyA9IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXRUb3dlcnMoKTtcbiAgICAgICAgdmFyIGZpbHRlcmVkID0gdG93ZXJzLmZpbHRlcihmdW5jdGlvbih0b3dlcil7XG4gICAgICAgICAgcmV0dXJuIHRvd2VyLmdldEZyZXFfKCkuY2lkID09IGZyZXEuY2lkXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgbWFwLnJlZHJhd1Rvd2VycyhfKGZpbHRlcmVkKSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGluaXRBY2NvcmRpb246IGZ1bmN0aW9uKCl7XG4gICAgICB3aW5kb3cuaW5pdEFjY29yZGlvbigpO1xuICAgICAgJCgnLmFjY29yZGlvbicpLm9uKCdob3ZlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICB9KTtcblxuICBNYWluVmlldy5nZXQgPSBmdW5jdGlvbigpe1xuICAgIGlmICghbWFpblZpZXcpXG4gICAgICBtYWluVmlldyA9IG5ldyBNYWluVmlldygpO1xuICAgIHJldHVybiBtYWluVmlldztcbiAgfVxuXG4gIHJldHVybiBNYWluVmlldztcblxuXG59KCkpXG4iLCJ2YXIgVG93ZXIgPSByZXF1aXJlKCdtb2RlbHMvVG93ZXInKTtcbnZhciBMb2NhdGlvbiA9IHJlcXVpcmUoJ21vZGVscy9Mb2NhdGlvbicpO1xudmFyIFNlY3RvciA9IHJlcXVpcmUoJ3ZpZXdzL21hcC9TZWN0b3InKTtcbnZhciBHZW8gPSByZXF1aXJlKCd2aWV3cy9tYXAvR2VvJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHltYXBzID0gd2luZG93LnltYXBzO1xuICB2YXIgbWFwID0gbnVsbDtcblxuICB2YXIgQ2lyY2xlID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuICBDaXJjbGUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCl7XG4gICAgbWFwLmdlb09iamVjdHMucmVtb3ZlKHRoaXMuZGF0YSk7XG4gIH1cblxuICByZXR1cm4gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMubW9kZWwgPSBudWxsO1xuICAgICAgdGhpcy50b3dlcnNHZW9PYmplY3RzID0ge307XG4gICAgICB0aGlzLmxvY2F0aW9uR2VvT2JqZWN0cyA9IHt9O1xuICAgICAgdGhpcy5wb2ludHNHZW9PYmplY3RzID0ge307XG4gICAgICB0aGlzLmluaXRNYXAoKTtcbiAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIH0sXG5cbiAgICBpbml0TWFwOiBmdW5jdGlvbigpe1xuICAgICAgaWYgKG1hcCkgbWFwLmRlc3Ryb3koKTtcbiAgICAgIHZhciBjZW50ZXIgPSBzdGF0ZS5nZXQoJ2xvY2F0aW9uJykgPyBzdGF0ZS5nZXQoJ2xvY2F0aW9uJykuZ2V0KCdzdGFydCcpIDogbnVsbDtcbiAgICAgIG1hcCA9IG5ldyB5bWFwcy5NYXAoJ21hcCcsIHtcbiAgICAgICAgY2VudGVyOiBjZW50ZXIgfHwgWzU2LjgsIDYwLjddLFxuICAgICAgICB6b29tOiAxMCxcbiAgICAgICAgY29udHJvbHM6IFsnc2VhcmNoQ29udHJvbCcsICd0eXBlU2VsZWN0b3InLCAgJ2Z1bGxzY3JlZW5Db250cm9sJywgJ3J1bGVyQ29udHJvbCddLFxuICAgICAgICBiZWhhdmlvcnM6IFsnZGVmYXVsdCcsICdzY3JvbGxab29tJ11cbiAgICAgIH0pO1xuICAgICAgbWFwLm9wdGlvbnMuc2V0KCdzY3JvbGxab29tU3BlZWQnLCA1KTtcbiAgICAgIG1hcC5ldmVudHMuYWRkKCdjbGljaycsIHRoaXMub25DbGljaywgdGhpcyk7XG4gICAgICBtYXAuZXZlbnRzLmFkZCgnbW91c2Vtb3ZlJywgXy50aHJvdHRsZSh0aGlzLm9uSG92ZXIsIDUwKSwgdGhpcyk7XG4gICAgICBjb25zb2xlLmxvZyhtYXAuZXZlbnRzKVxuICAgICAgbWFwLmNvbnRyb2xzLmFkZCgnem9vbUNvbnRyb2wnLCB7IGxlZnQ6IDUsIGJvdHRvbTogMTUgfSlcbi8vICAgICAgbWFwLmNvbnRyb2xzLmFkZCgndHlwZVNlbGVjdG9yJywge2xlZnQ6IDE1MCwgYm90dG9tOiAxNX0pIC8vINCh0L/QuNGB0L7QuiDRgtC40L/QvtCyINC60LDRgNGC0Ytcbi8vICAgICAgbWFwLmNvbnRyb2xzLmFkZCgnbWFwVG9vbHMnLCB7IGxlZnQ6IDM1LCBib3R0b206IDE1IH0pOyAvLyDQodGC0LDQvdC00LDRgNGC0L3Ri9C5INC90LDQsdC+0YAg0LrQvdC+0L/QvtC6XG4vLyAgICDQstCw0YDQuNCw0L3RgiDQutC+0L3RgtGA0L7Qu9C+0LIg0YHQstC10YDRhdGDXG4vLyAgICAgIG1hcC5jb250cm9scy5hZGQoJ3pvb21Db250cm9sJywgeyByaWdodDogNSwgdG9wOiAzNSB9KVxuLy8gICAgICAgICAgLmFkZCgndHlwZVNlbGVjdG9yJywge3JpZ2h0OiAzNSwgdG9wOiA2NX0pIC8vINCh0L/QuNGB0L7QuiDRgtC40L/QvtCyINC60LDRgNGC0Ytcbi8vICAgICAgICAgIC5hZGQoJ21hcFRvb2xzJywgeyByaWdodDogMzUsIHRvcDogMzUgfSk7IC8vINCh0YLQsNC90LTQsNGA0YLQvdGL0Lkg0L3QsNCx0L7RgCDQutC90L7Qv9C+0LogICBdXG4gICAgICB0aGlzLmRyYXdMb2NhdGlvbnMoKVxuICAgIH0sXG5cbiAgICBiaW5kRXZlbnRzOiBmdW5jdGlvbigpe1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBfLmJpbmQodGhpcy5rZXlVcExpc3RlbmVyLCB0aGlzKSk7XG5cbiAgICAgIEJhY2tib25lLm9uKCd1cGRhdGU6bG9jYXRpb24nLCBfLmJpbmQoZnVuY3Rpb24obW9kZWwpe1xuICAgICAgICB0aGlzLnJlbW92ZUxvY2F0aW9uKG1vZGVsKVxuICAgICAgICB0aGlzLmRyYXdMb2NhdGlvbihtb2RlbClcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgc3RhdGUuZ2V0KFwibG9jYXRpb25zXCIpLm9uKCdyZW1vdmUnLCBfLmJpbmQoZnVuY3Rpb24obW9kZWwpe1xuICAgICAgICB0aGlzLnJlbW92ZUxvY2F0aW9uKG1vZGVsKTtcbiAgICAgIH0sIHRoaXMpKVxuXG4gICAgICB2YXIgZHVyYXRpb24gPSAzMDA7XG5cbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdjbGljazpvYmplY3QnLCBmdW5jdGlvbihvYmplY3Qpe1xuICAgICAgICBpZiAob2JqZWN0ICYmIG9iamVjdC5nZXQoJ3N0YXJ0Jykpe1xuICAgICAgICAgIG1hcC5wYW5UbyhvYmplY3QuZ2V0KCdzdGFydCcpLHtkZWxheTowLCBkdXJhdGlvbjpkdXJhdGlvbn0pO1xuICAgICAgICAgIHNldFRpbWVvdXQoXy5iaW5kKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAob2JqZWN0LmlzVG93ZXIoKSAmJiB0aGlzLmdldFRvd2VyKG9iamVjdC5jaWQpKXtcbiAgICAgICAgICAgICAgdGhpcy5nZXRUb3dlcihvYmplY3QuY2lkKS5vcGVuQmFsbG9vbigpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmplY3QuaXMoJ3BvaW50Jykpe1xuICAgICAgICAgICAgICB0aGlzLnNob3dQb2ludEhpbnQob2JqZWN0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHRoaXMpLCBkdXJhdGlvbiArIDUwKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKVxuXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOmxvY2F0aW9uJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGFjdGl2ZSA9IHN0YXRlLmdldCgnbG9jYXRpb24nKVxuICAgICAgICBpZiAoIWFjdGl2ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlbW92ZVRvd2VycygpO1xuICAgICAgICB0aGlzLnJlbW92ZVBvaW50cygpO1xuICAgICAgICB0aGlzLmRlc3Ryb3lDdXJyZW50T2JqZWN0KCk7IC8vaWYgYW55XG5cbiAgICAgICAgaWYgKGFjdGl2ZS5pc05ldygpKSByZXR1cm47XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgYWN0aXZlLmdldFRvd2VycygpLm9uKCdkZXN0cm95JywgZnVuY3Rpb24obSl7XG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gc2VsZi50b3dlcnNHZW9PYmplY3RzW20uY2lkXTtcbiAgICAgICAgICAgIGlmIChvYmplY3QpIG9iamVjdC5yZW1vdmUoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNlbGYuZHJhd1Rvd2VycyhhY3RpdmUuZ2V0VG93ZXJzKCkpO1xuICAgICAgICAgICAgc2VsZi5kcmF3UG9pbnRzKCk7XG4gICAgICAgICAgfSwgZHVyYXRpb24gKyA1MClcbiAgICAgICAgfSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdjaGFuZ2U6c2hvd0xvY2F0aW9ucycsIGZ1bmN0aW9uKHN0YXRlLCAgdmFsKXtcbiAgICAgICB0aGlzLmRyYXdMb2NhdGlvbnMoKVxuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdjaGFuZ2U6c2hvd1BvaW50cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZHJhd1BvaW50cygpO1xuICAgICAgfSwgdGhpcylcblxuICAgICAgdGhpcy5saXN0ZW5UbyhzdGF0ZS5nZXQoJ3BvaW50cycpLCAnZGVzdHJveScsIGZ1bmN0aW9uKG1vZGVsKXtcbiAgICAgICAgdmFyIG9iamVjdCA9IHRoaXMucG9pbnRzR2VvT2JqZWN0c1ttb2RlbC5jaWRdO1xuICAgICAgICBpZiAob2JqZWN0KSBvYmplY3QucmVtb3ZlKCk7XG4gICAgICB9LCB0aGlzKVxuXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAncmVkcmF3OnBvaW50JywgZnVuY3Rpb24obW9kZWwpe1xuICAgICAgICB2YXIgb2JqZWN0ID0gdGhpcy5wb2ludHNHZW9PYmplY3RzW21vZGVsLmNpZF07XG4gICAgICAgIGlmIChvYmplY3QpIG9iamVjdC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5kcmF3UG9pbnQobW9kZWwpXG4gICAgICB9LCB0aGlzKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDQo9GB0YLQsNC90LDQstC70LjQstCw0LXRgiDQvtCx0YrQtdC60YIsINGB0L7Qt9C00LDQvdC40LXQvCDQuNC70Lgg0YDQtdC00LDQutGC0LjRgNC+0LLQsNC90LjQtdC8INC6LdCz0L4g0LfQsNC90LjQvNCw0LXRgtGB0Y8g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINCyINGC0LXQutGD0YnQuNC5INC80L7QvNC10L3Rgi5cbiAgICAgKiDQnNC+0LbQtdGCINCx0YvRgtGMINCy0YvRiNC60L7QuSDQuNC70Lgg0LvQvtC60LDRhtC40LXQuS5cbiAgICAgKi9cbiAgICBzZXRNb2RlbDogZnVuY3Rpb24obW9kZWwpe1xuICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xuICAgICAgdGhpcy5kZXN0cm95Q3VycmVudE9iamVjdCgpOyAvL2lmIGFueVxuICAgIH0sXG5cbiAgICBrZXlVcExpc3RlbmVyOiBmdW5jdGlvbihlKXtcbiAgICAgIGlmIChlLmtleUNvZGUgPT0gMjcpeyAvL0VTQ1xuICAgICAgICBpZiAodGhpcy5tb2RlbCl7XG4gICAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xuICAgICAgICAgICAgc3RhcnQ6IG51bGwsXG4gICAgICAgICAgICBlbmQ6IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlc3Ryb3lDdXJyZW50T2JqZWN0KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlc3Ryb3lDdXJyZW50T2JqZWN0OiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMub2JqZWN0KXtcbiAgICAgICAgdGhpcy5vYmplY3QucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZml0c1RvTG9jYXRpb246IGZ1bmN0aW9uKHN0YXJ0KXtcbiAgICAgIHZhciBsb2NhdGlvbiA9IHN0YXRlLmdldCgnbG9jYXRpb24nKTtcbiAgICAgIHZhciBkaXN0YW5jZSA9IEdlby5nZXREaXN0YW5jZShzdGFydCwgbG9jYXRpb24uZ2V0KCdzdGFydCcpKTtcbiAgICAgIHJldHVybiBkaXN0YW5jZSA8PSBsb2NhdGlvbi5nZXQoJ3JhZGl1cycpO1xuICAgIH0sXG5cbiAgICBvbkNsaWNrOiBmdW5jdGlvbihlKXtcbiAgICAgIGNvbnNvbGUubG9nKCdjbGljaycpXG4gICAgICBpZiAoIXRoaXMubW9kZWwpIHJldHVybjtcbiAgICAgIHZhciBtb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICB2YXIgcG9pbnQgPSBlLmdldCgnY29vcmRzJyk7XG4gICAgICBpZiAoIW1vZGVsLmdldCgnc3RhcnQnKSl7XG4gICAgICAgIHZhciBzdGFydCA9IHBvaW50O1xuICAgICAgICBpZiAobW9kZWwuaXNUb3dlcigpKXtcbiAgICAgICAgICBpZiAoIXRoaXMuZml0c1RvTG9jYXRpb24oc3RhcnQpKXtcbiAgICAgICAgICAgIGFsZXJ0KCfQlNCw0L3QvdCw0Y8g0YLQvtGH0LrQsCDQvdC1INC/0YDQuNC90LDQtNC70LXQttC40YIg0YLQtdC60YPRidC10Lkg0LvQvtC60LDRhtC40LguJylcbiAgICAgICAgICAgIHN0YXJ0ID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbW9kZWwuc2V0KHtzdGFydDogc3RhcnR9KTtcbiAgICAgICAgaWYgKG1vZGVsLmlzKCdwb2ludCcpKXtcbiAgICAgICAgICBtb2RlbC5zZXROYW1lKClcbiAgICAgICAgICBtb2RlbC5zYXZlKHt2YWxpZGF0ZTogZmFsc2V9KTtcbiAgICAgICAgICB0aGlzLmRyYXcobW9kZWwpXG4gICAgICAgICAgc3RhdGUuZ2V0KCdwb2ludHMnKS5hZGQobW9kZWwpO1xuICAgICAgICAgIHN0YXRlLnNldCgnZWRpdE1vZGVsJywgbnVsbClcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobW9kZWwuaXNUb3dlcigpKXtcbiAgICAgICAgICB0aGlzLnNldEVuZChwb2ludCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vZGVsLmlzVmFsaWQoKSl7XG4gICAgICAgICAgbW9kZWwudHJpZ2dlcignYmVmb3JlU2F2ZScpXG4gICAgICAgICAgbW9kZWwuc2F2ZSh7dmFsaWRhdGU6IGZhbHNlfSk7XG4gICAgICAgICAgdGhpcy5kcmF3KG1vZGVsKVxuICAgICAgICAgIGlmIChtb2RlbC5pc1Rvd2VyKCkpe1xuICAgICAgICAgICAgc3RhdGUuZ2V0KCdsb2NhdGlvbicpLmdldFRvd2VycygpLmFkZChtb2RlbCk7XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKG1vZGVsLmlzKCdsb2NhdGlvbicpKXtcbiAgICAgICAgICAgIHN0YXRlLnNldCgnbG9jYXRpb24nLCBtb2RlbClcbiAgICAgICAgICAgIHN0YXRlLmdldCgnbG9jYXRpb25zJykuYWRkKG1vZGVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBudWxsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnRyaWdnZXIoJ2NsaWNrJylcbiAgICB9LFxuXG4gICAgb25Ib3ZlcjogZnVuY3Rpb24oZSl7XG4gICAgICBjb25zb2xlLmxvZygnaG92ZXInKVxuICAgICAgaWYgKCF0aGlzLm1vZGVsKSByZXR1cm47XG4gICAgICBpZiAoIXRoaXMubW9kZWwuZ2V0KCdzdGFydCcpKSByZXR1cm47XG4gICAgICB2YXIgZW5kID0gZS5nZXQoJ2Nvb3JkcycpLFxuICAgICAgICAgIF9lbmQgPSB0aGlzLm1vZGVsLmdldCgnZW5kJyk7XG4gICAgICBpZiAoX2VuZFxuICAgICAgICAgICYmIE1hdGguYWJzKF9lbmRbMF0gLSBlbmRbMF0pIDwgMC4wMDAxXG4gICAgICAgICAgJiYgTWF0aC5hYnMoX2VuZFsxXSAtIGVuZFsxXSkgPCAwLjAwMDEpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnNldEVuZChlbmQpO1xuXG4gICAgICB2YXIgcHJldmlvdXMgPSB0aGlzLm9iamVjdDtcblxuICAgICAgaWYgKHRoaXMubW9kZWwuaXNUb3dlcigpKXtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBuZXcgU2VjdG9yKHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpLCB0aGlzLm1vZGVsLmF0dHJpYnV0ZXMsIG1hcCwge3Jhdzp0cnVlfSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubW9kZWwuaXMoJ2xvY2F0aW9uJykpe1xuICAgICAgICB0aGlzLm9iamVjdCA9IHRoaXMuZHJhd0xvY2F0aW9uKHRoaXMubW9kZWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmRyYXdQb2ludCh0aGlzLm1vZGVsLCB7ZWRpdDogdHJ1ZX0pO1xuICAgICAgfVxuICAgICAgdGhpcy5vYmplY3QucmVuZGVyICYmIHRoaXMub2JqZWN0LnJlbmRlcigpO1xuICAgICAgaWYgKHByZXZpb3VzKXtcbiAgICAgICAgcHJldmlvdXMucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldEVuZDogZnVuY3Rpb24oZW5kKXtcbiAgICAgIHZhciByYWRpdXMgPSBHZW8uZ2V0RGlzdGFuY2UodGhpcy5tb2RlbC5nZXQoJ3N0YXJ0JyksIGVuZCk7XG4gICAgICBpZiAodGhpcy5tb2RlbC5pcygndG93ZXInKSl7XG4gICAgICAgIHJhZGl1cyA9IE1hdGgubWluKHJhZGl1cywgMTUwMDApO1xuICAgICAgfVxuICAgICAgdGhpcy5tb2RlbC5zZXQoe1xuICAgICAgICBhemltdXRoOiBHZW8uZ2V0QXppbXV0aCh0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSwgZW5kKSxcbiAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgIGVuZDogZW5kXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24obW9kZWwpe1xuICAgICAgaWYgKG1vZGVsLmlzVG93ZXIoKSl7XG4gICAgICAgIGlmICghbW9kZWwuX2lzTmV3KCkpeyAvL9C10YHQu9C4INC/0YDQsNCy0LrQsCDRg9C20LUg0YHRg9GJ0LXRgdGC0LLRg9GO0YnQtdC5INCy0YvRiNC60LhcbiAgICAgICAgICB0aGlzLnJlbW92ZVRvd2VyKG1vZGVsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXdUb3dlcihtb2RlbCk7XG5cbiAgICAgIH0gZWxzZSBpZiAobW9kZWwuaXMoJ2xvY2F0aW9uJykpe1xuICAgICAgICB0aGlzLmRyYXdMb2NhdGlvbihtb2RlbCk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZHJhd1BvaW50KG1vZGVsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlVG93ZXI6IGZ1bmN0aW9uKG1vZGVsKXtcbiAgICAgIGlmIChtb2RlbC5pc0hpZ2h3YXkoKSl7XG4gICAgICAgIHRoaXMucmVtb3ZlVG93ZXJPYmoobW9kZWwuY2lkICsgJzAnKTtcbiAgICAgICAgdGhpcy5yZW1vdmVUb3dlck9iaihtb2RlbC5jaWQgKyAnMScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb3dlck9iaihtb2RlbC5jaWQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW1vdmVUb3dlck9iajogZnVuY3Rpb24oaWQpe1xuICAgICAgdmFyIG9iamVjdCA9IHRoaXMudG93ZXJzR2VvT2JqZWN0c1tpZF07XG4gICAgICBvYmplY3QgJiYgb2JqZWN0LnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICByZW1vdmVMb2NhdGlvbjogZnVuY3Rpb24obW9kZWwpe1xuICAgICAgdmFyIGFyciA9IHRoaXMubG9jYXRpb25HZW9PYmplY3RzW21vZGVsLmNpZF07XG4gICAgICBhcnIgJiYgXy5lYWNoKGFyciwgZnVuY3Rpb24oZWwpe1xuICAgICAgICBlbC5yZW1vdmUoKVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldFRvd2VyOiBmdW5jdGlvbihjaWQpe1xuICAgICAgcmV0dXJuIHRoaXMudG93ZXJzR2VvT2JqZWN0c1tjaWRdO1xuICAgIH0sXG5cbiAgICBkcmF3VG93ZXI6IGZ1bmN0aW9uKHRvd2VyKXtcbiAgICAgIGlmICh0b3dlci5pcygnaGlnaHdheScpKXtcbiAgICAgICAgdGhpcy50b3dlcnNHZW9PYmplY3RzW3Rvd2VyLmNpZCArICcwJ10gPSBuZXcgU2VjdG9yKHRvd2VyLmdldCgnc3RhcnQnKSwgdG93ZXIuYXR0cmlidXRlcywgbWFwKS5yZW5kZXIoKTtcbiAgICAgICAgdmFyIGF0dHJzID0gXy5jbG9uZSh0b3dlci5hdHRyaWJ1dGVzKSxcbiAgICAgICAgICAgIGEgPSBhdHRycy5hemltdXRoO1xuICAgICAgICBhdHRycy5hemltdXRoID0gYSA+IDAgPyBhIC0gTWF0aC5QSSA6IE1hdGguUEkgKyBhO1xuICAgICAgICB0aGlzLnRvd2Vyc0dlb09iamVjdHNbdG93ZXIuY2lkICsgJzEnXSA9IG5ldyBTZWN0b3IodG93ZXIuZ2V0KCdlbmQnKSwgYXR0cnMsIG1hcCkucmVuZGVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRvd2Vyc0dlb09iamVjdHNbdG93ZXIuY2lkXSA9IG5ldyBTZWN0b3IodG93ZXIuZ2V0KCdzdGFydCcpLCB0b3dlci5hdHRyaWJ1dGVzLCBtYXApLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjcmVhdGVDaXJjbGU6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKXtcbiAgICAgIHZhciBjaXJjbGUgPSBuZXcgeW1hcHMuQ2lyY2xlKFxuICAgICAgICBbXG4gICAgICAgICAgbW9kZWwuZ2V0KCdzdGFydCcpLFxuICAgICAgICAgIG1vZGVsLmdldCgncmFkaXVzJylcbiAgICAgICAgXSxcbiAgICAgICAge30sXG4gICAgICAgIF8uZXh0ZW5kKHtcbiAgICAgICAgICBpbnRlcmFjdGl2aXR5TW9kZWw6ICdkZWZhdWx0I3RyYW5zcGFyZW50JyxcbiAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXG4gICAgICAgIH0sIG9wdGlvbnMpXG4gICAgICApO1xuICAgICAgbWFwLmdlb09iamVjdHMuYWRkKGNpcmNsZSk7XG4gICAgICB2YXIgcmVzdWx0ID0gbmV3IENpcmNsZShjaXJjbGUpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZHJhd0xvY2F0aW9uOiBmdW5jdGlvbihtb2RlbCl7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5jcmVhdGVDaXJjbGUobW9kZWwsIHtcbiAgICAgICAgZmlsbENvbG9yOiBcIiMwMDAwXCIsXG4gICAgICAgIHN0cm9rZUNvbG9yOiBcIiM4M2hcIixcbiAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC40LFxuICAgICAgICBzdHJva2VXaWR0aDogMlxuICAgICAgfSk7XG4gICAgICB0aGlzLmxvY2F0aW9uR2VvT2JqZWN0c1ttb2RlbC5jaWRdID0gdGhpcy5sb2NhdGlvbkdlb09iamVjdHNbbW9kZWwuY2lkXSB8fCBbXTtcbiAgICAgIHRoaXMubG9jYXRpb25HZW9PYmplY3RzW21vZGVsLmNpZF0ucHVzaChyZXN1bHQpXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBkcmF3UG9pbnRzOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHZhbHVlID0gc3RhdGUuZ2V0KCdzaG93UG9pbnRzJyksXG4gICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAodmFsdWUpe1xuICAgICAgICB2YXIgcG9pbnRzID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpLmdldFBvaW50cygpXG4gICAgICAgIHBvaW50cy5lYWNoKGZ1bmN0aW9uKHBvaW50KXtcbiAgICAgICAgICBzZWxmLmRyYXdQb2ludChwb2ludClcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZVBvaW50cygpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGRyYXdQb2ludDogZnVuY3Rpb24obW9kZWwsIG9wdHMpe1xuICAgICAgb3B0cyA9IG9wdHMgfHwge31cbiAgICAgIHZhciB0b3dlciA9IG1vZGVsLmdldFRvd2VyKCk7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5jcmVhdGVDaXJjbGUobW9kZWwsIHtcbiAgICAgICAgZmlsbENvbG9yOiB0b3dlci5nZXRDb2xvcigpLFxuICAgICAgICBzdHJva2VDb2xvcjogdG93ZXIuZ2V0Q29sb3IoKSxcbiAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC40LFxuICAgICAgICB6SW5kZXg6IDk5OTk5LFxuICAgICAgICBvcGFjaXR5OiBtb2RlbC5pcygncG9pbnQnKSA/IDAuOCA6IDFcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wb2ludHNHZW9PYmplY3RzW21vZGVsLmNpZF0gPSByZXN1bHRcblxuICAgICAgaWYgKCFvcHRzLmVkaXQpe1xuICAgICAgICByZXN1bHQuZGF0YS5tb2RlbENpZCA9IG1vZGVsLmNpZFxuICAgICAgICByZXN1bHQuZGF0YS5ldmVudHMuYWRkKCdtb3VzZWVudGVyJywgXy5iaW5kKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyIGNpZCA9IGUuZ2V0KCd0YXJnZXQnKS5tb2RlbENpZDtcbiAgICAgICAgICB2YXIgcG9pbnQgPSBzdGF0ZS5nZXQoJ3BvaW50cycpLmdldChjaWQpXG4gICAgICAgICAgdGhpcy5zaG93UG9pbnRIaW50KHBvaW50KVxuICAgICAgICB9LCB0aGlzKSlcbiAgICAgICAgLmFkZCgnbW91c2VsZWF2ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBtYXAuaGludC5jbG9zZSgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgc2hvd1BvaW50SGludDogZnVuY3Rpb24ocG9pbnQpe1xuICAgICAgbWFwLmhpbnQub3Blbihwb2ludC5nZXQoJ3N0YXJ0JyksIHBvaW50LmdldFRvd2VyKCkuZ2V0KCduYW1lJykgKyAnIC0gJyArIHBvaW50LmdldCgnbmFtZScpKTtcbiAgICB9LFxuXG4gICAgZHJhd1Rvd2VyczogZnVuY3Rpb24odG93ZXJzKXtcbiAgICAgIHRvd2Vycy5lYWNoKF8uYmluZChmdW5jdGlvbih0b3dlcil7XG4gICAgICAgIHZhciBmcmVxID0gdG93ZXIuZ2V0RnJlcV8oKTtcbiAgICAgICAgaWYgKGZyZXEuc2hvdWxkU2hvdygpKXtcbiAgICAgICAgICB0b3dlci5zZXQoJ2NvbG9yJywgZnJlcS5nZXQoJ2NvbG9yJykpO1xuICAgICAgICAgIHRoaXMuZHJhd1Rvd2VyKHRvd2VyKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICByZWRyYXdUb3dlcnM6IGZ1bmN0aW9uKHRvd2Vycyl7XG4gICAgICB0b3dlcnMuZWFjaChfLmJpbmQoZnVuY3Rpb24odG93ZXIpe1xuICAgICAgICB0aGlzLnJlbW92ZVRvd2VyKHRvd2VyKVxuICAgICAgICBpZiAodG93ZXIuZ2V0RnJlcV8oKS5zaG91bGRTaG93KCkpe1xuICAgICAgICAgIHRvd2VyLnVwZGF0ZUNvbG9yKClcbiAgICAgICAgICB0aGlzLmRyYXdUb3dlcih0b3dlcilcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpXG4gICAgfSxcblxuICAgIGlzU2hvd246IGZ1bmN0aW9uKHRvd2VyKXtcbiAgICAgIHJldHVybiB0aGlzLnRvd2Vyc0dlb09iamVjdHNbdG93ZXIuY2lkXSB8fCB0aGlzLnRvd2Vyc0dlb09iamVjdHNbdG93ZXIuY2lkICsgJzAnXVxuICAgIH0sXG5cbiAgICBkcmF3TG9jYXRpb25zOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHNob3cgPSBzdGF0ZS5nZXQoJ3Nob3dMb2NhdGlvbnMnKVxuICAgICAgdGhpcy5yZW1vdmVMb2NhdGlvbnMoKTtcbiAgICAgIGlmIChzaG93KXtcbiAgICAgICAgc3RhdGUuZ2V0KCdsb2NhdGlvbnMnKS5lYWNoKF8uYmluZChmdW5jdGlvbihsb2Mpe1xuICAgICAgICAgIHRoaXMuZHJhd0xvY2F0aW9uKGxvYyk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlQWxsOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5yZW1vdmVMb2NhdGlvbnMoKTtcbiAgICAgIHRoaXMucmVtb3ZlVG93ZXJzKCk7XG4gICAgICB0aGlzLnJlbW92ZVBvaW50cygpO1xuICAgIH0sXG5cbiAgICByZW1vdmVUb3dlcnM6IGZ1bmN0aW9uKCl7XG4gICAgICBfLmZvck93bih0aGlzLnRvd2Vyc0dlb09iamVjdHMsIGZ1bmN0aW9uKHQpe1xuICAgICAgICB0LnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnRvd2Vyc0dlb09iamVjdHMgPSB7fTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlTG9jYXRpb25zOiBmdW5jdGlvbigpe1xuICAgICAgXy5lYWNoKHRoaXMubG9jYXRpb25HZW9PYmplY3RzLCBfLmJpbmQoZnVuY3Rpb24oYXJyKXtcbiAgICAgICAgXy5lYWNoKGFyciwgZnVuY3Rpb24oZWwpe1xuICAgICAgICAgIGVsLnJlbW92ZSgpXG4gICAgICAgIH0pO1xuICAgICAgfSwgdGhpcykpO1xuICAgICAgdGhpcy5sb2NhdGlvbkdlb09iamVjdHMgPSB7fTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlUG9pbnRzOiBmdW5jdGlvbigpe1xuICAgICAgXy5lYWNoKHRoaXMucG9pbnRzR2VvT2JqZWN0cywgZnVuY3Rpb24ocG9pbnQpe1xuICAgICAgICBwb2ludC5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wb2ludHNHZW9PYmplY3RzID0ge307XG4gICAgfVxuXG4gIH0pO1xuXG59KCkpO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHdpbmRvdy5GaWVsZFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRzKXtcbiAgICAgIF8uYmluZEFsbCh0aGlzKVxuICAgICAgdmFyICRpbnB1dCA9IHRoaXMuJGlucHV0ID0gb3B0cy4kZWw7XG4gICAgICB2YXIgZmllbGQgPSB0aGlzLmZpZWxkTmFtZSA9IF8uaXNTdHJpbmcob3B0cy5maWVsZCkgPyBvcHRzLmZpZWxkIDogb3B0cy5maWVsZC5uYW1lO1xuICAgICAgdGhpcy5maWVsZCA9IF8uaXNPYmplY3Qob3B0cy5maWVsZCkgPyBvcHRzLmZpZWxkIDoge25hbWU6IGZpZWxkfTtcbiAgICAgIHZhciBtb2RlbCA9IHRoaXMubW9kZWwgPSBvcHRzLm1vZGVsO1xuICAgICAgaWYgKCFmaWVsZClcbiAgICAgICAgY29uc29sZS53YXJuKCdDcmVhdGluZyBGaWVsZFZpZXcgZm9yIFwibnVsbFwiIGZpZWxkJyk7XG4gICAgICBpZiAoISRpbnB1dC5sZW5ndGgpXG4gICAgICAgIGNvbnNvbGUud2FybihcIk5vIGlucHV0IGZvdW5kIGZvciBmaWVsZCBgXCIgKyBmaWVsZCArIFwiYFwiKTtcbiAgICAgIGlmICghbW9kZWwpXG4gICAgICAgIGNvbnNvbGUud2FybignTm8gbW9kZWwgZGVmaW5lZCBmb3IgZmllbGQgJyArIGZpZWxkKTtcbiAgICAgIHRoaXMuYmluZEZpZWxkKCk7XG4gICAgfSxcblxuICAgIGJpbmRGaWVsZDogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuaXNDaGFuZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy4kaW5wdXQub24odGhpcy5nZXRQcm9wZXJ0eVRvTGlzdGVuVG8oKSwgdGhpcy5pbnB1dENoYW5nZUxpc3RlbmVyKVxuICAgICAgdGhpcy5tb2RlbC5vbignY2hhbmdlOicgKyB0aGlzLmZpZWxkTmFtZSwgdGhpcy5tb2RlbENoYW5nZUxpc3RlbmVyKVxuICAgICAgdGhpcy5tb2RlbC5vbignaW52YWxpZDonICsgdGhpcy5maWVsZE5hbWUsIHRoaXMuaW52YWxpZExpc3RlbmVyKVxuICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLm1vZGVsLmdldCh0aGlzLmZpZWxkTmFtZSkpXG4gICAgfSxcblxuICAgIGlucHV0Q2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnJlbW92ZUVycm9ycygpO1xuICAgICAgdGhpcy5pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0UmF3VmFsdWUoKTtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5tb2RlbC5nZXQodGhpcy5maWVsZE5hbWUpXG4gICAgICBpZiAodGhpcy5pc1ZhbGlkKHZhbHVlKSl7XG4gICAgICAgIHZhciB2YWwgPSB0aGlzLnBhcnNlVmFsdWUodmFsdWUpXG4gICAgICAgIHZhciBlcXVhbHMgPSBjdXJyZW50ID09IHZhbCB8fCBfLmlzRXF1YWwoY3VycmVudCwgdmFsKTtcbiAgICAgICAgaWYgKCFlcXVhbHMpe1xuICAgICAgICAgIHRoaXMubW9kZWwuc2V0KHRoaXMuZmllbGROYW1lLCB2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tb2RlbC5zZXQodGhpcy5maWVsZE5hbWUsIGN1cnJlbnQpIC8vcmV2ZXJ0IGJhY2sgdG8gcHJldmlvdXMgdmFsdWVcbiAgICAgICAgdGhpcy5zZXRWYWx1ZShjdXJyZW50KVxuICAgICAgfVxuICAgICAgdGhpcy5pc0NoYW5naW5nID0gZmFsc2VcbiAgICB9LFxuXG4gICAgbW9kZWxDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICghdGhpcy5pc0NoYW5naW5nKXtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLm1vZGVsLmdldCh0aGlzLmZpZWxkTmFtZSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBhbHJlYWR5IGNoYW5naW5nIC0gc28gZG8gbm90aGluZ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpbnZhbGlkTGlzdGVuZXI6IGZ1bmN0aW9uKG1zZyl7XG4gICAgICB2YXIgZ3JvdXAgPSB0aGlzLiRpbnB1dC5wYXJlbnRzKCcuZm9ybS1ncm91cCcpXG4gICAgICBncm91cC5yZW1vdmVDbGFzcygnaGFzLWVycm9yJylcbiAgICAgIHRoaXMuc2V0RXJyb3JNZXNzYWdlKG1zZylcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgZ3JvdXAuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpXG4gICAgICAgIGdyb3VwLmFkZENsYXNzKCdmb3JjZScpXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBncm91cC5yZW1vdmVDbGFzcygnZm9yY2UnKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgcmVtb3ZlRXJyb3JzOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGdyb3VwID0gdGhpcy4kaW5wdXQucGFyZW50cygnLmZvcm0tZ3JvdXAnKVxuICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpXG4gICAgICBncm91cC5yZW1vdmVDbGFzcygnZm9yY2UnKVxuICAgICAgdGhpcy5zZXRFcnJvck1lc3NhZ2UoJycpXG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuJGlucHV0Lm9mZih0aGlzLmdldFByb3BlcnR5VG9MaXN0ZW5UbygpLCB0aGlzLmlucHV0Q2hhbmdlTGlzdGVuZXIpXG4gICAgICB0aGlzLm1vZGVsLm9mZignY2hhbmdlOicgKyB0aGlzLmZpZWxkTmFtZSwgdGhpcy5tb2RlbENoYW5nZUxpc3RlbmVyKVxuICAgICAgdGhpcy5tb2RlbC5vZmYoJ2ludmFsaWQ6JyArIHRoaXMuZmllbGROYW1lLCB0aGlzLmludmFsaWRMaXN0ZW5lcilcbiAgICAgIHRoaXMub2ZmKClcbiAgICB9LFxuXG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGlucHV0ID0gdGhpcy4kaW5wdXQ7XG4gICAgICB2YXIgdHlwZSA9ICRpbnB1dC5wcm9wKCd0eXBlJyk7XG4gICAgICBzd2l0Y2ggKHR5cGUpe1xuICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxuICAgICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcbiAgICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICAgIHJldHVybiAkaW5wdXQudmFsKCk7XG4gICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICByZXR1cm4gJGlucHV0LmlzKCc6Y2hlY2tlZCcpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbnQgZ2V0IHZhbHVlIG9mIGBcIiArICRpbnB1dC5zZWxlY3RvciArICdgJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZVZhbHVlKHRoaXMuZ2V0UmF3VmFsdWUoKSk7XG4gICAgfSxcblxuXG4gICAgZ2V0UHJvcGVydHlUb0xpc3RlblRvOiBmdW5jdGlvbigpe1xuICAgICAgdmFyICRpbnB1dCA9IHRoaXMuJGlucHV0O1xuICAgICAgc3dpdGNoICgkaW5wdXQucHJvcCgndHlwZScpKXtcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgICByZXR1cm4gJ2tleXVwJztcbiAgICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICAgIHJldHVybiAnY2hhbmdlJztcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUud2FybignQ2FudCBiaW5kIHRvIGZpZWxkIGAnICsgdGhpcy5maWVsZE5hbWUgKyAnYCcpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIHBhcnNlVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHZhciBleHBlY3RlZE1ldGhvZE5hbWUgPSAncGFyc2UnICsgdGhpcy5maWVsZE5hbWVbMF0udG9VcHBlckNhc2UoKSArIHRoaXMuZmllbGROYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIHZhciBwcm9wID0gdGhpcy5tb2RlbFtleHBlY3RlZE1ldGhvZE5hbWVdXG4gICAgICBpZiAocHJvcCl7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24ocHJvcCkpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdjYWxsaW5nIFwiJyArIGV4cGVjdGVkTWV0aG9kTmFtZSArICdcIiBvbiAnICsgdGhpcy50b1N0cmluZygpKVxuICAgICAgICAgIHJldHVybiBwcm9wLmNhbGwodGhpcywgdmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Byb3BlcnR5IFwiJyArIGV4cGVjdGVkTWV0aG9kTmFtZSArICdcIiByZWdpc3RlcmVkLCBidXQgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBwcmVwYXJlVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHZhciBleHBlY3RlZE1ldGhvZE5hbWUgPSAncHJlcGFyZScgKyB0aGlzLmZpZWxkTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgdGhpcy5maWVsZE5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgdmFyIHByb3AgPSB0aGlzLm1vZGVsW2V4cGVjdGVkTWV0aG9kTmFtZV1cbiAgICAgIGlmIChwcm9wKXtcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihwcm9wKSl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2NhbGxpbmcgXCInICsgZXhwZWN0ZWRNZXRob2ROYW1lICsgJ1wiIG9uICcgKyB0aGlzLnRvU3RyaW5nKCkpXG4gICAgICAgICAgcmV0dXJuIHByb3AuY2FsbCh0aGlzLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygncHJvcGVydHkgXCInICsgZXhwZWN0ZWRNZXRob2ROYW1lICsgJ1wiIHJlZ2lzdGVyZWQsIGJ1dCBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIHNldFZhbHVlOiBmdW5jdGlvbih2KXtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucHJlcGFyZVZhbHVlKHYpLFxuICAgICAgICAgIHR5cGUgPSB0aGlzLiRpbnB1dC5wcm9wKCd0eXBlJyk7XG4gICAgICBzd2l0Y2ggKHR5cGUpe1xuICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxuICAgICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIGNhc2UgJ3NlbGVjdC1vbmUnOlxuICAgICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgICAgIHRoaXMuJGlucHV0LnZhbCh2YWx1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICB0aGlzLiRpbnB1dC5wcm9wKCdjaGVja2VkJywgdmFsdWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbnQgc2V0IHZhbHVlIHRvIGBcIiArIHRoaXMuJGlucHV0LnNlbGVjdG9yICsgJ2AnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBpc1ZhbGlkOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBpZiAodGhpcy5maWVsZC50eXBlKXtcbiAgICAgICAgc3dpdGNoICh0aGlzLmZpZWxkLnR5cGUpe1xuICAgICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgIHJldHVybiAhaXNOYU4odmFsdWUpIHx8IHZhbHVlLnJlcGxhY2UgJiYgIWlzTmFOKHZhbHVlLnJlcGxhY2UoJywnLCAnLicpKTtcbiAgICAgICAgICBjYXNlICdpbnQnIDpcbiAgICAgICAgICAgIHJldHVybiAhaXNOYU4odmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBnZXRJbnB1dDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLiRpbnB1dDtcbiAgICB9LFxuXG4gICAgc2V0RXJyb3JNZXNzYWdlOiBmdW5jdGlvbihtc2cpe1xuICAgICAgdmFyIGVsID0gdGhpcy5mb3JtR3JvdXAoKS5maW5kKCcuZXJyb3ItbXNnJyk7XG4gICAgICBlbC5odG1sKG1zZylcbiAgICB9LFxuXG4gICAgZm9ybUdyb3VwOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuJGlucHV0LnBhcmVudHMoJy5mb3JtLWdyb3VwJyk7XG4gICAgfVxuXG5cblxuICB9KVxuXG59KCkpO1xuIiwidmFyIFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL1ZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gVmlldy5leHRlbmQoe1xuXG4gICAgX2dldE1vZGVsOiBmdW5jdGlvbigkZWwpe1xuICAgICAgdmFyIGNpZCA9ICRlbC5wYXJlbnQoJ2xpJykuZGF0YSgnY2lkJyk7XG4gICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmdldChjaWQpO1xuICAgIH0sXG5cbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAubGlzdC1lbCc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICB2YXIgZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KCRlbC5kYXRhKCdjaWQnKSk7XG4gICAgICAgIHRoaXMuX19zZXRBY3RpdmUoZWwsIHskZWw6JGVsLCBjbGljazp0cnVlfSk7XG4gICAgICB9LFxuICAgICAgJ21vdXNlZG93biAuYWRkJzogZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciAkZWwgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICRlbC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgIH0sXG4gICAgICAnY2xpY2sgLmFkZCc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMuX2NyZWF0ZU1vZGVsKCk7XG4gICAgICAgIGlmIChtb2RlbCl7XG4gICAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBtb2RlbCk7XG4gICAgICAgICAgdGhpcy5fX3NldEFjdGl2ZShtb2RlbCwge2FkZDp0cnVlLCBjbGljazp0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgICdjbGljayAucmVtb3ZlJzogZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciAkZWwgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKCRlbCk7XG4gICAgICAgIGlmICh0aGlzLl9jYW5SZW1vdmUobW9kZWwpICYmIGNvbmZpcm0odGhpcy5fcmVtb3ZlTXNnKCkpKXtcbiAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgICdjbGljayAuZWRpdCc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgkZWwpO1xuICAgICAgICB0aGlzLl9lZGl0TW9kZWwobW9kZWwsICRlbClcbiAgICAgICAgdGhpcy5fX3NldEFjdGl2ZShtb2RlbCwgeyRlbDokZWwsIGNsaWNrOnRydWV9KVxuICAgICAgfSxcblxuICAgICAgJ21vdXNlZW50ZXIgLmxpc3QtZWwnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmZpbmQoJy5nbHlwaGljb24nKS5zaG93KCk7XG4gICAgICB9LFxuICAgICAgJ21vdXNlbGVhdmUgLmxpc3QtZWwnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmZpbmQoJy5nbHlwaGljb24nKS5oaWRlKCk7XG4gICAgICB9LFxuXG4gICAgICAnY2hhbmdlIC5zaG93LWxvY2F0aW9ucyc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICBzdGF0ZS5zZXQoJ3Nob3dMb2NhdGlvbnMnLCAkZWwuaXMoXCI6Y2hlY2tlZFwiKSk7XG4gICAgICB9LFxuXG4gICAgICAnbW91c2Vkb3duIC5zb3J0JzogZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciAkZWwgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9LFxuXG4gICAgICAnY2xpY2sgLnNvcnQnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgdmFyIGF0dHIgPSAkZWwuZGF0YSgnc29ydC1hdHRyJyk7XG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5zZXRTb3J0KHthdHRyOiBhdHRyfSlcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLnNvcnQoKVxuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGJpbmRUb1N0YXRlRXZlbnRzOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKHN0YXRlLCAnY2hhbmdlOmVkaXRNb2RlbCcpXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOmVkaXRNb2RlbCcsIF8uYmluZChmdW5jdGlvbihzdGF0ZSl7XG4gICAgICAgIGlmIChzdGF0ZS5nZXQoJ2VkaXRNb2RlbCcpID09IG51bGwpe1xuICAgICAgICAgIGlmIChzdGF0ZS5nZXRQcmV2aW91c0VkaXRNb2RlbCgpICYmIHN0YXRlLmdldFByZXZpb3VzRWRpdE1vZGVsKCkudXJsID09IHRoaXMuX2dldFR5cGUoKSl7XG4gICAgICAgICAgICB0aGlzLl9fZHJvcEFjdGl2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpXG4gICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoc3RhdGUsICdzeW5jOicgKyB0aGlzLl9nZXRUeXBlKCkpXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnc3luYzonICsgdGhpcy5fZ2V0VHlwZSgpLCBfLmJpbmQoZnVuY3Rpb24oc3RhdGUsIG1vZGVsKXtcbiAgICAgICAgdGhpcy5fX3NldEFjdGl2ZShtb2RlbCwge2NsaWNrOmZhbHNlfSlcbiAgICAgIH0sIHRoaXMpKVxuICAgIH0sXG5cbiAgICByZW5kZXJBc3luYzogZnVuY3Rpb24oKXtcbiAgICAgIGlmICghdGhpcy5jb2xsZWN0aW9uKSByZXR1cm47XG4gICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZVAuZG9uZShfLmJpbmQoZnVuY3Rpb24odGVtcGxhdGUpe1xuICAgICAgICB2YXIgZGlzcGxheSA9IHRoaXMuJGVsLmZpbmQoJy5hY2MtaXRlbS1kYXRhJykuY3NzKCdkaXNwbGF5Jyk7XG4gICAgICAgIHZhciBodG1sID0gdGVtcGxhdGUuZXhlY3V0ZSh0aGlzLl9kYXRhKCkpXG4gICAgICAgIHRoaXMuJGVsLmh0bWwoaHRtbCk7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy5hY2MtaXRlbS1kYXRhJykuY3NzKCdkaXNwbGF5JywgZGlzcGxheSk7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy5nbHlwaGljb24nKS5oaWRlKClcbiAgICAgICAgdGhpcy5fYWZ0ZXJSZW5kZXIoKTtcbiAgICAgICAgdGhpcy5iaW5kVG9TdGF0ZUV2ZW50cygpO1xuICAgICAgICB0aGlzLmRlbGVnYXRlRXZlbnRzKCk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIHNldENvbGxlY3Rpb246IGZ1bmN0aW9uKGNvbGxlY3Rpb24pe1xuICAgICAgaWYgKHRoaXMuY29sbGVjdGlvbil7XG4gICAgICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLmNvbGxlY3Rpb24pXG4gICAgICB9XG4gICAgICB0aGlzLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmNvbGxlY3Rpb24sICdhZGQgcmVtb3ZlIHJlc2V0IGNoYW5nZSBzeW5jIHNvcnQnLCB0aGlzLnJlbmRlckFzeW5jKTtcbiAgICAgIHRoaXMucmVuZGVyQXN5bmMoKTtcbiAgICB9LFxuXG4gICAgX2RhdGE6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdCA9IHRoaXMuY29sbGVjdGlvbi5tYXAoZnVuY3Rpb24oZWwpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IGVsLmdldCgnbmFtZScpLFxuICAgICAgICAgIGNpZDogZWwuY2lkLFxuICAgICAgICAgIGZyZXE6IGVsLmlzKCd0b3dlcicpID8gZWwuZ2V0KCdmcmVxJykgOiAnJyxcbiAgICAgICAgICBjb2xvcjogZWwuaXMoJ3Rvd2VyJykgPyBlbC5nZXRDb2xvcigpIDogJydcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdHlwZTogdGhpcy5fZ2V0VHlwZSgpLFxuICAgICAgICBsaXN0OiBsaXN0LFxuICAgICAgICBzb3J0OiB7XG4gICAgICAgICAgbmFtZTogdGhpcy5tYXBTb3J0T3B0cygnbmFtZScpLFxuICAgICAgICAgIGZyZXE6IHRoaXMubWFwU29ydE9wdHMoJ2ZyZXEnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1hcFNvcnRPcHRzOiBmdW5jdGlvbihhdHRyKXtcbiAgICAgIHZhciBvcHRzID0gdGhpcy5jb2xsZWN0aW9uLnNvcnRPcHRzXG5cbiAgICAgIGlmIChvcHRzLmF0dHIgPT0gYXR0cil7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZGlyOiBvcHRzLmRpciA9PSAnYXNjJyA/ICdkb3duJyA6ICd1cCcsXG4gICAgICAgICAgYWN0aXZlOiAnYWN0aXZlJ1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRpcjogJ2Rvd24nLFxuICAgICAgICAgIGFjdGl2ZTogJydcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvL3RvIHJlZGVmaW5lIGluIFBvaW50c1ZpZXdcbiAgICBfZWRpdE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG4gICAgICBzdGF0ZS5zZXQoJ2VkaXRNb2RlbCcsIG1vZGVsKTtcbiAgICB9LFxuXG4gICAgX19zZXRBY3RpdmU6IGZ1bmN0aW9uKGVsLCBvcHRzKXtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgICB0aGlzLl9fZHJvcEFjdGl2ZSgpO1xuICAgICAgaWYgKG9wdHMuYWRkKXtcbiAgICAgICAgb3B0cy4kZWwgPSB0aGlzLiRlbC5maW5kKCcuYWRkJylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCFvcHRzLiRlbCl7XG4gICAgICAgIG9wdHMuJGVsID0gdGhpcy4kZWwuZmluZCgnbGlbZGF0YS1jaWQ9XCInKyBlbC5jaWQgKydcIl0nKVxuICAgICAgfVxuICAgICAgb3B0cy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgaWYgKG9wdHMuY2xpY2spe1xuICAgICAgICBzdGF0ZS50cmlnZ2VyKCdjbGljazpvYmplY3QnLCBlbClcbiAgICAgICAgc3RhdGUuc2V0KHRoaXMuX2dldFR5cGUoKSwgZWwpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfX2Ryb3BBY3RpdmU6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRlbC5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICB9LFxuXG4gICAgX2NyZWF0ZU1vZGVsIDogZnVuY3Rpb24oKXtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5pbXBsZW1lbnRlZCcpXG4gICAgfSxcblxuICAgIF9yZW1vdmVNc2c6IGZ1bmN0aW9uKCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKVxuICAgIH0sXG5cbiAgICBfY2FuUmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIF9hZnRlclJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICB9LFxuXG4gICAgX2dldFR5cGU6IGZ1bmN0aW9uKCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUeXBlIG5vdCBkZWZpbmVkXCIpXG4gICAgfVxuXG5cbiAgfSlcblxuXG59KCkpO1xuIiwidmFyIFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL1ZpZXcnKTtcbnZhciBGaWVsZFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL0ZpZWxkVmlldycpO1xudmFyIEZyZXEgPSByZXF1aXJlKCdtb2RlbHMvRnJlcScpO1xudmFyIFRlbXBsYXRlcyA9IHJlcXVpcmUoJ21vZGVscy9UZW1wbGF0ZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gVmlldy5leHRlbmQoe1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLmFkZCc6ICdhZGRNb2RlbCcsXG4gICAgICAnY2xpY2sgLnJlbW92ZSc6ICdyZW1vdmVNb2RlbCcsXG4gICAgICAnY2xpY2sgLmVkaXQnOiAnZWRpdE1vZGVsJ1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICB0aGlzLmZpZWxkcyA9IHRoaXMuY29sbGVjdGlvbi5maWVsZHM7XG4gICAgICB0aGlzLmNvbGxlY3Rpb25zID0gdGhpcy5vcHRpb25zLmNvbGxlY3Rpb25zO1xuICAgICAgdGhpcy50YWJsZVRlbXBsYXRlID0gVGVtcGxhdGVzLmdldCgndGFibGUnKTtcbiAgICAgIHRoaXMudHJUZW1wbGF0ZSA9IFRlbXBsYXRlcy5nZXQoJ3RyJyk7XG4gICAgICBfLmJpbmRBbGwodGhpcywgWydpbnB1dEhhbmRsZXInLCAnY2xvc2VJbnB1dCddKTtcbiAgICAgIHRoaXMuYmluZEV2ZW50KCQoJ2JvZHknKSwgJ2NsaWNrJywgdGhpcy5jbG9zZUlucHV0KTtcbiAgICAgIHRoaXMuc2F2ZSA9IHRydWU7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucmVuZGVyQXN5bmMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCl7XG4gICAgICBWaWV3LnByb3RvdHlwZS5yZW1vdmUuY2FsbCh0aGlzKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyQXN5bmM6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgY29sbGVjdGlvblAgPSB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKTtcbiAgICAgIHJldHVybiAkLndoZW4odGhpcy50YWJsZVRlbXBsYXRlLCB0aGlzLnRyVGVtcGxhdGUsIGNvbGxlY3Rpb25QKS5kb25lKF8uYmluZChmdW5jdGlvbih0LCB0clRlbXBsYXRlKXtcbiAgICAgICAgdmFyIG1vZGVsID0ge1xuICAgICAgICAgIGZpZWxkczogdGhpcy5maWVsZHMsXG4gICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLm1vZGVscyxcbiAgICAgICAgICB0clRlbXBsYXRlOiB0clRlbXBsYXRlXG4gICAgICAgIH07XG4gICAgICAgIHZhciBodG1sID0gdC5leGVjdXRlKG1vZGVsKTtcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCB0aGlzKSlcbiAgICB9LFxuXG4gICAgYWRkTW9kZWw6IGZ1bmN0aW9uKGUpe1xuICAgICAgdGhpcy50clRlbXBsYXRlLmRvbmUoXy5iaW5kKGZ1bmN0aW9uKHQpe1xuICAgICAgICB2YXIgbW9kZWwgPSBuZXcgdGhpcy5jb2xsZWN0aW9uLm1vZGVsKCk7XG4gICAgICAgIHZhciB0ciA9IHQuZXhlY3V0ZSh7XG4gICAgICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgICAgIGZpZWxkczogdGhpcy5maWVsZHNcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmFkZChtb2RlbCk7XG4gICAgICAgIHRoaXMuJCgndGJvZHknKS5hcHBlbmQodHIpO1xuICAgICAgICBzZXRUaW1lb3V0KF8uYmluZChmdW5jdGlvbigpe1xuICAgICAgICAgIHRoaXMuJCgndGJvZHknKS5maW5kKCd0cjpsYXN0JykuZmluZCgndGQ6Zmlyc3QnKS5jbGljaygpO1xuICAgICAgICB9LCB0aGlzKSlcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlTW9kZWw6IGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIHRkID0gJChlLmN1cnJlbnRUYXJnZXQpLFxuICAgICAgICAgIG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwodGQpO1xuICAgICAgaWYgKG1vZGVsKXtcbiAgICAgICAgaWYgKGNvbmZpcm0oJ9CU0LXQudGB0YLQstC40YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC00LDQvdC90YvQtT8nKSl7XG4gICAgICAgICAgdGQucGFyZW50KCd0cicpLnJlbW92ZSgpO1xuICAgICAgICAgIG1vZGVsLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBlZGl0TW9kZWw6IGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIHRkID0gJChlLmN1cnJlbnRUYXJnZXQpLFxuICAgICAgICAgIGZpZWxkID0gdGQuZGF0YSgnZmllbGQnKSxcbiAgICAgICAgICBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKHRkKSxcbiAgICAgICAgICBmaWVsZENoYW5nZWQgPSBmaWVsZCAmJiB0aGlzLmZpZWxkICE9IGZpZWxkLFxuICAgICAgICAgIG1vZGVsQ2hhbmdlZCA9IG1vZGVsICYmIHRoaXMubW9kZWwgIT0gbW9kZWw7XG5cbiAgICAgIGlmIChmaWVsZENoYW5nZWQgfHwgbW9kZWxDaGFuZ2VkKXtcbiAgICAgICAgdGhpcy5jbG9zZUlucHV0KCk7XG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgICAgICAgdGhpcy5maWVsZCA9IGZpZWxkO1xuICAgICAgICB0aGlzLnRkID0gdGQ7XG4gICAgICAgIHZhciBpbnB1dCA9IHRoaXMuY3JlYXRlSW5wdXQoKTtcbiAgICAgICAgdGhpcy5iaW5kRXZlbnQoaW5wdXQsICdrZXlkb3duJywgdGhpcy5pbnB1dEhhbmRsZXIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgfSlcblxuICAgICAgfVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LFxuXG4gICAgc2F2ZU1vZGVsOiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5oYXNDaGFuZ2VkKCkpe1xuICAgICAgICB0aGlzLm1vZGVsLnNhdmUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2F2ZSA9IHRydWU7XG4gICAgfSxcblxuICAgIGNyZWF0ZUlucHV0OiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRkID0gdGhpcy50ZCxcbiAgICAgICAgICBmaWVsZCA9IHRoaXMuZmllbGQsXG4gICAgICAgICAgbW9kZWwgPSB0aGlzLm1vZGVsLFxuICAgICAgICAgIHZhbHVlID0gbW9kZWwuZ2V0KGZpZWxkKTtcblxuICAgICAgdmFyIGlucHV0ID0gbnVsbDtcbiAgICAgIHZhciBpbnB1dFR5cGUgPSB0aGlzLl9nZXRGaWVsZChmaWVsZCkuaW5wdXQ7XG4gICAgICBzd2l0Y2ggKGlucHV0VHlwZSkge1xuICAgICAgICBjYXNlICd0ZXh0YXJlYSc6e1xuICAgICAgICAgIGlucHV0PSAkKCc8dGV4dGFyZWE+Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzp7XG4gICAgICAgICAgaWYgKCF0aGlzLmNvbGxlY3Rpb25zIHx8ICF0aGlzLmNvbGxlY3Rpb25zW2ZpZWxkXSkgdGhyb3cgbmV3IEVycm9yKCdDb2xsZWN0aW9uIGZvciBmaWVsZCAnICsgZmllbGQgKyAnIG5vdCBkZWZpbmVkJylcbiAgICAgICAgICBpbnB1dCA9ICQoJzxzZWxlY3Q+JylcbiAgICAgICAgICBpbnB1dC5hdHRyKCdtdWx0aXBsZScsICdtdWx0aXBsZScpXG4gICAgICAgICAgdGhpcy5jb2xsZWN0aW9uc1tmaWVsZF0uZWFjaChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gJCgnPG9wdGlvbj4nKTtcbiAgICAgICAgICAgIG9wdC5hdHRyKCd2YWx1ZScsIGVsLmdldCgnbmFtZScpKVxuICAgICAgICAgICAgb3B0Lmh0bWwoZWwuZ2V0KCduYW1lJykpXG4gICAgICAgICAgICBpbnB1dC5hcHBlbmQob3B0KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlucHV0LnNlbGVjdDIoe1xuICAgICAgICAgICAgICBhbGxvd0NsZWFyOnRydWUsXG4gICAgICAgICAgICAgIHdpZHRoOiAnMjAwcHgnXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlucHV0ID0gJCgnPGlucHV0PicpO1xuICAgICAgfVxuICAgICAgdGQuaHRtbChpbnB1dCk7XG4gICAgICBpbnB1dC52YWwodmFsdWUpO1xuICAgICAgdGhpcy5maWVsZFZpZXcgPSBuZXcgRmllbGRWaWV3KHtcbiAgICAgICAgJGVsOiBpbnB1dCxcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBtb2RlbDogbW9kZWxcbiAgICAgIH0pXG4gICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfSxcblxuICAgIGNsb3NlSW5wdXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5zYXZlKXtcbiAgICAgICAgdGhpcy5zYXZlTW9kZWwoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xvc2VGaWVsZFZpZXcoKTtcbiAgICAgIHRoaXMubW9kZWwgPSBudWxsO1xuICAgICAgdGhpcy5maWVsZCA9IG51bGw7XG4gICAgICB0aGlzLnRkID0gbnVsbDtcbiAgICB9LFxuXG4gICAgY2xvc2VGaWVsZFZpZXc6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5maWVsZFZpZXcpe1xuICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmZpZWxkVmlldy5nZXRJbnB1dCgpO1xuICAgICAgICBpbnB1dC5wYXJlbnQoKS5odG1sKHRoaXMubW9kZWwuZ2V0Vih0aGlzLmZpZWxkKSk7XG4gICAgICAgIGlucHV0LnJlbW92ZSgpXG4gICAgICAgIHRoaXMuZmllbGRWaWV3LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmZpZWxkVmlldyA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRNb2RlbDogZnVuY3Rpb24odGQpe1xuICAgICAgdmFyIGNpZCA9IHRkLnBhcmVudCgndHInKS5kYXRhKCdtb2RlbC1jaWQnKTtcbiAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZ2V0KGNpZCk7XG4gICAgfSxcblxuICAgIGlucHV0SGFuZGxlcjogZnVuY3Rpb24oZSl7XG4gICAgICB2YXIga2V5ID0gZS53aGljaDtcbiAgICAgIHN3aXRjaCAoa2V5KXtcbiAgICAgICAgY2FzZSBFTlRFUjpcbiAgICAgICAge1xuICAgICAgICAgIHRoaXMuY2xvc2VJbnB1dCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgRVNDOlxuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5zYXZlID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5jbG9zZUlucHV0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBUQUI6XG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgbmV4dCA9IHRoaXMuX2dldE5leHRDZWxsKCk7XG4gICAgICAgICAgaWYgKG5leHQubGVuZ3RoKXtcbiAgICAgICAgICAgIG5leHQuY2xpY2soKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlSW5wdXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2dldE5leHRDZWxsOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy50ZC5pbmRleCgpLFxuICAgICAgICAgIG5leHRJbmRleCA9IGluZGV4ICsgMSxcbiAgICAgICAgICBlZGl0YWJsZUNlbGxzID0gdGhpcy50ZC5wYXJlbnQoKS5jaGlsZHJlbignLmVkaXQnKTtcbiAgICAgIGlmIChuZXh0SW5kZXggPCBlZGl0YWJsZUNlbGxzLmxlbmd0aCl7XG4gICAgICAgIHJldHVybiAkKGVkaXRhYmxlQ2VsbHMuZ2V0KG5leHRJbmRleCkpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdHJJbmRleCA9IHRoaXMudGQucGFyZW50KCd0cicpLmluZGV4KCksXG4gICAgICAgICAgICBuZXh0VHJJbmRleCA9IHRySW5kZXggKyAxO1xuICAgICAgICByZXR1cm4gdGhpcy50ZC5wYXJlbnRzKCd0Ym9keScpLmNoaWxkcmVuKCc6ZXEoJyArIG5leHRUckluZGV4ICsgJyknKS5maW5kKCcuZWRpdDpmaXJzdCcpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfZ2V0RmllbGQ6IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgcmV0dXJuIF8uZmluZCh0aGlzLmZpZWxkcywgZnVuY3Rpb24oZWwpe1xuICAgICAgICByZXR1cm4gZWwubmFtZSA9PSBuYW1lO1xuICAgICAgfSlcbiAgICB9XG5cbiAgfSk7XG5cbiAgdmFyIEVOVEVSID0gMTMsXG4gICAgICBFU0MgPSAyNyxcbiAgICAgIFRBQiA9IDk7XG5cbn0oKSk7XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblxuICAgIGZpZWxkczogW10sXG5cbiAgICBzaG93OiBmdW5jdGlvbigpe1xuICAgICAgaWYgKCF0aGlzLnJlbmRlcmVkKXtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLiRlbC5zaG93KCk7XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRlbC5oaWRlKCk7XG4gICAgfSxcblxuICAgIGJpbmRGaWVsZHM6IGZ1bmN0aW9uKGZpZWxkcyl7XG4gICAgICBfLmJpbmRBbGwodGhpcyk7XG4gICAgICBpZiAoIXRoaXMubW9kZWwpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJubyBtb2RlbCB0byBiaW5kIHRvIVwiKVxuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLm1vZGVsLmZpZWxkcyAmJiAhZmllbGRzKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gZmllbGRzIHRvIGJpbmQgdG8hXCIpXG4gICAgICB9XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLmZpZWxkcyA9IHt9O1xuICAgICAgXy5lYWNoKHRoaXMubW9kZWwuZmllbGRzIHx8IGZpZWxkcywgZnVuY3Rpb24oZmllbGQpe1xuXG4gICAgICAgIHZhciBmTmFtZSA9IF8uaXNTdHJpbmcoZmllbGQpID8gZmllbGQgOiBmaWVsZC5uYW1lO1xuICAgICAgICB2YXIgJGVsID0gc2VsZi4kKCcuJyAgKyBmTmFtZSlcbiAgICAgICAgaWYgKCEkZWwubGVuZ3RoKXtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJObyBpbnB1dCBmb3VuZCBmb3IgZmllbGQgYFwiICsgZk5hbWUgKyBcImBcIilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmZpZWxkc1tmTmFtZV0gPSBuZXcgRmllbGRWaWV3KHtcbiAgICAgICAgICAgICRlbDogJGVsLFxuICAgICAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgICAgbW9kZWw6IHNlbGYubW9kZWxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICB1bmJpbmRGaWVsZHM6IGZ1bmN0aW9uKCl7XG4gICAgICBfLmVhY2godGhpcy5maWVsZHMsIGZ1bmN0aW9uKGZpZWxkVmlldyl7XG4gICAgICAgIGZpZWxkVmlldy5yZW1vdmUoKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGJpbmRFdmVudDogZnVuY3Rpb24oJGVsLCBldmVudE5hbWUsIGZ1bmMpe1xuICAgICAgdGhpcy5pbnB1dEV2ZW50cyA9IHRoaXMuaW5wdXRFdmVudHMgfHwgW107XG4gICAgICB0aGlzLmlucHV0RXZlbnRzLnB1c2goe1xuICAgICAgICBpbnB1dDogJGVsLFxuICAgICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICAgIGZ1bmM6IGZ1bmNcbiAgICAgIH0pXG4gICAgICAkZWwub24oZXZlbnROYW1lLCBmdW5jKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy51bmJpbmRGaWVsZHMoKTtcbiAgICAgIF8uZWFjaCh0aGlzLmlucHV0RXZlbnRzLCBmdW5jdGlvbihlbCl7XG4gICAgICAgIGVsLmlucHV0Lm9mZihlbC5uYW1lLCBlbC5mdW5jKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy4kZWwuaHRtbChcIlwiKTtcbiAgICAgIHRoaXMuc3RvcExpc3RlbmluZygpO1xuICAgIH0sXG5cbiAgICBmb2N1czogZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgICAgdmFyICRlbCA9IHRoaXMuJChzZWxlY3RvcilcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsLmZvY3VzKCk7XG4gICAgICB9KVxuICAgIH1cblxuICB9KTtcblxufSgpKTtcbiIsInZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG52YXIgVGVtcGxhdGVzID0gcmVxdWlyZSgnbW9kZWxzL1RlbXBsYXRlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHZhciB0ID0gJzxsaSBjbGFzcz1cImZyZXEgbGlzdC1pdGVtXCI+PGlucHV0IGNsYXNzPVwiY29sb3JcIiB0eXBlPVwiY29sb3JcIiBkYXRhLWZyZXE9XCIke3ZhbHVlfVwiIHZhbHVlPVwiJHtjb2xvcn1cIj48L2Rpdj48bGFiZWw+JHt2YWx1ZX0gTWh6PC9sYWJlbD48L2xpPidcblxuICByZXR1cm4gVmlldy5leHRlbmQoe1xuXG4gICAgZXZlbnRzOntcbiAgICAgICdjbGljayAudG9nZ2xlJzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy4kKCcuZm9ybS1ib2R5JykudG9nZ2xlKCk7XG4gICAgICB9LFxuICAgICAgJ2NoYW5nZSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd0b2dnbGUtYWxsJykpe1xuICAgICAgICAgIHRoaXMudG9nZ2xlQWxsKCRlbC5pcyhcIjpjaGVja2VkXCIpKVxuXG4gICAgICAgIH0gZWxzZSBpZiAoJGVsLmRhdGEoJ3RvZ2dsZS1wb2ludHMnKSl7XG4gICAgICAgICAgc3RhdGUuc2V0KCdzaG93UG9pbnRzJywgJGVsLmlzKCc6Y2hlY2tlZCcpKVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGNpZCA9ICRlbC5kYXRhKCdmcmVxLWNpZCcpXG4gICAgICAgICAgdmFyIGZyZXEgPSBzdGF0ZS5nZXQoJ2ZyZXFzJykuZ2V0KGNpZClcbiAgICAgICAgICBmcmVxLnN3aXRjaFZpc2liaWxpdHkoKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2NoYW5nZSAuY29sb3InOiAnb25Db2xvckNoYW5nZSdcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgIF8uYmluZEFsbCh0aGlzKVxuICAgICAgdGhpcy5zaG93QWxsID0gZmFsc2U7XG4gICAgICB0aGlzLnRlbXBsYXRlUHJvbWlzZSA9IFRlbXBsYXRlcy5nZXQoJ2xlZ2VuZCcpXG4gICAgICB0aGlzLmZyZXFzID0gc3RhdGUuZ2V0KCdmcmVxcycpO1xuICAgICAgdGhpcy5mcmVxcy5lYWNoKGZ1bmN0aW9uKGZyZXEpe1xuICAgICAgICBmcmVxLnNldCh7c2hvdzogZmFsc2V9KVxuICAgICAgfSlcbiAgICAgIGlmICghdGhpcy5mcmVxcy5sZW5ndGgpe1xuICAgICAgICB0aGlzLiRlbC5oaWRlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZnJlcXMsICdhZGQgcmVzZXQgcmVtb3ZlJywgdGhpcy5yZW5kZXIpXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOmxvY2F0aW9uJywgdGhpcy5yZW5kZXIpXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOmxvY2F0aW9uJywgdGhpcy5saXN0ZW5Ub1Rvd2Vyc0FkZGl0aW9uKVxuICAgIH0sXG5cbiAgICBsaXN0ZW5Ub1Rvd2Vyc0FkZGl0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRvd2VycyA9IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXRUb3dlcnMoKTtcbiAgICAgIHRoaXMubGlzdGVuVG8odG93ZXJzLCAnYWRkJywgdGhpcy5yZW5kZXIpXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLmZyZXFzLmxlbmd0aCl7XG4gICAgICAgIHRoaXMuJGVsLnNob3coKTtcbiAgICAgIH1cbiAgICAgIHZhciBmcmVxcyA9IHRoaXMuZnJlcXMuZmlsdGVyKF8uYmluZChmdW5jdGlvbihmcmVxKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzKGZyZXEpXG4gICAgICB9LCB0aGlzKSk7XG4gICAgICB0aGlzLnRlbXBsYXRlUHJvbWlzZS5kb25lKF8uYmluZChmdW5jdGlvbih0KXtcbiAgICAgICAgdmFyIGh0bWwgPSB0LmV4ZWN1dGUoe1xuICAgICAgICAgIGZyZXFzOiBmcmVxcyxcbiAgICAgICAgICBzaG93QWxsOiB0aGlzLnNob3dBbGwsXG4gICAgICAgICAgc2hvd1BvaW50czogc3RhdGUuZ2V0KCdzaG93UG9pbnRzJylcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGVsLmh0bWwoaHRtbClcbiAgICAgIH0sIHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBoYXM6IGZ1bmN0aW9uKGZyZXEpe1xuICAgICAgdmFyIHRvd2VycyA9IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXRUb3dlcnMoKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3dlcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgdCA9IHRvd2Vycy5hdChpKTtcbiAgICAgICAgaWYgKHQuZ2V0KCdmcmVxJykgPT0gZnJlcS5nZXQoJ3ZhbHVlJykpe1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIG9uQ29sb3JDaGFuZ2U6IGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgIHZhciBmcmVxID0gJGVsLmRhdGEoJ2ZyZXEnKVxuICAgICAgdmFyIG1vZGVsID0gdGhpcy5mcmVxcy5maW5kV2hlcmUoe3ZhbHVlOmZyZXF9KVxuICAgICAgbW9kZWwuc2V0KCdjb2xvcicsICRlbC52YWwoKSlcbiAgICAgIG1vZGVsLnNhdmUoKVxuICAgICAgdGhpcy5mcmVxcy50cmlnZ2VyKCdjaGFuZ2UnLCBtb2RlbClcbiAgICB9LFxuXG4gICAgdG9nZ2xlQWxsOiBmdW5jdGlvbihzaG93KXtcbiAgICAgIHN0YXRlLnNldCgnc2hvd1BvaW50cycsIHNob3cpXG4gICAgICB0aGlzLnNob3dBbGwgPSBzaG93O1xuICAgICAgdGhpcy5mcmVxcy5lYWNoKGZ1bmN0aW9uKGZyZXEpe1xuICAgICAgICBmcmVxLnNldCh7c2hvdzpzaG93fSlcbiAgICAgIH0pO1xuICAgICAgdGhpcy4kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgc2hvdylcbiAgICB9XG5cbiAgfSk7XG5cblxufSgpKTtcbiIsInZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG52YXIgVGVtcGxhdGVzID0gcmVxdWlyZSgnbW9kZWxzL1RlbXBsYXRlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBWaWV3LmV4dGVuZCh7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAucmVtb3ZlJzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5tb2RlbC5yZXZlcnQoKTtcbiAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBudWxsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgQmFja2JvbmUudHJpZ2dlcigndXBkYXRlOmxvY2F0aW9uJywgdGhpcy5tb2RlbCk7XG4gICAgICBWaWV3LnByb3RvdHlwZS5yZW1vdmUuYXBwbHkodGhpcylcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICBfLmJpbmRBbGwodGhpcyk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5sb2NhdGlvbnMgPSBvcHRpb25zLmxvY2F0aW9ucztcbiAgICAgIHRoaXMudGVtcGxhdGUgPSBUZW1wbGF0ZXMuZ2V0KCdsb2NhdGlvbicpO1xuICAgIH0sXG5cbiAgICByZW5kZXJBc3luYzogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlLmRvbmUoXy5iaW5kKGZ1bmN0aW9uKHQpe1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLm1vZGVsLmdldE5hbWUoKVxuICAgICAgICB9O1xuICAgICAgICB2YXIgaHRtbCA9IHQuZXhlY3V0ZShkYXRhKTtcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpXG4gICAgICAgIHRoaXMuYmluZEZpZWxkcygpO1xuICAgICAgICB0aGlzLmZvY3VzKCcubmFtZScpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cblxuICB9KVxuXG5cbn0oKSk7XG4iLCJ2YXIgTGlzdFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL0xpc3RWaWV3Jyk7XG52YXIgTG9jYXRpb24gPSByZXF1aXJlKCdtb2RlbHMvTG9jYXRpb24nKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGJvdHRvbSA9ICc8ZGl2IHJvbGU9XCJmb3JtXCIgc3R5bGU9XCIgaGVpZ2h0OiAzMHB4OyBcIj5cXFxuICAgICAgICAgICAgICA8bGFiZWw+0J/QvtC60LDQt9Cw0YLRjCDQs9GA0LDQvdC40YbRizwvbGFiZWw+XFxcbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2hvdy1sb2NhdGlvbnNcIiBjaGVja2VkPVwiY2hlY2tlZFwiIHN0eWxlPVwiIG1hcmdpbjo5cHggMCAwIDVweDtcIi8+XFxcbiAgICAgICAgICAgPC9kaXY+JztcblxuICByZXR1cm4gTGlzdFZpZXcuZXh0ZW5kKHtcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgXy5iaW5kQWxsKHRoaXMpO1xuICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgdGhpcy50ZW1wbGF0ZVAgPSBUZW1wbGF0ZXMuZ2V0KCdsb2NhdGlvbnMnKTtcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIHJlbW92ZSByZXNldCBjaGFuZ2UnLCB0aGlzLnJlbmRlckFzeW5jKTtcbiAgICB9LFxuXG4gICAgX2FmdGVyUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGFjdGl2ZSA9IHN0YXRlLmdldCgnbG9jYXRpb24nKVxuICAgICAgaWYgKGFjdGl2ZSA9PSB0aGlzLmN1cnJlbnQpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnQgPSBhY3RpdmU7XG4gICAgICBpZiAoYWN0aXZlKXtcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnbGlbZGF0YS1jaWQ9XCInKyBhY3RpdmUuY2lkICsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcuc2hvdy1sb2NhdGlvbnMnKS5hdHRyKCdjaGVja2VkJywgc3RhdGUuZ2V0KCdzaG93TG9jYXRpb25zJykpXG4gICAgfSxcblxuICAgIF9nZXRUeXBlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuICdsb2NhdGlvbidcbiAgICB9LFxuXG4gICAgX2NyZWF0ZU1vZGVsIDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgTG9jYXRpb24oKTtcbiAgICB9LFxuXG4gICAgX3JlbW92ZU1zZzogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBcItCj0LTQsNC70LjRgtGMINC70L7QutCw0YbQuNGOP1wiXG4gICAgfSxcblxuICAgIF9jYW5SZW1vdmU6IGZ1bmN0aW9uKG1vZGVsKXtcbiAgICAgIHZhciBjYW5SZW1vdmUgPSAhbW9kZWwuZ2V0VG93ZXJzKCkgfHwgbW9kZWwuZ2V0VG93ZXJzKCkubGVuZ3RoID09IDA7XG4gICAgICBpZiAoIWNhblJlbW92ZSkgYWxlcnQoJ9Cn0YLQvtCx0Ysg0YPQtNCw0LvQuNGC0Ywg0LvQvtC60LDRhtC40Y4sINGB0L/QtdGA0LLQsCDQvdGD0LbQvdC+INGD0LTQsNC70LjRgtGMINCy0YHQtSDQstGL0YjQutC4LicpXG4gICAgICByZXR1cm4gY2FuUmVtb3ZlO1xuICAgIH1cblxuICB9KVxuXG5cbn0oKSk7XG4iLCJ2YXIgTGlzdFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL0xpc3RWaWV3Jyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCdtb2RlbHMvUG9pbnQnKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIExpc3RWaWV3LmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgIF8uYmluZEFsbCh0aGlzKVxuICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgdGhpcy50ZW1wbGF0ZVAgPSBUZW1wbGF0ZXMuZ2V0KCdsaXN0Jyk7XG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOnRvd2VyJywgZnVuY3Rpb24oc3RhdGUsIHRvd2VyKXtcbiAgICAgICAgdGhpcy50b3dlciA9IHRvd2VyO1xuICAgICAgICBpZiAodG93ZXIuX2lzTmV3KCkpe1xuICAgICAgICAgIHRoaXMuJGVsLmhpZGUoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0Q29sbGVjdGlvbihzdGF0ZS5nZXQoJ3BvaW50cycpKVxuICAgICAgICAgIHRoaXMuJGVsLnNob3coKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdjaGFuZ2U6bG9jYXRpb24nLCBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLiRlbC5oaWRlKClcbiAgICAgIH0sIHRoaXMpXG4gICAgfSxcblxuICAgIF9kYXRhOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRvd2VySWQgPSB0aGlzLnRvd2VyLmdldCgnaWQnKTtcbiAgICAgIHZhciBmaWx0ZXJlZCA9IHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24oZWwpe1xuICAgICAgICByZXR1cm4gdG93ZXJJZCA9PSBlbC5nZXQoJ3Rvd2VySWQnKVxuICAgICAgfSk7XG4gICAgICB2YXIgbGlzdCA9IF8oZmlsdGVyZWQpLm1hcChmdW5jdGlvbihlbCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogZWwuZ2V0KCduYW1lJyksXG4gICAgICAgICAgY2lkOiBlbC5jaWRcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOnRoaXMubmFtZSxcbiAgICAgICAgbGlzdDogbGlzdC5fX3dyYXBwZWRfXyxcbiAgICAgICAgc29ydDogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2FmdGVyUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy4kKCcubGlzdC1tb3JlJylcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgICAgICAgLmh0bWwoJzxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+PGxhYmVsIHRpdGxlPVwi0J3QsNC30LLQsNC90LjQtSDRgdC70LXQtNGD0YnQtdC5INGC0L7Rh9C60LhcIj7QndCw0LfQstCw0L3QuNC1PC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInBvaW50LW5hbWVcIi8+PC9kaXY+JylcbiAgICAgIHZhciAkcG9pbnROYW1lID0gdGhpcy4kKCcucG9pbnQtbmFtZScpO1xuICAgICAgJHBvaW50TmFtZVxuICAgICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgUG9pbnQuc2V0TmFtZSgkKHRoaXMpLnZhbCgpKVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICBfZWRpdE1vZGVsOiBmdW5jdGlvbihtb2RlbCwgJGVsKXtcbiAgICAgIHZhciBsaSA9ICRlbC5wYXJlbnQoKTtcblxuICAgICAgdmFyICRpbnB1dCA9ICQoJzxpbnB1dCBjbGFzcz1cImVkaXQtcG9pbnQtbmFtZVwiIHR5cGU9XCJ0ZXh0XCIvPicpXG4gICAgICAkaW5wdXQudmFsKG1vZGVsLmdldCgnbmFtZScpKVxuICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgIHZhciAkb2sgPSAkKCc8c3BhbiBjbGFzcz1cIm9rIGdseXBoaWNvbiBnbHlwaGljb24tb2tcIiB0aXRsZT1cItCT0L7RgtC+0LLQvlwiPicpLmhpZGUoKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBtb2RlbC5zZXQoe1xuICAgICAgICAgICAgbmFtZTogJGlucHV0LnZhbCgpLFxuICAgICAgICAgICAgdG93ZXJJZDogJHNlbGVjdC52YWwoKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgbW9kZWwuc2F2ZSgpXG4gICAgICAgICAgc3RhdGUudHJpZ2dlcigncmVkcmF3OnBvaW50JywgbW9kZWwpXG4gICAgICAgICAgc2VsZi5fZmluaXNoRWRpdGluZyhtb2RlbCwgbGkpXG4gICAgICAgIH0pO1xuXG4gICAgICB2YXIgJGNhbmNlbCA9ICQoJzxzcGFuIGNsYXNzPVwiY2FuY2VsIGdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlXCIgdGl0bGU9XCLQntGC0LzQtdC90LBcIj4nKS5oaWRlKClcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgc2VsZi5fZmluaXNoRWRpdGluZyhtb2RlbCwgbGkpXG4gICAgICAgIH0pO1xuICAgICAgdmFyICRzZWxlY3QgPSAkKCc8c2VsZWN0IGlkPVwidG93ZXJTZWxlY3RcIiBjbGFzcz1cIlwiPjwvc2VsZWN0PicpXG4gICAgICBzdGF0ZS5nZXQoJ2xvY2F0aW9uJykuZ2V0VG93ZXJzKCkuZWFjaChmdW5jdGlvbih0KXtcbiAgICAgICAgJHNlbGVjdC5hcHBlbmQoJCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB0LmdldCgnaWQnKSArICdcIj4nICsgdC5nZXQoJ25hbWUnKSArICc8L29wdGlvbj4nKSlcbiAgICAgIH0pXG4gICAgICAkc2VsZWN0LnZhbChtb2RlbC5nZXQoJ3Rvd2VySWQnKSlcbiAgICAgIGxpLmNoaWxkcmVuKCkucmVtb3ZlKClcbiAgICAgIHZhciBkaXYgPSAkKCc8ZGl2IGNsYXNzPVwid3JhcHBlclwiPicpXG4gICAgICBkaXYuYXBwZW5kKCRpbnB1dClcbiAgICAgIGRpdi5hcHBlbmQoJGNhbmNlbClcbiAgICAgIGRpdi5hcHBlbmQoJG9rKVxuICAgICAgbGkuYXBwZW5kKGRpdilcbiAgICAgIGxpLmFwcGVuZCgkc2VsZWN0KVxuICAgICAgJHNlbGVjdC5zZWxlY3QyKClcbiAgICB9LFxuXG4gICAgX2ZpbmlzaEVkaXRpbmc6IGZ1bmN0aW9uKG1vZGVsLCBsaSl7XG4gICAgICBtb2RlbC5jb2xsZWN0aW9uLnNvcnQoKVxuICAgICAgbGkucmVtb3ZlQ2xhc3MoJ3dyYXBwZXInKVxuICAgIH0sXG5cbiAgICBfZ2V0VHlwZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAncG9pbnQnXG4gICAgfSxcblxuICAgIF9jcmVhdGVNb2RlbCA6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdG93ZXIgPSBzdGF0ZS5nZXQoJ3Rvd2VyJyk7XG4gICAgICBpZiAoIXRvd2VyKXtcbiAgICAgICAgYWxlcnQoXCLQndC1INCy0YvQsdGA0LDQvdCwINCy0YvRiNC60LBcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdG93ZXIuaWQpe1xuICAgICAgICBhbGVydChcItCS0YvRiNC60LAg0L3QtSDRgdC+0YXRgNCw0L3QtdC90LAuINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC10YnQtSDRgNCw0LcuXCIpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUG9pbnQoe1xuICAgICAgICB0b3dlcklkOiB0b3dlci5nZXQoJ2lkJyksXG4gICAgICAgIGxvY2F0aW9uSWQ6IHN0YXRlLmdldCgnbG9jYXRpb24nKS5pZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9yZW1vdmVNc2c6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gXCLQo9C00LDQu9C40YLRjCDRgtC+0YfQutGDP1wiXG4gICAgfVxuXG5cbiAgfSlcblxuXG59KCkpO1xuIiwidmFyIEZyZXEgPSByZXF1aXJlKCdtb2RlbHMvRnJlcScpO1xudmFyIFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL1ZpZXcnKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG52YXIgVG93ZXIgPSByZXF1aXJlKCdtb2RlbHMvVG93ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gVmlldy5leHRlbmQoe1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLmJpbmQtY29sb3InOiAnYmluZENvbG9yJyxcbiAgICAgICdjbGljayAucmVtb3ZlJzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5tb2RlbC5yZXZlcnQoKTtcbiAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBudWxsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICBfLmJpbmRBbGwodGhpcyk7XG4gICAgICB0aGlzLmZyZXEgPSBudWxsO1xuICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbnMubW9kZWw7XG4gICAgICB0aGlzLnRlbXBsYXRlID0gVGVtcGxhdGVzLmdldCgndG93ZXInKTtcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTp0eXBlJywgdGhpcy5yZW5kZXJBc3luYylcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2JlZm9yZVNhdmUnLCB0aGlzLmJpbmRDb2xvcilcbiAgICB9LFxuXG4gICAgcmVuZGVyQXN5bmM6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZS5kb25lKF8uYmluZChmdW5jdGlvbih0KXtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgYW5nbGVzOiBUb3dlci5hbmdsZXNbdGhpcy5tb2RlbC5nZXQoJ3R5cGUnKV0sXG4gICAgICAgICAgbmFtZTogdGhpcy5tb2RlbC5nZXROYW1lKClcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGh0bWwgPSB0LmV4ZWN1dGUoZGF0YSlcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpXG4gICAgICAgIHRoaXMuYmluZEZpZWxkcygpO1xuICAgICAgICB0aGlzLmluaXRGcmVxQ29sb3IoKTtcbiAgICAgICAgdGhpcy5hZnRlclJlbmRlcigpO1xuICAgICAgICB0aGlzLmZvY3VzKCcubmFtZScpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLmJpbmRDb2xvcigpO1xuICAgICAgVmlldy5wcm90b3R5cGUucmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHR5cGVTZWxlY3QgPSB0aGlzLiQoJy50eXBlJyk7XG4gICAgICBpZiAoIXRoaXMubW9kZWwuICBpc05ldygpKXtcbiAgICAgICAgdHlwZVNlbGVjdC5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGluaXRGcmVxQ29sb3I6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6Y29sb3InLCBmdW5jdGlvbihtb2RlbCwgY29sb3Ipe1xuICAgICAgICBpZiAoIW1vZGVsLmdldCgnZnJlcScpKSByZXR1cm47XG4gICAgICAgIHNlbGYuJCgnLmJpbmQtY29sb3InKS5zaG93KCk7XG4gICAgICB9KVxuICAgICAgdmFyICRjb2xvciA9IHRoaXMuJCgnLmNvbG9yJyk7XG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6ZnJlcScsIGZ1bmN0aW9uKG1vZGVsLCBmcmVxKXtcbiAgICAgICAgaWYgKCFmcmVxKXtcbiAgICAgICAgICBzZWxmLiQoJy5iaW5kLWNvbG9yJykuaGlkZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5mcmVxKXtcbiAgICAgICAgICBzZWxmLnN0b3BMaXN0ZW5pbmcoc2VsZi5mcmVxKVxuICAgICAgICB9XG4gICAgICAgIHZhciBmb3VuZCA9IHN0YXRlLmdldCgnZnJlcXMnKS5maW5kV2hlcmUoe3ZhbHVlOiBwYXJzZUZsb2F0KGZyZXEpfSk7XG4gICAgICAgIGlmIChmb3VuZCl7XG4gICAgICAgICAgc2VsZi5mcmVxID0gZm91bmQ7XG4gICAgICAgICAgc2VsZi5saXN0ZW5UbyhzZWxmLmZyZXEsICdjaGFuZ2U6Y29sb3InLCBmdW5jdGlvbihtLCBjb2xvcil7XG4gICAgICAgICAgICAkY29sb3IudmFsKGNvbG9yKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNlbGYubW9kZWwuc2V0KCdjb2xvcicsIGZvdW5kLmdldCgnY29sb3InKSlcbiAgICAgICAgICBzZWxmLiQoJy5jb2xvcicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcbiAgICAgICAgICBzZWxmLiQoJy5iaW5kLWNvbG9yJykuaGlkZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuJCgnLmNvbG9yJykucmVtb3ZlQXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKVxuICAgICAgICAgIHNlbGYuJCgnLmJpbmQtY29sb3InKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGJpbmRDb2xvcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLiQoJy5iaW5kLWNvbG9yJykuaXMoJzpoaWRkZW4nKSkgcmV0dXJuO1xuICAgICAgaWYgKHRoaXMuZnJlcSl7XG4gICAgICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLmZyZXEpXG4gICAgICB9XG4gICAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KHRoaXMubW9kZWwuZ2V0KCdmcmVxJykpXG4gICAgICBpZiAoIXZhbHVlIHx8IHN0YXRlLmdldCgnZnJlcXMnKS5maW5kV2hlcmUoe3ZhbHVlOiB2YWx1ZX0pKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyICRjb2xvciA9IHRoaXMuJCgnLmNvbG9yJyk7XG4gICAgICB2YXIgZnJlcSA9IG5ldyBGcmVxKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBjb2xvcjogJGNvbG9yLnZhbCgpXG4gICAgICB9KVxuICAgICAgdGhpcy5mcmVxID0gZnJlcTtcbiAgICAgIHRoaXMubGlzdGVuVG8oZnJlcSwgJ2NoYW5nZTpjb2xvcicsIGZ1bmN0aW9uKG0sIGNvbG9yKXtcbiAgICAgICAgJGNvbG9yLnZhbChjb2xvcilcbiAgICAgIH0pO1xuICAgICAgc3RhdGUuZ2V0KCdmcmVxcycpLmFkZChmcmVxKTtcbiAgICAgIGZyZXEuc2F2ZSgpO1xuXG4gICAgICB0aGlzLiQoJy5iaW5kLWNvbG9yJykuaGlkZSgpO1xuICAgICAgJGNvbG9yLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcblxuICAgICAgY29uc29sZS5sb2coJ2JpbmQgY29sb3IgdG8gZnJlcSAnICsgZnJlcS5nZXQoJ3ZhbHVlJykpO1xuICAgIH0sXG5cblxuICAgIGdldEFuZ2xlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuZmllbGRzLmFuZ2xlLmdldFZhbHVlKCk7XG4gICAgfSxcblxuICAgIHNldFZhbHVlOiBmdW5jdGlvbigkZWwsIGZpZWxkTmFtZSl7XG4gICAgICBpZiAoZmllbGROYW1lICE9ICdhbmdsZScpe1xuICAgICAgICB0aGlzW2ZpZWxkTmFtZV0uc2V0VmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gJ1Rvd2VyVmlldydcbiAgICB9XG5cbiAgfSlcblxuXG59KCkpO1xuIiwidmFyIExpc3RWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9MaXN0VmlldycpO1xudmFyIFRlbXBsYXRlcyA9IHJlcXVpcmUoJ21vZGVscy9UZW1wbGF0ZXMnKTtcbnZhciBUb3dlciA9IHJlcXVpcmUoJ21vZGVscy9Ub3dlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBMaXN0Vmlldy5leHRlbmQoe1xuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICBfLmJpbmRBbGwodGhpcylcbiAgICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIHRoaXMudGVtcGxhdGVQID0gVGVtcGxhdGVzLmdldCgnbGlzdCcpO1xuICAgICAgc3RhdGUub24oJ2NoYW5nZTpsb2NhdGlvbicsIF8uYmluZChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdG93ZXJzID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpLmdldFRvd2VycygpO1xuICAgICAgICB0aGlzLnNldENvbGxlY3Rpb24odG93ZXJzKVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICBfZ2V0VHlwZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAndG93ZXInXG4gICAgfSxcblxuICAgIF9jcmVhdGVNb2RlbCA6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXN0YXRlLmdldCgnbG9jYXRpb24nKSl7XG4gICAgICAgIGFsZXJ0KFwi0J3QtSDQstGL0LHRgNCw0L3QsCDQu9C+0LrQsNGG0LjRj1wiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCFzdGF0ZS5nZXQoJ2xvY2F0aW9uJykuaWQpe1xuICAgICAgICBhbGVydCgn0JvQvtC60LDRhtC40Y8g0LXRidC1INC90LUg0YHQvtGF0YDQsNC90LXQvdCwLiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3JylcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUb3dlcih7XG4gICAgICAgIHR5cGU6J3Rvd2VyJywgLy8g0L/Qvi3Rg9C80L7Qu9GH0LDQvdC40Y4g0LLRi9GI0LrQsCAtINCx0YvQstCw0LXRgiDQtdGJ0LUg0YLQvtGH0LrQsC3RgtC+0YfQutCwXG4gICAgICAgIGxvY2F0aW9uSWQ6IHN0YXRlLmdldCgnbG9jYXRpb24nKS5pZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9yZW1vdmVNc2c6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gXCLQo9C00LDQu9C40YLRjCDQstGL0YjQutGDP1wiXG4gICAgfVxuXG5cbiAgfSlcblxuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgZ2VvID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4geW1hcHMuY29vcmRTeXN0ZW0uZ2VvO1xuICB9XG5cbiAgcmV0dXJuIHtcblxuICAgIGdldEF6aW11dGg6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuICAgICAgcmV0dXJuIHRoaXMuYXppbXV0aEZyb21EZWx0YShnZW8oKS5zb2x2ZUludmVyc2VQcm9ibGVtKHN0YXJ0LCBlbmQpLnN0YXJ0RGlyZWN0aW9uKTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuICAgICAgcmV0dXJuIGdlbygpLmdldERpc3RhbmNlKHN0YXJ0LCBlbmQpXG4gICAgfSxcblxuICAgIGVuZFBvaW50OmZ1bmN0aW9uKHN0YXJ0LCBhemltdXRoLCBkaXN0YW5jZSl7XG4gICAgICByZXR1cm4gZ2VvKCkuc29sdmVEaXJlY3RQcm9ibGVtKHN0YXJ0LCB0aGlzLmRlbHRhRnJvbUF6aW11dGgoYXppbXV0aCksIGRpc3RhbmNlKS5lbmRQb2ludDtcbiAgICB9LFxuXG4gICAgYXppbXV0aEZyb21EZWx0YTogZnVuY3Rpb24oZGVsdGEpe1xuICAgICAgcmV0dXJuIE1hdGguYXRhbjIoZGVsdGFbMF0sIGRlbHRhWzFdKVxuICAgIH0sXG5cbiAgICBkZWx0YUZyb21BemltdXRoOiBmdW5jdGlvbihhemltdXRoKXtcbiAgICAgIHdpdGggKE1hdGgpe1xuICAgICAgICB2YXIgZGVsdGEgPSBbc2luKGF6aW11dGgpLCBjb3MoYXppbXV0aCldXG4gICAgICB9XG4gICAgICByZXR1cm4gZGVsdGE7XG4gICAgfVxuXG4gIH1cblxufSgpKTtcbiIsInZhciBHZW8gPSByZXF1aXJlKCd2aWV3cy9tYXAvR2VvJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIFNlY3RvciA9IGZ1bmN0aW9uKGNlbnRlciwgdG93ZXJBdHRycywgbWFwLCBvcHRzKXtcbiAgICB0aGlzLnJhdyA9IG9wdHMgJiYgb3B0cy5yYXc7XG4gICAgdGhpcy5jZW50ZXIgPSBjZW50ZXI7XG4gICAgdGhpcy5zZWN0b3IgPSB0aGlzLmF0dHJzID0gdG93ZXJBdHRycztcbiAgICB2YXIgYW5nbGUgPSBwYXJzZUFuZ2xlKHRoaXMuc2VjdG9yLmFuZ2xlKTtcbiAgICB0aGlzLmFuZ2xlID0gYW5nbGUucmFkO1xuICAgIHRoaXMuYW5nbGVTdGVwcyA9IGdldFN0ZXBzKHRoaXMuc2VjdG9yLnR5cGUsIGFuZ2xlLmRlZywgdGhpcy5yYXcpO1xuICAgIHRoaXMuZ3JhZGllbnRTdGVwcyA9IHRoaXMuc2VjdG9yLnR5cGUgPT0gJ2hpZ2h3YXknID8gMSA6IDE1O1xuICAgIHRoaXMubWFwID0gbWFwO1xuICAgIHRoaXMuZ2VvT2JqZWN0cyA9IG1hcC5nZW9PYmplY3RzO1xuICAgIHRoaXMudGV4dCA9IHRoaXMuc2VjdG9yLm5hbWUgKyAnPGJyPicgKyAodGhpcy5zZWN0b3IuY29tbWVudCA/IFwiIFwiICsgdGhpcy5zZWN0b3IuY29tbWVudCA6ICcnKTtcbiAgICB0aGlzLnBhcnRzID0gbmV3IHltYXBzLkdlb09iamVjdENvbGxlY3Rpb24oe30sIHtcbiAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICBpbnRlcmFjdGl2aXR5TW9kZWw6ICdkZWZhdWx0I3RyYW5zcGFyZW50J1xuICAgIH0pO1xuICAgIHRoaXMucGFydHMuZXZlbnRzLmFkZChbJ2NsaWNrJ10sIGZ1bmN0aW9uKGUpe1xuICAgICAgICB0aGlzLm9wZW5CYWxsb29uKCk7XG4gICAgfSwgdGhpcylcbiAgICB0aGlzLmJhc2UgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGdldFN0ZXBzKHR5cGUsIGFuZ2xlLCByYXcpe1xuICAgICAgaWYgKHR5cGUgPT0gJ2hpZ2h3YXknKXtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmF3ID8gMSA6IGFuZ2xlIC8gMzBcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkLmV4dGVuZChTZWN0b3IucHJvdG90eXBlLCB7XG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoTWF0aC5QSSAtIHRoaXMuYW5nbGUgPCAwLjAxKXtcbiAgICAgICAgdGhpcy5yZW5kZXJDaXJjbGVUb3dlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW5kZXJTZWN0b3IoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5yYXcpe1xuICAgICAgICB0aGlzLnJlbmRlckJhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBvcGVuQmFsbG9vbjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLmJhc2UpIHRoaXMuYmFzZS5iYWxsb29uLm9wZW4oKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyQ2lyY2xlVG93ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGVuZ3RoU3RlcCA9IHRoaXMuZ2V0TGVuZ3RoU3RlcHMoKTtcbiAgICAgIHZhciBvcGFjaXR5ID0gNTtcbiAgICAgIHZhciB5Q29sb3IgPSB0aGlzLnNlY3Rvci5jb2xvciArIGRpZ2l0VG9MZXR0ZXIob3BhY2l0eSkgKyAnMCc7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IHRoaXMuZ3JhZGllbnRTdGVwczsgaSsrKXtcbiAgICAgICAgdmFyIHJhZGl1cyA9IGxlbmd0aFN0ZXAgKiBpO1xuICAgICAgICB2YXIgY2lyY2xlID0gbmV3IHltYXBzLkNpcmNsZShcbiAgICAgICAgICAgIFt0aGlzLmNlbnRlciwgcmFkaXVzXSxcbiAgICAgICAgICAgIHt9LCB7XG4gICAgICAgICAgICAgIGludGVyYWN0aXZpdHlNb2RlbDogJ2RlZmF1bHQjdHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6IHlDb2xvcixcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IHlDb2xvcixcbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgICAgICAgIG9wYWNpdHk6IDAuOFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFydHMuYWRkKGNpcmNsZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmdlb09iamVjdHMuYWRkKHRoaXMucGFydHMpO1xuICAgIH0sXG5cbiAgICByZW5kZXJTZWN0b3I6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcHJldmlvdXMgPSBudWxsLC8vdHJpYW5nbGVcbiAgICAgICAgICBzZWN0b3IgPSB0aGlzLnNlY3RvcixcbiAgICAgICAgICBhemltdXRoID0gc2VjdG9yLmF6aW11dGgsXG4gICAgICAgICAgc3RhcnRBemltdXRoID0gYXppbXV0aCAtIHRoaXMuYW5nbGUsXG4gICAgICAgICAgYW5nbGVTdGVwID0gdGhpcy5hbmdsZSAvIHRoaXMuYW5nbGVTdGVwcyxcbiAgICAgICAgICBsZW5ndGhTdGVwID0gdGhpcy5nZXRMZW5ndGhTdGVwcygpLFxuXG4gICAgICAgICAgcGFydCA9IG51bGwsXG4gICAgICAgICAgYSwgYiwgYywgZDtcblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmFuZ2xlU3RlcHMgKiAyOyBqKyspe1xuXG4gICAgICAgIHByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgYXppbXV0aCA9IHN0YXJ0QXppbXV0aCArIGogKiBhbmdsZVN0ZXA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gdGhpcy5ncmFkaWVudFN0ZXBzOyBpKyspe1xuICAgICAgICAgIGlmICghcHJldmlvdXMpe1xuICAgICAgICAgICAgYSA9IHRoaXMuY2VudGVyO1xuICAgICAgICAgICAgYiA9IEdlby5lbmRQb2ludChhLCBhemltdXRoLCBsZW5ndGhTdGVwKTtcbiAgICAgICAgICAgIGMgPSBHZW8uZW5kUG9pbnQoYSwgYXppbXV0aCArIGFuZ2xlU3RlcCwgbGVuZ3RoU3RlcCk7XG4gICAgICAgICAgICBwYXJ0ID0gdGhpcy5jcmVhdGVQb2x5Z29uKFthLCBiLCBjXSwgaSlcbiAgICAgICAgICAgIHRoaXMuZmlyc3QgPSBwYXJ0O1xuICAgICAgICAgICAgcHJldmlvdXMgPSBbYiwgY11cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhID0gcHJldmlvdXNbMF07XG4gICAgICAgICAgICBiID0gcHJldmlvdXNbMV07XG4gICAgICAgICAgICBjID0gR2VvLmVuZFBvaW50KGEsIGF6aW11dGgsIGxlbmd0aFN0ZXApO1xuICAgICAgICAgICAgZCA9IEdlby5lbmRQb2ludChiLCBhemltdXRoICsgYW5nbGVTdGVwLCBsZW5ndGhTdGVwKTtcbiAgICAgICAgICAgIHBhcnQgPSB0aGlzLmNyZWF0ZVBvbHlnb24oW2EsIGMsIGQsIGJdLCBpKVxuICAgICAgICAgICAgcHJldmlvdXMgPSBbYywgZF1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJ0cy5hZGQocGFydCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZ2VvT2JqZWN0cy5hZGQodGhpcy5wYXJ0cyk7XG4gICAgfSxcblxuICAgIGdldExlbmd0aFN0ZXBzOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc2VjdG9yLnJhZGl1cyAvIHRoaXMuZ3JhZGllbnRTdGVwcztcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5wYXJ0cy5yZW1vdmVBbGwoKTtcbiAgICAgIGlmICh0aGlzLmJhc2Upe1xuICAgICAgICB0aGlzLmdlb09iamVjdHMucmVtb3ZlKHRoaXMuYmFzZSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlUG9seWdvbjogZnVuY3Rpb24ocG9pbnRzLHN0ZXApe1xuICAgICAgaWYgKHRoaXMuc2VjdG9yLmNvbG9yKXtcbiAgICAgICAgb3BhY2l0eSA9IDE2IC0gc3RlcCAqIDE1IC8gdGhpcy5ncmFkaWVudFN0ZXBzO1xuICAgICAgICB5Q29sb3IgPSB0aGlzLnNlY3Rvci5jb2xvciArIGRpZ2l0VG9MZXR0ZXIob3BhY2l0eSkgKyAnMCc7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2xvciA9ICcyNTUsMCwwLCdcbiAgICAgICAgdmFyIG9wYWNpdHkgPSAxLjIgLSBzdGVwIC8gdGhpcy5ncmFkaWVudFN0ZXBzO1xuICAgICAgICB2YXIgeUNvbG9yID0gJ3JnYignICArIGNvbG9yICsgb3BhY2l0eSArICcpJ1xuICAgICAgfVxuICAgICAgdmFyIHBvbHkgPSBuZXcgeW1hcHMuUG9seWdvbihbXG4gICAgICAgIHBvaW50cyxcbiAgICAgICAgW11cbiAgICAgIF0se30sIHtcbiAgICAgICAgaW50ZXJhY3Rpdml0eU1vZGVsOiAnZGVmYXVsdCN0cmFuc3BhcmVudCcsXG4gICAgICAgIGZpbGxDb2xvcjogeUNvbG9yLFxuICAgICAgICBzdHJva2VDb2xvcjogeUNvbG9yLFxuICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgb3BhY2l0eTogMC44XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHBvbHk7XG4gICAgfSxcblxuICAgIHJlbmRlckJhc2U6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgY2lyY2xlID0gbmV3IHltYXBzLkNpcmNsZShbdGhpcy5jZW50ZXIsIDFdLCB7XG4gICAgICAgIGJhbGxvb25Db250ZW50Qm9keTp0aGlzLnRleHRcbiAgICAgIH0sIHtcbiAgICAgICAgZmlsbDpmYWxzZSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6MFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNldEJhc2UoY2lyY2xlKTtcbiAgICB9LFxuXG4gICAgc2V0QmFzZTogZnVuY3Rpb24oY2lyY2xlKXtcbiAgICAgIHRoaXMuYmFzZSA9IGNpcmNsZTtcbiAgICAgIHRoaXMuZ2VvT2JqZWN0cy5hZGQoY2lyY2xlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGRpZ2l0VG9MZXR0ZXIoZCl7XG4gICAgaWYgKGQgPiAxNSB8fCBkIDwgMCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgY29udmVydCB0byBoZXg6ICcgKyBkKVxuICAgIH1cbiAgICBzd2l0Y2ggKGQpe1xuICAgICAgY2FzZSAxMDogcmV0dXJuICdBJ1xuICAgICAgY2FzZSAxMTogcmV0dXJuICdCJ1xuICAgICAgY2FzZSAxMjogcmV0dXJuICdDJ1xuICAgICAgY2FzZSAxMzogcmV0dXJuICdEJ1xuICAgICAgY2FzZSAxNDogcmV0dXJuICdFJ1xuICAgICAgY2FzZSAxNTogcmV0dXJuICdGJ1xuICAgICAgZGVmYXVsdDogcmV0dXJuIGQ7XG4gICAgfVxuICB9XG5cblxuICBmdW5jdGlvbiBwYXJzZUFuZ2xlKHN0cil7XG4gICAgdmFyIGFuZ2xlUGF0dGVybiA9IC8oXFxkKykoW15cXGRdKikvO1xuICAgIGlmICghc3RyIHx8ICFfLmlzU3RyaW5nKHN0cikpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFuZ2xlJylcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydCh2YWx1ZSwgdW5pdCl7XG4gICAgICBzd2l0Y2ggKHVuaXQpe1xuICAgICAgICBjYXNlIFwiwrBcIjpcbiAgICAgICAgICByZXR1cm4gdmFsdWUgKiBNYXRoLlBJIC8gMzYwXG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgcmV0dXJuIGxpbWl0KHZhbHVlICogTWF0aC5QSSAvIDM2MCAvIDYwKVxuICAgICAgICBjYXNlICcnOlxuICAgICAgICAgIHJldHVybiBsaW1pdCh2YWx1ZSAqIE1hdGguUEkgLyAzNjAgLyAzNjAwKVxuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pdCBub3QgZm91bmQgLSBcIiArIHVuaXQpXG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbnZlcnRUb0RlZ3JlZXModmFsdWUsIHVuaXQpe1xuICAgICAgaWYgKHVuaXQgPT0gJ8KwJyl7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBzdHIucmVwbGFjZShhbmdsZVBhdHRlcm4sIGZ1bmN0aW9uKG0sIHZhbHVlLCB1bml0KXtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgcmFkOiBjb252ZXJ0KHZhbHVlLCB1bml0KSxcbiAgICAgICAgZGVnOiBjb252ZXJ0VG9EZWdyZWVzKHZhbHVlLCB1bml0KVxuICAgICAgfTtcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsaW1pdChhbmdsZSl7XG4gICAgaWYgKGFuZ2xlIDwgMC4wMDMpIHJldHVybiAwLjAwMztcbiAgICBlbHNlIHJldHVybiBhbmdsZTtcbiAgfVxuXG4gIHJldHVybiBTZWN0b3I7XG5cblxufSgpKTtcbiJdfQ==
