(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/zdespolit/projects/_archive/towers/client/views/Router.js":[function(require,module,exports){
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

},{"views/MainView":"/home/zdespolit/projects/_archive/towers/node_modules/views/MainView.js","views/base/TableView":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/TableView.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/components/accordion.js":[function(require,module,exports){

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

},{}],"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseCollection.js":[function(require,module,exports){

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
},{}],"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseModel.js":[function(require,module,exports){

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

},{}],"/home/zdespolit/projects/_archive/towers/node_modules/models/Freq.js":[function(require,module,exports){
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

},{"models/BaseModel":"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseModel.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/models/GeoObject.js":[function(require,module,exports){
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

},{"models/BaseModel":"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseModel.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/models/Location.js":[function(require,module,exports){
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

},{"models/BaseCollection":"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseCollection.js","models/BaseModel":"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseModel.js","models/GeoObject":"/home/zdespolit/projects/_archive/towers/node_modules/models/GeoObject.js","models/Tower":"/home/zdespolit/projects/_archive/towers/node_modules/models/Tower.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/models/Point.js":[function(require,module,exports){
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
},{"models/Location":"/home/zdespolit/projects/_archive/towers/node_modules/models/Location.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/models/State.js":[function(require,module,exports){

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

},{}],"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js":[function(require,module,exports){
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

},{"views/config":"/home/zdespolit/projects/_archive/towers/node_modules/views/config.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/models/Tower.js":[function(require,module,exports){
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

},{"models/GeoObject":"/home/zdespolit/projects/_archive/towers/node_modules/models/GeoObject.js","models/Point":"/home/zdespolit/projects/_archive/towers/node_modules/models/Point.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/MainView.js":[function(require,module,exports){
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

},{"components/accordion":"/home/zdespolit/projects/_archive/towers/node_modules/components/accordion.js","models/BaseCollection":"/home/zdespolit/projects/_archive/towers/node_modules/models/BaseCollection.js","models/Freq":"/home/zdespolit/projects/_archive/towers/node_modules/models/Freq.js","models/Location":"/home/zdespolit/projects/_archive/towers/node_modules/models/Location.js","models/Point":"/home/zdespolit/projects/_archive/towers/node_modules/models/Point.js","models/State":"/home/zdespolit/projects/_archive/towers/node_modules/models/State.js","models/Tower":"/home/zdespolit/projects/_archive/towers/node_modules/models/Tower.js","views/MapView":"/home/zdespolit/projects/_archive/towers/node_modules/views/MapView.js","views/base/View":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js","views/forms/LegendView":"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/LegendView.js","views/forms/LocationView":"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/LocationView.js","views/forms/LocationsView":"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/LocationsView.js","views/forms/PointsView":"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/PointsView.js","views/forms/TowerView":"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/TowerView.js","views/forms/TowersView":"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/TowersView.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/MapView.js":[function(require,module,exports){
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
      //console.log('hover')
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

},{"models/Location":"/home/zdespolit/projects/_archive/towers/node_modules/models/Location.js","models/Tower":"/home/zdespolit/projects/_archive/towers/node_modules/models/Tower.js","views/map/Geo":"/home/zdespolit/projects/_archive/towers/node_modules/views/map/Geo.js","views/map/Sector":"/home/zdespolit/projects/_archive/towers/node_modules/views/map/Sector.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/base/FieldView.js":[function(require,module,exports){

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

},{}],"/home/zdespolit/projects/_archive/towers/node_modules/views/base/ListView.js":[function(require,module,exports){
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

},{"views/base/View":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/base/TableView.js":[function(require,module,exports){
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

},{"models/Freq":"/home/zdespolit/projects/_archive/towers/node_modules/models/Freq.js","models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","views/base/FieldView":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/FieldView.js","views/base/View":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js":[function(require,module,exports){

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

},{}],"/home/zdespolit/projects/_archive/towers/node_modules/views/config.js":[function(require,module,exports){


module.exports = {

  isProd: window.location.href.indexOf('localhost') < 0

}
},{}],"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/LegendView.js":[function(require,module,exports){
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

},{"models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","views/base/View":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/LocationView.js":[function(require,module,exports){
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

},{"models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","views/base/View":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/LocationsView.js":[function(require,module,exports){
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

},{"models/Location":"/home/zdespolit/projects/_archive/towers/node_modules/models/Location.js","models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","views/base/ListView":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/ListView.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/PointsView.js":[function(require,module,exports){
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

},{"models/Point":"/home/zdespolit/projects/_archive/towers/node_modules/models/Point.js","models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","views/base/ListView":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/ListView.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/TowerView.js":[function(require,module,exports){
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

},{"models/Freq":"/home/zdespolit/projects/_archive/towers/node_modules/models/Freq.js","models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","models/Tower":"/home/zdespolit/projects/_archive/towers/node_modules/models/Tower.js","views/base/View":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/View.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/forms/TowersView.js":[function(require,module,exports){
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

},{"models/Templates":"/home/zdespolit/projects/_archive/towers/node_modules/models/Templates.js","models/Tower":"/home/zdespolit/projects/_archive/towers/node_modules/models/Tower.js","views/base/ListView":"/home/zdespolit/projects/_archive/towers/node_modules/views/base/ListView.js"}],"/home/zdespolit/projects/_archive/towers/node_modules/views/map/Geo.js":[function(require,module,exports){
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

},{}],"/home/zdespolit/projects/_archive/towers/node_modules/views/map/Sector.js":[function(require,module,exports){
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

},{"views/map/Geo":"/home/zdespolit/projects/_archive/towers/node_modules/views/map/Geo.js"}]},{},["/home/zdespolit/projects/_archive/towers/client/views/Router.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvdmlld3MvUm91dGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvbXBvbmVudHMvYWNjb3JkaW9uLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9CYXNlQ29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9tb2RlbHMvQmFzZU1vZGVsLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9GcmVxLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9HZW9PYmplY3QuanMiLCJub2RlX21vZHVsZXMvbW9kZWxzL0xvY2F0aW9uLmpzIiwibm9kZV9tb2R1bGVzL21vZGVscy9Qb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9tb2RlbHMvU3RhdGUuanMiLCJub2RlX21vZHVsZXMvbW9kZWxzL1RlbXBsYXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9tb2RlbHMvVG93ZXIuanMiLCJub2RlX21vZHVsZXMvdmlld3MvTWFpblZpZXcuanMiLCJub2RlX21vZHVsZXMvdmlld3MvTWFwVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9iYXNlL0ZpZWxkVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9iYXNlL0xpc3RWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Jhc2UvVGFibGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Jhc2UvVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9jb25maWcuanMiLCJub2RlX21vZHVsZXMvdmlld3MvZm9ybXMvTGVnZW5kVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9mb3Jtcy9Mb2NhdGlvblZpZXcuanMiLCJub2RlX21vZHVsZXMvdmlld3MvZm9ybXMvTG9jYXRpb25zVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9mb3Jtcy9Qb2ludHNWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL2Zvcm1zL1Rvd2VyVmlldy5qcyIsIm5vZGVfbW9kdWxlcy92aWV3cy9mb3Jtcy9Ub3dlcnNWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3ZpZXdzL21hcC9HZW8uanMiLCJub2RlX21vZHVsZXMvdmlld3MvbWFwL1NlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTWFpblZpZXcgPSByZXF1aXJlKCd2aWV3cy9NYWluVmlldycpO1xudmFyIFRhYmxlVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2Jhc2UvVGFibGVWaWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xuXG4gICAgcm91dGVzOiB7XG4gICAgICAnJzogJ21haW4nLFxuICAgICAgJ3VzZXJzJzogJ3VzZXJzJ1xuICAgIH0sXG5cbiAgICBtYWluOiBmdW5jdGlvbigpe1xuICAgICAgTWFpblZpZXcuZ2V0KCkuc2hvdygpO1xuICAgICAgJCgnI3VzZXJzLWxpc3QnKS5oaWRlKCk7XG4gICAgfSxcblxuICAgIHVzZXJzOiBmdW5jdGlvbigpe1xuICAgICAgdmFyICR1c2VycyA9ICQoJyN1c2Vycy1saXN0JylcbiAgICAgICR1c2Vycy5zaG93KCk7XG4gICAgICBuZXcgVGFibGVWaWV3KHtcbiAgICAgICAgZWw6ICR1c2VycyxcbiAgICAgICAgY29sbGVjdGlvbjogQmFzZUNvbGxlY3Rpb24uY3JlYXRlQ29sbGVjdGlvbigndXNlcnMnLCBVc2VyKSxcbiAgICAgICAgY29sbGVjdGlvbnM6IHtcbiAgICAgICAgICBsb2NhdGlvbnM6IEJhc2VDb2xsZWN0aW9uLmNyZWF0ZUNvbGxlY3Rpb24oXCJsb2NhdGlvbnNcIiwgTG9jYXRpb24pXG4gICAgICAgIH1cbiAgICAgIH0pLnNob3coKTtcbiAgICAgICQoJy51c2VyLCAubGVnZW5kJykuaGlkZSgpO1xuXG4gICAgICAkKCcuYWNjLWl0ZW0udG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnLyc7XG4gICAgICB9KVxuICAgIH1cblxuICB9KVxuXG4gIHZhciBpbml0ID0gZnVuY3Rpb24oKXtcbiAgICBuZXcgUm91dGVyKCk7XG4gICAgQmFja2JvbmUuaGlzdG9yeS5zdGFydCh7cHVzaFN0YXRlOiB0cnVlfSk7XG4gIH1cblxuICB2YXIgZGVwcyA9IFtdLFxuICAgICAgcmVzb2x2ZURlcGVuZGVuY3kgPSBmdW5jdGlvbihuYW1lKXtcbiAgICAgICAgZGVwcy5wdXNoKG5hbWUpO1xuICAgICAgICBpZiAoZGVwcy5sZW5ndGggPT0gMil7XG4gICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgeW1hcHMucmVhZHkoZnVuY3Rpb24oKXtcbiAgICByZXNvbHZlRGVwZW5kZW5jeSgneWFuZGV4IG1hcHMnKTtcbiAgfSlcblxuICAkKGZ1bmN0aW9uKCl7XG4gICAgcmVzb2x2ZURlcGVuZGVuY3koJ2RvbScpO1xuICB9KVxuXG4gIHJldHVybiB7fTtcblxufSgpKTtcbiIsIlxuJChmdW5jdGlvbigpe1xuICB2YXIgZXZlbnRzID0gQmFja2JvbmU7XG4gIHZhciBhY2MgPSAkKCcuYWNjb3JkaW9uJyk7XG5cbiAgd2luZG93LmluaXRBY2NvcmRpb24gPSBmdW5jdGlvbigpe1xuICAgIGFjYy5maW5kKCcuYWNjLWl0ZW0tZGF0YScpLmhpZGUoKTtcblxuICAgIGFjYy5maW5kKCcudG9nZ2xlJykuZGF0YSgnc3RhdGUnLCBmYWxzZSk7XG5cbiAgICBhY2MuZmluZCgnLmFjYy1pdGVtJykuY2xpY2soZnVuY3Rpb24oZSl7XG5cbiAgICAgIGlmICgkKGUudGFyZ2V0KS5oYXNDbGFzcygnYWNjLWl0ZW0tbmFtZScpID09IGZhbHNlKSByZXR1cm47XG5cbiAgICAgIGFjYy5maW5kKCcuYWNjLWl0ZW0nKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKVxuXG4gICAgICB2YXIgaXRlbSA9ICQodGhpcyk7XG4gICAgICB2YXIgaXRlbURhdGEgPSBpdGVtLmZpbmQoJy5hY2MtaXRlbS1kYXRhJyk7XG5cbiAgICAgIGlmICghaXRlbURhdGEubGVuZ3RoKXtcbiAgICAgICAgYWNjLmZpbmQoJy5hY2MtaXRlbS1kYXRhJykuaGlkZSgpOy8vb3RoZXJzXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtRGF0YS5pcygnOmhpZGRlbicpKXtcblxuICAgICAgICBhY2MuZmluZCgnLmFjYy1pdGVtLWRhdGEnKS5oaWRlKCk7Ly9vdGhlcnNcbiAgICAgICAgaXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKVxuICAgICAgICBpdGVtRGF0YS5zaG93KCk7XG4gICAgICAgIGV2ZW50cy50cmlnZ2VyKCdjaGFuZ2U6YWNjb3JkaW9uJywgaXRlbS5kYXRhKCd0eXBlJykpXG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGl0ZW1EYXRhLmhpZGUoKTtcbiAgICAgIH1cbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG5cbiAgICBhY2MuZmluZCgnLnRvZ2dsZScpLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbCA9ICQodGhpcyk7XG4gICAgICB2YXIgc3RhdGUgPSAhJGVsLmRhdGEoJ3N0YXRlJyk7XG4gICAgICB2YXIgJGFjdGlvbnMgPSAkKCcuYWNjLWl0ZW0nKVxuICAgICAgaWYgKHN0YXRlKXtcbiAgICAgICAgJGFjdGlvbnMuc2hvdygpO1xuICAgICAgICAkZWwuZmluZCgnc3BhbicpLnRleHQoJ+KXgScpXG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRhY3Rpb25zLmhpZGUoKTtcbiAgICAgICAgJGVsLmZpbmQoJ3NwYW4nKS50ZXh0KCfilrcnKVxuICAgICAgICAkYWN0aW9ucy5jc3MoJ21pbi13aWR0aCcsICc1NXB4JylcbiAgICAgIH1cbiAgICAgICRlbC5kYXRhKCdzdGF0ZScsIHN0YXRlKTtcbiAgICAgICRlbC5zaG93KCk7IC8vYWx3YXlzXG4gICAgICBldmVudHMudHJpZ2dlcigndG9nZ2xlOmFjY29yZGlvbicsIHN0YXRlKVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pXG5cbiAgfVxuICB3aW5kb3cuYWNjU2VsZWN0ID0gZnVuY3Rpb24oaWQpe1xuICAgIHZhciAkZWwgPSAkKCcuYWNjLWl0ZW0udG9nZ2xlJylcbiAgICAkZWwuZGF0YSgnc3RhdGUnLCB0cnVlKTtcbiAgICB2YXIgJGFjdGlvbnMgPSAkKCcuYWNjLWl0ZW0nKVxuICAgICRhY3Rpb25zLnNob3coKTtcbiAgICAkZWwuZmluZCgnc3BhbicpLnRleHQoJ+KWtycpXG4gICAgJGVsLmZpbmQoJ3NwYW4nKS5jc3MoJ2ZvbnQtc2l6ZScsICcnKVxuICAgIGlmICghJCgnLmFjYy1pdGVtLicgKyBpZCkuaGFzQ2xhc3MoXCJhY3RpdmVcIikpe1xuICAgICAgJCgnLmFjYy1pdGVtLicgKyBpZCArICcgLmFjYy1pdGVtLW5hbWUnKS5jbGljaygpO1xuICAgIH1cblxuICB9XG5cbiAgd2luZG93LmFjY1NlbGVjdFdpdGhvdXRFdmVudHMgPSBmdW5jdGlvbihlbCl7XG4gICAgYWNjLmZpbmQoJy5hY2MtaXRlbScpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgIGFjYy5maW5kKCcuYWNjLWl0ZW0tZGF0YScpLmhpZGUoKTtcbiAgICBlbC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICBlbC5maW5kKCcuYWNjLWl0ZW0tZGF0YScpLnNob3coKTtcbiAgfVxuXG59KTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICBmdW5jdGlvbiByZXZlcnNlU3RyaW5nKGlucHV0KXtcbiAgICB2YXIgc3RyID0gaW5wdXQudG9Mb3dlckNhc2UoKTtcbiAgICBzdHIgPSBzdHIuc3BsaXQoXCJcIik7XG4gICAgc3RyID0gXy5tYXAoc3RyLCBmdW5jdGlvbihsZXR0ZXIpIHtcbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKC0obGV0dGVyLmNoYXJDb2RlQXQoMCkpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xuICB9XG5cblxuICB2YXIgQmFzZUNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cbiAgICBzZXRTb3J0OiBmdW5jdGlvbihvcHRzKXtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgICB2YXIgYXR0ciA9IG9wdHMuYXR0ciB8fCAnbmFtZScsXG4gICAgICAgICAgZGlyID0gb3B0cy5kaXIgfHwgKCF0aGlzLnNvcnRPcHRzIHx8IHRoaXMuc29ydE9wdHMuYXR0ciAhPSBhdHRyKSA/ICdhc2MnIDogKHRoaXMuc29ydE9wdHMuZGlyID09ICdhc2MnKSA/ICdkZXNjJyA6ICdhc2MnXG5cbiAgICAgIHRoaXMuY29tcGFyYXRvciA9IGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgdmFyIHZhbHVlID0gZWwuZ2V0KGF0dHIpXG4gICAgICAgIGlmIChkaXIgPT0gJ2FzYycpe1xuICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAoYXR0ciA9PSAnZnJlcScpID8gLXZhbHVlIDogcmV2ZXJzZVN0cmluZyh2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zb3J0T3B0cyA9IHtcbiAgICAgICAgYXR0cjogYXR0cixcbiAgICAgICAgZGlyOiBkaXJcbiAgICAgIH07XG5cbiAgICB9XG5cbiAgfSlcblxuICBCYXNlQ29sbGVjdGlvbi5jcmVhdGVDb2xsZWN0aW9uID0gZnVuY3Rpb24obmFtZSwgbW9kZWwsIG9wdGlvbnMsIG1vZGVscyl7XG5cbiAgICBtb2RlbHMgPSBtb2RlbHMgfHwgZ2V0Qm9vdHN0cmFwRGF0YShuYW1lKTtcbiAgICB2YXIgY29sbGVjdGlvbiA9IG5ldyAoQmFzZUNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgIG1vZGVsOiBtb2RlbFxuICAgIH0pKShtb2RlbHMsIG9wdGlvbnMpXG4gICAgY29sbGVjdGlvbi5maWVsZHMgPSAobmV3IG1vZGVsKCkpLmZpZWxkcztcbiAgICBjb2xsZWN0aW9uLnNldFNvcnQoKVxuICAgIGNvbGxlY3Rpb24uc29ydCgpXG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG5cbiAgICBmdW5jdGlvbiBnZXRCb290c3RyYXBEYXRhKG5hbWUpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoJCgnLmRhdGEtaG9sZGVyLicgKyBuYW1lKS5odG1sKCkpXG4gICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgY29uc29sZS53YXJuKCdubyBkYXRhIGZvciBjb2xsZWN0aW9uIFwiJyArIG5hbWUgKyAnIFwiZm91bmQnKVxuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEJhc2VDb2xsZWN0aW9uO1xuXG59KCkpOyIsIlxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuICAgIF9nZXROYW1lOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMubmFtZSB8fCB0aGlzLnVybC5yZXBsYWNlKC9zJC8sICcnKTtcbiAgICB9LFxuXG4gICAgc2F2ZTogZnVuY3Rpb24ob3B0cyl7XG4gICAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICAgIHZhciBkYXRhID0ge307XG4gICAgICBkYXRhW3RoaXMuX2dldE5hbWUoKV0gPSB0aGlzLl90b0pTT04gPyB0aGlzLl90b0pTT04gKCkgOiB0aGlzLnRvSlNPTigpO1xuICAgICAgb3B0cy51cmwgPSAnL3Jlc3QvJyArIHRoaXMudXJsICsgJz8nICsgJC5wYXJhbShkYXRhKTtcbiAgICAgIEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zYXZlLmNhbGwodGhpcywgbnVsbCwgb3B0cylcbiAgICAgIHRoaXMuY2hhbmdlZCA9IHt9O1xuICAgICAgdGhpcy5tYXJrVG9SZXZlcnQoKTtcbiAgICB9LFxuXG4gICAgc2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIEJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zZXQuYXBwbHkodGhpcyxhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICBtYXJrVG9SZXZlcnQ6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnJlc3RvcmVBdHRyaWJ1dGVzID0gXy5jbG9uZSh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgIH0sXG5cbiAgICByZXZlcnQ6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5yZXN0b3JlQXR0cmlidXRlcyl7XG4gICAgICAgIHRoaXMuc2V0KHRoaXMucmVzdG9yZUF0dHJpYnV0ZXMsIHtzaWxlbnQ6dHJ1ZX0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvL2dldCB2aWV3IHByZXNlbnRhdGlvbiBvZiBhdHRyaWJ1dGVcbiAgICBnZXRWOiBmdW5jdGlvbihhdHRyKXtcbiAgICAgIHJldHVybiB0aGlzLmdldChhdHRyKTsgLy9ieSBkZWZhdWx0XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCl7XG4gICAgICBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMsIHt1cmw6Jy9yZXN0LycgKyB0aGlzLnVybCArICcvJyArIHRoaXMuaWR9KVxuICAgIH0sXG5cbiAgICBfX3ZhbGlkYXRlOiBmdW5jdGlvbihmaWVsZHMpe1xuICAgICAgdmFyIGVycm9ycyA9IG51bGw7XG4gICAgICBfLmVhY2goZmllbGRzLCBfLmJpbmQoZnVuY3Rpb24oZmllbGQpe1xuICAgICAgICB2YXIgZXJyb3IgPSAnJztcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGQpKXtcbiAgICAgICAgICBpZiAoIXRoaXMuZ2V0KGZpZWxkKSkge1xuICAgICAgICAgICAgZXJyb3IgPSAn0J7QsdGP0LfQsNGC0LXQu9GM0L3QvtC1INC/0L7Qu9C1JztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChmaWVsZCkpe1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZ2V0KGZpZWxkLm5hbWUpO1xuICAgICAgICAgIGVycm9yID0gZmllbGQudmFsaWRhdGUodmFsdWUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZmllbGQpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIG9iaiB0eXBlLlwiKVxuICAgICAgICB9XG4gICAgICAgIGlmIChlcnJvcil7XG4gICAgICAgICAgdmFyIGV2ZW50ID0gJ2ludmFsaWQ6JysgKGZpZWxkLm5hbWUgfHwgZmllbGQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd0cmlnZ2VyICcgKyBldmVudClcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoZXZlbnQsIGVycm9yKTtcbiAgICAgICAgICBlcnJvcnMgPSBlcnJvcnMgfHwge307XG4gICAgICAgICAgZXJyb3JzW2ZpZWxkXSA9IGVycm9yO1xuICAgICAgICB9XG5cbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgcmV0dXJuIGVycm9ycztcbiAgICB9XG5cbiAgfSk7XG5cblxufSgpKTtcbiIsInZhciBCYXNlTW9kZWwgPSByZXF1aXJlKCdtb2RlbHMvQmFzZU1vZGVsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIEJhc2VNb2RlbC5leHRlbmQoe1xuXG4gICAgdXJsOiAnZnJlcXMnLFxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAndmFsdWUnLFxuICAgICAgICBsYWJlbDogJ9Cn0LDRgdGC0L7RgtCwJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbG9yJyxcbiAgICAgICAgbGFiZWw6ICfQptCy0LXRgidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd0eXBlJyxcbiAgICAgICAgbGFiZWw6ICfQotC40L8nXG4gICAgICB9XG4gICAgXSxcblxuICAgIHNob3VsZFNob3c6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5nZXQoJ3Nob3cnKSAhPT0gZmFsc2U7XG4gICAgfSxcblxuICAgIGlzU2hvd246IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zaG91bGRTaG93KClcbiAgICB9LFxuXG4gICAgc3dpdGNoVmlzaWJpbGl0eTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgc2hvdzogIXRoaXMuc2hvdWxkU2hvdygpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG5cblxufSgpKTtcbiIsInZhciBCYXNlTW9kZWwgPSByZXF1aXJlKCdtb2RlbHMvQmFzZU1vZGVsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIEJhc2VNb2RlbC5leHRlbmQoe1xuXG4gICAgZmllbGRzOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgbGFiZWw6ICfQndCw0LfQstCw0L3QuNC1J1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbW1lbnQnLFxuICAgICAgICBsYWJlbDogJ9Ca0L7QvNC80LXQvdGC0LDRgNC40LknXG4gICAgICB9XG4gICAgXSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzLCBvcHRzKXtcbiAgICAgIGlmIChhdHRycyl7XG4gICAgICAgIGF0dHJzID0gdGhpcy5wYXJzZShhdHRycyk7XG4gICAgICAgIHRoaXMuc2V0KGF0dHJzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX3RvSlNPTjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZXN1bHQgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgICByZXN1bHQuc3RhcnQgPSBhcnJheVRvUG9pbnQocmVzdWx0LnN0YXJ0KTtcbiAgICAgIGlmIChyZXN1bHQuZW5kICYmIHRoaXMuaXMgJiYgdGhpcy5pcygnaGlnaHdheScpKXtcbiAgICAgICAgcmVzdWx0LmVuZCA9IGFycmF5VG9Qb2ludChyZXN1bHQuZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSByZXN1bHQuZW5kO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHJlc3VsdC5fdG93ZXJzO1xuICAgICAgZGVsZXRlIHJlc3VsdC50b3dlcnM7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBwYXJzZTogZnVuY3Rpb24oYXR0cnMpe1xuICAgICAgaWYgKCFhdHRycykgcmV0dXJuXG4gICAgICBpZiAoYXR0cnMuc3RhcnQpe1xuICAgICAgICBhdHRycy5zdGFydCA9IHBvaW50VG9BcnJheShhdHRycy5zdGFydClcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5lbmQpe1xuICAgICAgICBhdHRycy5lbmQgPSBwb2ludFRvQXJyYXkoYXR0cnMuZW5kKVxuICAgICAgICBhdHRycy50eXBlID0gYXR0cnMudHlwZSB8fCAnaGlnaHdheSc7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuY29tbWVudCl7XG4gICAgICAgIGF0dHJzLmNvbW1lbnQgPSBhdHRycy5jb21tZW50LnJlcGxhY2UoLyZsdDsvZywgJzwnKS5yZXBsYWNlKC8mZ3Q7L2csICc+JylcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRycztcbiAgICB9LFxuXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaWQgPSB0aGlzLmlkXG4gICAgICByZXR1cm4gdGhpcy5fX3ZhbGlkYXRlKFtcbiAgICAgICAgJ25hbWUnLCAvL3JlcXVpcmVkXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnbmFtZScsXG4gICAgICAgICAgdmFsaWRhdGU6IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICAgICAgdmFyIGxvYyA9IHN0YXRlLmdldCgnbG9jYXRpb25zJykuZmluZChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgIHJldHVybiBlbC5nZXQoJ25hbWUnKSA9PSBuYW1lICYmIGVsLmlkICE9IGlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAobG9jKSByZXR1cm4gJ9Cd0LUg0YPQvdC40LrQsNC70YzQvdC+0LUg0L3QsNC30LLQsNC90LjQtSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdKVxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBwb2ludFRvQXJyYXkocG9pbnQpe1xuICAgIGlmICghcG9pbnQpIHJldHVybiBudWxsO1xuICAgIGlmIChfLmlzQXJyYXkocG9pbnQpKSByZXR1cm4gcG9pbnQ7XG4gICAgcmV0dXJuIFtwb2ludC5sYXRpdHVkZSwgcG9pbnQubG9uZ2l0dWRlXVxuICB9XG4gIGZ1bmN0aW9uIGFycmF5VG9Qb2ludChhcnJheSl7XG4gICAgaWYgKCFhcnJheSkgcmV0dXJuIHtsYXRpdHVkZTpudWxsLGxvbmdpdHVkZTpudWxsfVxuICAgIHJldHVybiB7XG4gICAgICBsYXRpdHVkZTogYXJyYXlbMF0sXG4gICAgICBsb25naXR1ZGU6IGFycmF5WzFdXG4gICAgfVxuICB9XG5cbn0oKSk7XG4iLCJ2YXIgQmFzZU1vZGVsID0gcmVxdWlyZSgnbW9kZWxzL0Jhc2VNb2RlbCcpO1xudmFyIEJhc2VDb2xsZWN0aW9uID0gcmVxdWlyZSgnbW9kZWxzL0Jhc2VDb2xsZWN0aW9uJyk7XG52YXIgR2VvT2JqZWN0ID0gcmVxdWlyZSgnbW9kZWxzL0dlb09iamVjdCcpO1xudmFyIFRvd2VyID0gcmVxdWlyZSgnbW9kZWxzL1Rvd2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIEdlb09iamVjdC5leHRlbmQoe1xuXG4gICAgdXJsOiAnbG9jYXRpb25zJyxcblxuICAgIGZpZWxkczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnbmFtZScsXG4gICAgICAgIGxhYmVsOiAn0J3QsNC30LLQsNC90LjQtSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb21tZW50JyxcbiAgICAgICAgbGFiZWw6ICfQmtC+0LzQvNC10L3RgtCw0YDQuNC5J1xuICAgICAgfVxuICAgIF0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihhdHRycywgb3B0cyl7XG4gICAgICBpZiAoYXR0cnMpe1xuICAgICAgICBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMpO1xuICAgICAgICB0aGlzLnNldChhdHRycyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlzOiBmdW5jdGlvbih0eXBlKXtcbiAgICAgIHJldHVybiB0eXBlID09ICdsb2NhdGlvbic7XG4gICAgfSxcblxuICAgIGlzVG93ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5pcygndG93ZXInKTtcbiAgICB9LFxuXG4gICAgX3RvSlNPTjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZXN1bHQgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgICByZXN1bHQuc3RhcnQgPSBhcnJheVRvUG9pbnQocmVzdWx0LnN0YXJ0KTtcbiAgICAgIGlmIChyZXN1bHQuZW5kICYmIHRoaXMuaXMgJiYgdGhpcy5pcygnaGlnaHdheScpKXtcbiAgICAgICAgcmVzdWx0LmVuZCA9IGFycmF5VG9Qb2ludChyZXN1bHQuZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSByZXN1bHQuZW5kO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHJlc3VsdC5fdG93ZXJzO1xuICAgICAgZGVsZXRlIHJlc3VsdC50b3dlcnM7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBwYXJzZTogZnVuY3Rpb24oYXR0cnMpe1xuICAgICAgaWYgKCFhdHRycykgcmV0dXJuXG4gICAgICBpZiAoYXR0cnMuc3RhcnQpe1xuICAgICAgICBhdHRycy5zdGFydCA9IHBvaW50VG9BcnJheShhdHRycy5zdGFydClcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5lbmQpe1xuICAgICAgICBhdHRycy5lbmQgPSBwb2ludFRvQXJyYXkoYXR0cnMuZW5kKVxuICAgICAgICBhdHRycy50eXBlID0gYXR0cnMudHlwZSB8fCAnaGlnaHdheSc7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuY29tbWVudCl7XG4gICAgICAgIGF0dHJzLmNvbW1lbnQgPSBhdHRycy5jb21tZW50LnJlcGxhY2UoLyZsdDsvZywgJzwnKS5yZXBsYWNlKC8mZ3Q7L2csICc+JylcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRycztcbiAgICB9LFxuXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaWQgPSB0aGlzLmlkXG4gICAgICByZXR1cm4gdGhpcy5fX3ZhbGlkYXRlKFtcbiAgICAgICAgJ25hbWUnLCAvL3JlcXVpcmVkXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnbmFtZScsXG4gICAgICAgICAgdmFsaWRhdGU6IGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgICAgICAgdmFyIGxvYyA9IHN0YXRlLmdldCgnbG9jYXRpb25zJykuZmluZChmdW5jdGlvbihlbCl7XG4gICAgICAgICAgICAgIHJldHVybiBlbC5nZXQoJ25hbWUnKSA9PSBuYW1lICYmIGVsLmlkICE9IGlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAobG9jKSByZXR1cm4gJ9Cd0LUg0YPQvdC40LrQsNC70YzQvdC+0LUg0L3QsNC30LLQsNC90LjQtSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdKVxuICAgIH0sXG5cbiAgICBnZXRUb3dlcnM6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXRoaXMuZ2V0KCdfdG93ZXJzJykpe1xuICAgICAgICB2YXIgdG93ZXJzID0gQmFzZUNvbGxlY3Rpb24uY3JlYXRlQ29sbGVjdGlvbigndG93ZXJzJywgVG93ZXIsIHt9LCB0aGlzLmdldCgndG93ZXJzJykpO1xuICAgICAgICB0aGlzLnNldCh7X3Rvd2Vyczp0b3dlcnN9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvd2VycyA9IHRoaXMuZ2V0KCdfdG93ZXJzJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG93ZXJzO1xuICAgIH0sXG5cbiAgICBnZXRQb2ludHM6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaWQgPSB0aGlzLmdldCgnaWQnKTtcbiAgICAgIHZhciBhcnIgPSBzdGF0ZS5nZXQoJ3BvaW50cycpLmZpbHRlcihmdW5jdGlvbihlbCl7XG4gICAgICAgIHJldHVybiBlbC5nZXQoJ2xvY2F0aW9uSWQnKSA9PSBpZFxuICAgICAgfSlcbiAgICAgIHJldHVybiBfKGFycilcbiAgICB9LFxuXG4gICAgZ2V0TmFtZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmdldCgnbmFtZScpIHx8ICfQndC+0LLQsNGPINC70L7QutCw0YbQuNGPJ1xuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBwb2ludFRvQXJyYXkocG9pbnQpe1xuICAgIGlmICghcG9pbnQpIHJldHVybiBudWxsO1xuICAgIGlmIChfLmlzQXJyYXkocG9pbnQpKSByZXR1cm4gcG9pbnQ7XG4gICAgcmV0dXJuIFtwb2ludC5sYXRpdHVkZSwgcG9pbnQubG9uZ2l0dWRlXVxuICB9XG4gIGZ1bmN0aW9uIGFycmF5VG9Qb2ludChhcnJheSl7XG4gICAgaWYgKCFhcnJheSkgcmV0dXJuIHtsYXRpdHVkZTpudWxsLGxvbmdpdHVkZTpudWxsfVxuICAgIHJldHVybiB7XG4gICAgICBsYXRpdHVkZTogYXJyYXlbMF0sXG4gICAgICBsb25naXR1ZGU6IGFycmF5WzFdXG4gICAgfVxuICB9XG5cbn0oKSk7XG4iLCJ2YXIgR2VvT2JqZWN0ID0gcmVxdWlyZSgnbW9kZWxzL0xvY2F0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIG5hbWUgPSAnJyxcbiAgICAgIHBvaW50UmFkaXVzID0gMTI7XG5cbiAgcmV0dXJuIEdlb09iamVjdC5leHRlbmQoe1xuXG4gICAgdXJsOiAncG9pbnRzJyxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzKXtcbiAgICAgIGF0dHJzID0gdGhpcy5wYXJzZShhdHRycyB8fCB7fSlcbiAgICAgIHRoaXMuc2V0KGF0dHJzKVxuICAgICAgdGhpcy5zZXQoe3JhZGl1czogcG9pbnRSYWRpdXN9KVxuICAgIH0sXG5cbiAgICBnZXRUb3dlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBsb2NhdGlvbiA9IHN0YXRlLmdldCgnbG9jYXRpb25zJykuZ2V0KHRoaXMuZ2V0KCdsb2NhdGlvbklkJykpXG4gICAgICByZXR1cm4gbG9jYXRpb24uZ2V0VG93ZXJzKCkuZ2V0KHRoaXMuZ2V0KFwidG93ZXJJZFwiKSlcbiAgICB9LFxuXG4gICAgaXM6IGZ1bmN0aW9uKHR5cGUpe1xuICAgICAgcmV0dXJuIHR5cGUgPT0gJ3BvaW50JztcbiAgICB9LFxuXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgc2V0TmFtZTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuc2V0KHtuYW1lOiBuYW1lIHx8ICfQsdC10Lcg0LjQvNC10L3QuCd9KVxuICAgIH1cblxuICB9LCB7XG4gICAgc2V0TmFtZTogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgbmFtZSA9IHZhbHVlXG4gICAgfVxuICB9KVxuXG59KCkpOyIsIlxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gU3RhdGUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG4gICAgZmllbGRzOltcbiAgICAgICdsb2NhdGlvbnMnLFxuICAgICAgJ2xvY2F0aW9uJyxcbiAgICAgICd0b3dlcicsXG4gICAgICAnZnJlcXMnLFxuICAgICAgJ2VkaXRNb2RlbCdcbiAgICBdLFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMub24oJ2NoYW5nZTplZGl0TW9kZWwnLCBfLmJpbmQoZnVuY3Rpb24oc3RhdGUsIG1vZGVsKXtcbiAgICAgICAgaWYgKG1vZGVsKXtcbiAgICAgICAgICB0aGlzLnByZXZpb3VzID0gbW9kZWw7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKVxuICAgIH0sXG5cbiAgICBnZXRQcmV2aW91c0VkaXRNb2RlbCA6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5wcmV2aW91cztcbiAgICB9XG5cbi8vICAgICx0cmlnZ2VyOiBmdW5jdGlvbihldmVudCl7XG4vLyAgICAgIGNvbnNvbGUubG9nKGV2ZW50KVxuLy8gICAgICBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUudHJpZ2dlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4vLyAgICB9XG5cbiAgfSlcblxuXG59KCkpO1xuIiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJ3ZpZXdzL2NvbmZpZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHZhciB0ZW1wbGF0ZXNDYWNoZSA9IHt9O1xuXG4gIHZhciBUZW1wbGF0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oZGF0YSl7XG4gICAgICByZXR1cm4gZXhlY3V0ZVRlbXBsYXRlKHRoaXMuZ2V0KCdzcmMnKSwgZGF0YSlcbiAgICB9XG4gIH0pXG5cbiAgdmFyIGdldCA9IGZ1bmN0aW9uKG5hbWUpe1xuXG4gICAgaWYgKGNvbmZpZy5pc1Byb2Qpe1xuICAgICAgdmFyIGRlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcblxuICAgICAgaWYgKHRlbXBsYXRlc0NhY2hlW25hbWVdKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRlbXBsYXRlc0NhY2hlW25hbWVdKVxuICAgICAgfVxuICAgICAgdmFyICR0ZW1wbGF0ZSA9ICQoJyN0ZW1wbGF0ZS0nICsgbmFtZSlcblxuICAgICAgaWYgKCEkdGVtcGxhdGUubGVuZ3RoKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCd0ZW1wbGF0ZSBub3QgZm91bmQ6JywgbmFtZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRlbXBsYXRlc0NhY2hlW25hbWVdID0gbmV3IFRlbXBsYXRlKHtzcmM6JHRlbXBsYXRlLmh0bWwoKX0pXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodGVtcGxhdGVzQ2FjaGVbbmFtZV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJyZWRcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJC5nZXQoJy9yZXN0L3RlbXBsYXRlcy8nICsgbmFtZSArICcuaHRtbCcpLnBpcGUoZnVuY3Rpb24oc3JjKXtcbiAgICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZSh7c3JjOnNyY30pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtnZXQ6IGdldH07XG5cbiAgZnVuY3Rpb24gZXhlY3V0ZVRlbXBsYXRlKHRlbXBsYXRlLCBkYXRhKXtcbiAgICByZXR1cm4gXy50ZW1wbGF0ZSh0ZW1wbGF0ZSwgZGF0YSwge2ludGVycG9sYXRlOiAvXFwhXFx7KC4rPylcXH0vZ30pO1xuICB9XG5cblxuXG59KCkpO1xuIiwidmFyIEdlb09iamVjdCA9IHJlcXVpcmUoJ21vZGVscy9HZW9PYmplY3QnKTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJ21vZGVscy9Qb2ludCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHZhciBhbmdsZXMgPSB7XG4gICAgdG93ZXI6IFsnNjDCsCcsICc5MMKwJywgJzEyMMKwJywgJzM2MMKwJ10sXG4gICAgaGlnaHdheTogW1wiMTUnXCIsIFwiMjAnXCIsIFwiMzAnXCJdXG4gIH1cblxuICB2YXIgVG93ZXIgPSBHZW9PYmplY3QuZXh0ZW5kKHtcblxuICAgIHVybDogJ3Rvd2VycycsXG5cbiAgICBmaWVsZHM6IFtcbiAgICAgIHtuYW1lOiAnYW5nbGUnLFxuICAgICAgICBsYWJlbDogJ9Cj0LPQvtC7J30sXG4gICAgICB7bmFtZTogJ25hbWUnLFxuICAgICAgICBsYWJlbDogJ9Cd0LDQt9Cy0LDQvdC40LUnfSxcbiAgICAgIHtuYW1lOiAnZnJlcScsXG4gICAgICAgIHR5cGU6ICdmbG9hdCcsXG4gICAgICAgIGxhYmVsOiAn0KfQsNGB0YLQvtGC0LAnXG4gICAgICAgIH0sXG4gICAgICB7bmFtZTogJ2NvbW1lbnQnLFxuICAgICAgICBsYWJlbDogJ9Ca0L7QvNC80LXQvdGC0LDRgNC40LknfSxcbiAgICAgICAgJ3R5cGUnLFxuICAgICAgICAnY29sb3InXG4gICAgXSxcbiAgICBmaWVsZHMyOiBbXG4gICAgICAnc3RhcnQnLFxuICAgICAgJ3JhZGl1cycsXG4gICAgICAnYXppbXV0aCcsXG4gICAgICAnZW5kJ1xuICAgICAgXSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJzKXtcbiAgICAgIGlmIChhdHRycyl7XG4gICAgICAgIGF0dHJzID0gdGhpcy5wYXJzZShhdHRycyk7XG4gICAgICAgIGlmICghYXR0cnMuYW5nbGUpeyAvL3NldCBkZWZhdWx0IGFuZ2xlXG4gICAgICAgICAgaWYgKCFhdHRycy50eXBlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGRldGVybWluZSB0b3dlciB0eXBlLiBcIiArIGF0dHJzKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBhdHRycy5hbmdsZSA9IGFuZ2xlc1thdHRycy50eXBlXVswXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldChhdHRycylcbiAgICAgIH1cbiAgICAgIHRoaXMub24oJ2NoYW5nZTp0eXBlJywgXy5iaW5kKGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuc2V0KCdhbmdsZScsIGFuZ2xlc1t0aGlzLmdldCgndHlwZScpXVswXSlcbiAgICAgIH0sIHRoaXMpKVxuICAgIH0sXG5cbiAgICBnZXROYW1lOiBmdW5jdGlvbigpe1xuICAgICAgaWYgKCF0aGlzLmdldCgnbmFtZScpKXtcbiAgICAgICAgcmV0dXJuICfQndC+0LLQsNGPICcgKyAodGhpcy5pc0hpZ2h3YXkoKSA/ICfRgtC+0YfQutCwLdGC0L7Rh9C60LAnIDogJ9Cy0YvRiNC60LAnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodGhpcy5pc0hpZ2h3YXkoKSA/ICfQotC+0YfQutCwLdGC0L7Rh9C60LAnIDogJ9CS0YvRiNC60LAnKSAgKyAnICcgKyB0aGlzLmdldCgnbmFtZScpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfaXNOZXc6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gIXRoaXMuZ2V0KCdyYWRpdXMnKVxuICAgIH0sXG5cbiAgICBnZXRQb2ludHM6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaWQgPSB0aGlzLmdldCgnaWQnKVxuICAgICAgdmFyIGFyciA9IHN0YXRlLmdldCgncG9pbnRzJykuZmlsdGVyKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgcmV0dXJuIGVsLmdldCgndG93ZXJJZCcpID09IGlkXG4gICAgICB9KVxuICAgICAgcmV0dXJuIF8oYXJyKVxuICAgIH0sXG5cbiAgICBnZXRDb2xvcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmdldEZyZXFfKCkuZ2V0KCdjb2xvcicpXG4gICAgfSxcblxuICAgIGdldEZyZXFfOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGZyZXEgPSBwYXJzZUZsb2F0KHRoaXMuZ2V0KCdmcmVxJykpO1xuICAgICAgdmFyIHJlc3VsdCA9IHN0YXRlLmdldCgnZnJlcXMnKS5maW5kV2hlcmUoe3ZhbHVlOiBmcmVxfSlcbiAgICAgIGlmICghcmVzdWx0KXtcbiAgICAgICAgY29uc29sZS5lcnJvcihcImZyZXEgbm90IGZvdW5kOiBcIiArIGZyZXEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZUNvbG9yOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGZyZXEgPSB0aGlzLmdldEZyZXFfKCk7XG4gICAgICB0aGlzLnNldCh7Y29sb3I6IGZyZXEuZ2V0KCdjb2xvcicpfSlcbiAgICB9LFxuXG4gICAgLy/QstC+0LfQstGA0LDRidCw0LXRgiB0cnVlLCDQtdGB0LvQuCDQvtCx0YrQtdC60YIg0LLRi9GI0LrQsCDQuNC70Lgg0YLQvtGH0LrQsC3RgtC+0YfQutCwXG4gICAgaXNUb3dlcjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBpczogZnVuY3Rpb24odHlwZSl7XG4gICAgICByZXR1cm4gdGhpcy5nZXQoXCJ0eXBlXCIpID09IHR5cGU7XG4gICAgfSxcblxuICAgIGlzSGlnaHdheTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmlzKCdoaWdod2F5JylcbiAgICB9LFxuXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5fX3ZhbGlkYXRlKFsnZnJlcScsICduYW1lJ10pOy8vcmVxdWlyZWRcbiAgICB9XG5cbiAgfSlcblxuICBUb3dlci5hbmdsZXMgPSBhbmdsZXM7XG5cbiAgcmV0dXJuIFRvd2VyO1xuXG59KCkpO1xuIiwidmFyIGFjY29yZGlvbiA9IHJlcXVpcmUoJ2NvbXBvbmVudHMvYWNjb3JkaW9uJyk7XG52YXIgQmFzZUNvbGxlY3Rpb24gPSByZXF1aXJlKCdtb2RlbHMvQmFzZUNvbGxlY3Rpb24nKTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJ21vZGVscy9Qb2ludCcpO1xudmFyIFRvd2VyID0gcmVxdWlyZSgnbW9kZWxzL1Rvd2VyJyk7XG52YXIgTG9jYXRpb24gPSByZXF1aXJlKCdtb2RlbHMvTG9jYXRpb24nKTtcbnZhciBGcmVxID0gcmVxdWlyZSgnbW9kZWxzL0ZyZXEnKTtcbnZhciBTdGF0ZSA9IHJlcXVpcmUoJ21vZGVscy9TdGF0ZScpO1xudmFyIFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL1ZpZXcnKTtcbnZhciBUb3dlclZpZXcgPSByZXF1aXJlKCd2aWV3cy9mb3Jtcy9Ub3dlclZpZXcnKTtcbnZhciBMb2NhdGlvblZpZXcgPSByZXF1aXJlKCd2aWV3cy9mb3Jtcy9Mb2NhdGlvblZpZXcnKTtcbnZhciBUb3dlcnNWaWV3ID0gcmVxdWlyZSgndmlld3MvZm9ybXMvVG93ZXJzVmlldycpO1xudmFyIExvY2F0aW9uc1ZpZXcgPSByZXF1aXJlKCd2aWV3cy9mb3Jtcy9Mb2NhdGlvbnNWaWV3Jyk7XG52YXIgUG9pbnRzVmlldyA9IHJlcXVpcmUoJ3ZpZXdzL2Zvcm1zL1BvaW50c1ZpZXcnKTtcbnZhciBMZWdlbmRWaWV3ID0gcmVxdWlyZSgndmlld3MvZm9ybXMvTGVnZW5kVmlldycpO1xudmFyIE1hcFZpZXcgPSByZXF1aXJlKCd2aWV3cy9NYXBWaWV3Jyk7XG52YXIgY3JlYXRlQ29sbGVjdGlvbiA9IEJhc2VDb2xsZWN0aW9uLmNyZWF0ZUNvbGxlY3Rpb247XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cblxuICB2YXIgc3RhdGUgPSB3aW5kb3cuc3RhdGUgPSBuZXcgU3RhdGUoKTtcblxuICB2YXIgdG93ZXJzO1xuICB2YXIgZnJlcXM7XG4gIHZhciBsb2NhdGlvbnM7XG4gIHZhciBwb2ludHM7XG5cbiAgdmFyIG1haW5WaWV3ID0gbnVsbCxcbiAgICAgIG1hcDtcblxuICB2YXIgTWFpblZpZXcgPSBWaWV3LmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgICAgZnJlcXMgPSBjcmVhdGVDb2xsZWN0aW9uKCdmcmVxcycsIEZyZXEsIHsgY29tcGFyYXRvcjogZnVuY3Rpb24oZWwpe1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChlbC5nZXQoJ3ZhbHVlJykpXG4gICAgICB9fSk7XG4gICAgICBsb2NhdGlvbnMgPSBjcmVhdGVDb2xsZWN0aW9uKCdsb2NhdGlvbnMnLCBMb2NhdGlvbik7XG4gICAgICBwb2ludHMgPSBjcmVhdGVDb2xsZWN0aW9uKCdwb2ludHMnLCBQb2ludCk7XG4gICAgICBzdGF0ZS5zZXQoe1xuICAgICAgICBsb2NhdGlvbnM6IGxvY2F0aW9ucyxcbiAgICAgICAgZnJlcXM6IGZyZXFzLFxuICAgICAgICBsb2NhdGlvbjogbG9jYXRpb25zLmZpcnN0KCksXG4gICAgICAgIHBvaW50czogcG9pbnRzLFxuICAgICAgICBzaG93TG9jYXRpb25zOiB0cnVlLFxuICAgICAgICBzaG93UG9pbnRzOiB0cnVlXG4gICAgICB9KVxuICAgICAgdGhpcy52aWV3cyA9IHtcbiAgICAgICAgJ3Rvd2Vyc0xpc3QnOiBuZXcgVG93ZXJzVmlldyh7ZWw6ICcuYWNjLWl0ZW0udG93ZXJzLWxpc3QnLCBuYW1lOiAn0JLRi9GI0LrQuCd9KSxcbiAgICAgICAgJ2xvY2F0aW9uc0xpc3QnOiBuZXcgTG9jYXRpb25zVmlldyh7ZWw6ICcuYWNjLWl0ZW0ubG9jYXRpb25zLWxpc3QnLCBjb2xsZWN0aW9uOiBsb2NhdGlvbnMsIG5hbWU6ICfQm9C+0LrQsNGG0LjQuCd9KSxcbiAgICAgICAgJ3BvaW50c0xpc3QnOiBuZXcgUG9pbnRzVmlldyh7ZWw6ICcuYWNjLWl0ZW0ucG9pbnRzLWxpc3QnLCBuYW1lOiAn0KLQvtGH0LrQuCd9KVxuICAgICAgfVxuICAgICAgbmV3IExlZ2VuZFZpZXcoe2VsOiAnLmxlZ2VuZCd9KVxuXG4gICAgICB2YXIgdmlldyA9IG51bGw7XG4gICAgICBzdGF0ZS5vbignY2hhbmdlOmVkaXRNb2RlbCcsIF8uYmluZChmdW5jdGlvbihzdGF0ZSwgbW9kZWwpe1xuICAgICAgICB2aWV3ICYmIHZpZXcucmVtb3ZlKCk7XG4gICAgICAgIGlmICghbW9kZWwpIHtcbiAgICAgICAgICB2YXIgcHJldk1vZGVsID0gc3RhdGUuZ2V0UHJldmlvdXNFZGl0TW9kZWwoKTtcbiAgICAgICAgICB2YXIgbnVtYmVyID0gcHJldk1vZGVsLmlzKCdwb2ludCcpID8gMyA6IHByZXZNb2RlbC5pcygndG93ZXInKSA/IDIgOiAxO1xuICAgICAgICAgIGFjY1NlbGVjdFdpdGhvdXRFdmVudHMoJCgnLmFjYy1pdGVtOmVxKCcgKyBudW1iZXIgKyAgJyApJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZpZXcgPSBtb2RlbC5pcygndG93ZXInKSA/IG5ldyBUb3dlclZpZXcoe2ZyZXFzOmZyZXFzLCBtb2RlbDptb2RlbH0pIDogKG1vZGVsLmlzKCdsb2NhdGlvbicpPyBuZXcgTG9jYXRpb25WaWV3KHttb2RlbDptb2RlbH0pOiBudWxsKTtcbiAgICAgICAgICB2aWV3ICYmIHZpZXcucmVuZGVyQXN5bmMoKS5kb25lKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgJGVsID0gJCgnLml0ZW0tdmlldycpXG4gICAgICAgICAgICAkZWwuaHRtbCh2aWV3LiRlbCk7XG4gICAgICAgICAgICBhY2NTZWxlY3RXaXRob3V0RXZlbnRzKCRlbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdmFyIHR5cGUgPSBtb2RlbC51cmwucmVwbGFjZSgvcyQvLCAnJyk7XG4gICAgICAgICAgc3RhdGUuc2V0KHR5cGUsIG1vZGVsKVxuICAgICAgICAgIG1vZGVsLm9uKCdzeW5jJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHN0YXRlLnRyaWdnZXIoJ3N5bmM6JyArIHR5cGUsIHN0YXRlLCBtb2RlbClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIG1hcC5zZXRNb2RlbChtb2RlbCk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuaW5pdFZpZXdzKCk7XG4gICAgICB0aGlzLmluaXRGcmVxcygpO1xuICAgIH0sXG5cbiAgICBpbml0Vmlld3M6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbWFwcyA9IG5ldyAkLkRlZmVycmVkKCk7XG5cbiAgICAgIHZhciBwcm9taXNlcyA9IFtdXG4gICAgICB5bWFwcy5yZWFkeShmdW5jdGlvbigpe1xuICAgICAgICBtYXBzLnJlc29sdmUoKVxuICAgICAgfSlcbiAgICAgIHByb21pc2VzLnB1c2gobWFwcylcbiAgICAgIF8uZWFjaCh0aGlzLnZpZXdzLCBmdW5jdGlvbih2aWV3KXtcbiAgICAgICAgaWYgKHZpZXcucmVuZGVyKSB2aWV3LnJlbmRlcigpO1xuICAgICAgICBpZiAodmlldy5yZW5kZXJBc3luYyl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh2aWV3LnJlbmRlckFzeW5jKCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgJC53aGVuLmFwcGx5KCQsIHByb21pc2VzKS50aGVuKF8uYmluZChmdW5jdGlvbigpe1xuICAgICAgICBtYXAgPSB3aW5kb3cubWFwID0gbmV3IE1hcFZpZXcoe1xuICAgICAgICAgIGZyZXFzOiBmcmVxcyxcbiAgICAgICAgICBsb2NhdGlvbnM6IGxvY2F0aW9uc1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluaXRBY2NvcmRpb24oKTtcblxuICAgICAgICB2YXIgbG9jYXRpb24gPSBzdGF0ZS5nZXQoJ2xvY2F0aW9uJyk7XG4gICAgICAgIGlmIChsb2NhdGlvbil7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgc3RhdGUudHJpZ2dlcignY2hhbmdlOmxvY2F0aW9uJywgc3RhdGUsIGxvY2F0aW9uKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgaW5pdEZyZXFzOiBmdW5jdGlvbigpe1xuICAgICAgZnJlcXMub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGZyZXEsIGIsIGMpe1xuICAgICAgICB2YXIgdG93ZXJzID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpLmdldFRvd2VycygpO1xuICAgICAgICB2YXIgZmlsdGVyZWQgPSB0b3dlcnMuZmlsdGVyKGZ1bmN0aW9uKHRvd2VyKXtcbiAgICAgICAgICByZXR1cm4gdG93ZXIuZ2V0RnJlcV8oKS5jaWQgPT0gZnJlcS5jaWRcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBtYXAucmVkcmF3VG93ZXJzKF8oZmlsdGVyZWQpKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgaW5pdEFjY29yZGlvbjogZnVuY3Rpb24oKXtcbiAgICAgIHdpbmRvdy5pbml0QWNjb3JkaW9uKCk7XG4gICAgICAkKCcuYWNjb3JkaW9uJykub24oJ2hvdmVyJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH0pO1xuXG4gIE1haW5WaWV3LmdldCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKCFtYWluVmlldylcbiAgICAgIG1haW5WaWV3ID0gbmV3IE1haW5WaWV3KCk7XG4gICAgcmV0dXJuIG1haW5WaWV3O1xuICB9XG5cbiAgcmV0dXJuIE1haW5WaWV3O1xuXG5cbn0oKSlcbiIsInZhciBUb3dlciA9IHJlcXVpcmUoJ21vZGVscy9Ub3dlcicpO1xudmFyIExvY2F0aW9uID0gcmVxdWlyZSgnbW9kZWxzL0xvY2F0aW9uJyk7XG52YXIgU2VjdG9yID0gcmVxdWlyZSgndmlld3MvbWFwL1NlY3RvcicpO1xudmFyIEdlbyA9IHJlcXVpcmUoJ3ZpZXdzL21hcC9HZW8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgeW1hcHMgPSB3aW5kb3cueW1hcHM7XG4gIHZhciBtYXAgPSBudWxsO1xuXG4gIHZhciBDaXJjbGUgPSBmdW5jdGlvbihkYXRhKXtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG4gIENpcmNsZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKXtcbiAgICBtYXAuZ2VvT2JqZWN0cy5yZW1vdmUodGhpcy5kYXRhKTtcbiAgfVxuXG4gIHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XG4gICAgICB0aGlzLnRvd2Vyc0dlb09iamVjdHMgPSB7fTtcbiAgICAgIHRoaXMubG9jYXRpb25HZW9PYmplY3RzID0ge307XG4gICAgICB0aGlzLnBvaW50c0dlb09iamVjdHMgPSB7fTtcbiAgICAgIHRoaXMuaW5pdE1hcCgpO1xuICAgICAgdGhpcy5iaW5kRXZlbnRzKCk7XG4gICAgfSxcblxuICAgIGluaXRNYXA6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAobWFwKSBtYXAuZGVzdHJveSgpO1xuICAgICAgdmFyIGNlbnRlciA9IHN0YXRlLmdldCgnbG9jYXRpb24nKSA/IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXQoJ3N0YXJ0JykgOiBudWxsO1xuICAgICAgbWFwID0gbmV3IHltYXBzLk1hcCgnbWFwJywge1xuICAgICAgICBjZW50ZXI6IGNlbnRlciB8fCBbNTYuOCwgNjAuN10sXG4gICAgICAgIHpvb206IDEwLFxuICAgICAgICBjb250cm9sczogWydzZWFyY2hDb250cm9sJywgJ3R5cGVTZWxlY3RvcicsICAnZnVsbHNjcmVlbkNvbnRyb2wnLCAncnVsZXJDb250cm9sJ10sXG4gICAgICAgIGJlaGF2aW9yczogWydkZWZhdWx0JywgJ3Njcm9sbFpvb20nXVxuICAgICAgfSk7XG4gICAgICBtYXAub3B0aW9ucy5zZXQoJ3Njcm9sbFpvb21TcGVlZCcsIDUpO1xuICAgICAgbWFwLmV2ZW50cy5hZGQoJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0aGlzKTtcbiAgICAgIG1hcC5ldmVudHMuYWRkKCdtb3VzZW1vdmUnLCBfLnRocm90dGxlKHRoaXMub25Ib3ZlciwgNTApLCB0aGlzKTtcbiAgICAgIGNvbnNvbGUubG9nKG1hcC5ldmVudHMpXG4gICAgICBtYXAuY29udHJvbHMuYWRkKCd6b29tQ29udHJvbCcsIHsgbGVmdDogNSwgYm90dG9tOiAxNSB9KVxuLy8gICAgICBtYXAuY29udHJvbHMuYWRkKCd0eXBlU2VsZWN0b3InLCB7bGVmdDogMTUwLCBib3R0b206IDE1fSkgLy8g0KHQv9C40YHQvtC6INGC0LjQv9C+0LIg0LrQsNGA0YLRi1xuLy8gICAgICBtYXAuY29udHJvbHMuYWRkKCdtYXBUb29scycsIHsgbGVmdDogMzUsIGJvdHRvbTogMTUgfSk7IC8vINCh0YLQsNC90LTQsNGA0YLQvdGL0Lkg0L3QsNCx0L7RgCDQutC90L7Qv9C+0Lpcbi8vICAgINCy0LDRgNC40LDQvdGCINC60L7QvdGC0YDQvtC70L7QsiDRgdCy0LXRgNGF0YNcbi8vICAgICAgbWFwLmNvbnRyb2xzLmFkZCgnem9vbUNvbnRyb2wnLCB7IHJpZ2h0OiA1LCB0b3A6IDM1IH0pXG4vLyAgICAgICAgICAuYWRkKCd0eXBlU2VsZWN0b3InLCB7cmlnaHQ6IDM1LCB0b3A6IDY1fSkgLy8g0KHQv9C40YHQvtC6INGC0LjQv9C+0LIg0LrQsNGA0YLRi1xuLy8gICAgICAgICAgLmFkZCgnbWFwVG9vbHMnLCB7IHJpZ2h0OiAzNSwgdG9wOiAzNSB9KTsgLy8g0KHRgtCw0L3QtNCw0YDRgtC90YvQuSDQvdCw0LHQvtGAINC60L3QvtC/0L7QuiAgIF1cbiAgICAgIHRoaXMuZHJhd0xvY2F0aW9ucygpXG4gICAgfSxcblxuICAgIGJpbmRFdmVudHM6IGZ1bmN0aW9uKCl7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIF8uYmluZCh0aGlzLmtleVVwTGlzdGVuZXIsIHRoaXMpKTtcblxuICAgICAgQmFja2JvbmUub24oJ3VwZGF0ZTpsb2NhdGlvbicsIF8uYmluZChmdW5jdGlvbihtb2RlbCl7XG4gICAgICAgIHRoaXMucmVtb3ZlTG9jYXRpb24obW9kZWwpXG4gICAgICAgIHRoaXMuZHJhd0xvY2F0aW9uKG1vZGVsKVxuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICBzdGF0ZS5nZXQoXCJsb2NhdGlvbnNcIikub24oJ3JlbW92ZScsIF8uYmluZChmdW5jdGlvbihtb2RlbCl7XG4gICAgICAgIHRoaXMucmVtb3ZlTG9jYXRpb24obW9kZWwpO1xuICAgICAgfSwgdGhpcykpXG5cbiAgICAgIHZhciBkdXJhdGlvbiA9IDMwMDtcblxuICAgICAgdGhpcy5saXN0ZW5UbyhzdGF0ZSwgJ2NsaWNrOm9iamVjdCcsIGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgICAgIGlmIChvYmplY3QgJiYgb2JqZWN0LmdldCgnc3RhcnQnKSl7XG4gICAgICAgICAgbWFwLnBhblRvKG9iamVjdC5nZXQoJ3N0YXJ0Jykse2RlbGF5OjAsIGR1cmF0aW9uOmR1cmF0aW9ufSk7XG4gICAgICAgICAgc2V0VGltZW91dChfLmJpbmQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChvYmplY3QuaXNUb3dlcigpICYmIHRoaXMuZ2V0VG93ZXIob2JqZWN0LmNpZCkpe1xuICAgICAgICAgICAgICB0aGlzLmdldFRvd2VyKG9iamVjdC5jaWQpLm9wZW5CYWxsb29uKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9iamVjdC5pcygncG9pbnQnKSl7XG4gICAgICAgICAgICAgIHRoaXMuc2hvd1BvaW50SGludChvYmplY3QpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgdGhpcyksIGR1cmF0aW9uICsgNTApXG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpXG5cbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdjaGFuZ2U6bG9jYXRpb24nLCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgYWN0aXZlID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpXG4gICAgICAgIGlmICghYWN0aXZlKSByZXR1cm47XG4gICAgICAgIHRoaXMucmVtb3ZlVG93ZXJzKCk7XG4gICAgICAgIHRoaXMucmVtb3ZlUG9pbnRzKCk7XG4gICAgICAgIHRoaXMuZGVzdHJveUN1cnJlbnRPYmplY3QoKTsgLy9pZiBhbnlcblxuICAgICAgICBpZiAoYWN0aXZlLmlzTmV3KCkpIHJldHVybjtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBhY3RpdmUuZ2V0VG93ZXJzKCkub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbihtKXtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSBzZWxmLnRvd2Vyc0dlb09iamVjdHNbbS5jaWRdO1xuICAgICAgICAgICAgaWYgKG9iamVjdCkgb2JqZWN0LnJlbW92ZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2VsZi5kcmF3VG93ZXJzKGFjdGl2ZS5nZXRUb3dlcnMoKSk7XG4gICAgICAgICAgICBzZWxmLmRyYXdQb2ludHMoKTtcbiAgICAgICAgICB9LCBkdXJhdGlvbiArIDUwKVxuICAgICAgICB9KVxuICAgICAgfSwgdGhpcylcblxuICAgICAgdGhpcy5saXN0ZW5UbyhzdGF0ZSwgJ2NoYW5nZTpzaG93TG9jYXRpb25zJywgZnVuY3Rpb24oc3RhdGUsICB2YWwpe1xuICAgICAgIHRoaXMuZHJhd0xvY2F0aW9ucygpXG4gICAgICB9LCB0aGlzKTtcblxuICAgICAgdGhpcy5saXN0ZW5UbyhzdGF0ZSwgJ2NoYW5nZTpzaG93UG9pbnRzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5kcmF3UG9pbnRzKCk7XG4gICAgICB9LCB0aGlzKVxuXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLmdldCgncG9pbnRzJyksICdkZXN0cm95JywgZnVuY3Rpb24obW9kZWwpe1xuICAgICAgICB2YXIgb2JqZWN0ID0gdGhpcy5wb2ludHNHZW9PYmplY3RzW21vZGVsLmNpZF07XG4gICAgICAgIGlmIChvYmplY3QpIG9iamVjdC5yZW1vdmUoKTtcbiAgICAgIH0sIHRoaXMpXG5cbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdyZWRyYXc6cG9pbnQnLCBmdW5jdGlvbihtb2RlbCl7XG4gICAgICAgIHZhciBvYmplY3QgPSB0aGlzLnBvaW50c0dlb09iamVjdHNbbW9kZWwuY2lkXTtcbiAgICAgICAgaWYgKG9iamVjdCkgb2JqZWN0LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLmRyYXdQb2ludChtb2RlbClcbiAgICAgIH0sIHRoaXMpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqINCj0YHRgtCw0L3QsNCy0LvQuNCy0LDQtdGCINC+0LHRitC10LrRgiwg0YHQvtC30LTQsNC90LjQtdC8INC40LvQuCDRgNC10LTQsNC60YLQuNGA0L7QstCw0L3QuNC10Lwg0Lot0LPQviDQt9Cw0L3QuNC80LDQtdGC0YHRjyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Ywg0LIg0YLQtdC60YPRidC40Lkg0LzQvtC80LXQvdGCLlxuICAgICAqINCc0L7QttC10YIg0LHRi9GC0Ywg0LLRi9GI0LrQvtC5INC40LvQuCDQu9C+0LrQsNGG0LjQtdC5LlxuICAgICAqL1xuICAgIHNldE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG4gICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICB0aGlzLmRlc3Ryb3lDdXJyZW50T2JqZWN0KCk7IC8vaWYgYW55XG4gICAgfSxcblxuICAgIGtleVVwTGlzdGVuZXI6IGZ1bmN0aW9uKGUpe1xuICAgICAgaWYgKGUua2V5Q29kZSA9PSAyNyl7IC8vRVNDXG4gICAgICAgIGlmICh0aGlzLm1vZGVsKXtcbiAgICAgICAgICB0aGlzLm1vZGVsLnNldCh7XG4gICAgICAgICAgICBzdGFydDogbnVsbCxcbiAgICAgICAgICAgIGVuZDogbnVsbFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVzdHJveUN1cnJlbnRPYmplY3QoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzdHJveUN1cnJlbnRPYmplY3Q6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAodGhpcy5vYmplY3Qpe1xuICAgICAgICB0aGlzLm9iamVjdC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaXRzVG9Mb2NhdGlvbjogZnVuY3Rpb24oc3RhcnQpe1xuICAgICAgdmFyIGxvY2F0aW9uID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpO1xuICAgICAgdmFyIGRpc3RhbmNlID0gR2VvLmdldERpc3RhbmNlKHN0YXJ0LCBsb2NhdGlvbi5nZXQoJ3N0YXJ0JykpO1xuICAgICAgcmV0dXJuIGRpc3RhbmNlIDw9IGxvY2F0aW9uLmdldCgncmFkaXVzJyk7XG4gICAgfSxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpe1xuICAgICAgY29uc29sZS5sb2coJ2NsaWNrJylcbiAgICAgIGlmICghdGhpcy5tb2RlbCkgcmV0dXJuO1xuICAgICAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbDtcbiAgICAgIHZhciBwb2ludCA9IGUuZ2V0KCdjb29yZHMnKTtcbiAgICAgIGlmICghbW9kZWwuZ2V0KCdzdGFydCcpKXtcbiAgICAgICAgdmFyIHN0YXJ0ID0gcG9pbnQ7XG4gICAgICAgIGlmIChtb2RlbC5pc1Rvd2VyKCkpe1xuICAgICAgICAgIGlmICghdGhpcy5maXRzVG9Mb2NhdGlvbihzdGFydCkpe1xuICAgICAgICAgICAgYWxlcnQoJ9CU0LDQvdC90LDRjyDRgtC+0YfQutCwINC90LUg0L/RgNC40L3QsNC00LvQtdC20LjRgiDRgtC10LrRg9GJ0LXQuSDQu9C+0LrQsNGG0LjQuC4nKVxuICAgICAgICAgICAgc3RhcnQgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtb2RlbC5zZXQoe3N0YXJ0OiBzdGFydH0pO1xuICAgICAgICBpZiAobW9kZWwuaXMoJ3BvaW50Jykpe1xuICAgICAgICAgIG1vZGVsLnNldE5hbWUoKVxuICAgICAgICAgIG1vZGVsLnNhdmUoe3ZhbGlkYXRlOiBmYWxzZX0pO1xuICAgICAgICAgIHRoaXMuZHJhdyhtb2RlbClcbiAgICAgICAgICBzdGF0ZS5nZXQoJ3BvaW50cycpLmFkZChtb2RlbCk7XG4gICAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBudWxsKVxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChtb2RlbC5pc1Rvd2VyKCkpe1xuICAgICAgICAgIHRoaXMuc2V0RW5kKHBvaW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW9kZWwuaXNWYWxpZCgpKXtcbiAgICAgICAgICBtb2RlbC50cmlnZ2VyKCdiZWZvcmVTYXZlJylcbiAgICAgICAgICBtb2RlbC5zYXZlKHt2YWxpZGF0ZTogZmFsc2V9KTtcbiAgICAgICAgICB0aGlzLmRyYXcobW9kZWwpXG4gICAgICAgICAgaWYgKG1vZGVsLmlzVG93ZXIoKSl7XG4gICAgICAgICAgICBzdGF0ZS5nZXQoJ2xvY2F0aW9uJykuZ2V0VG93ZXJzKCkuYWRkKG1vZGVsKTtcblxuICAgICAgICAgIH0gZWxzZSBpZiAobW9kZWwuaXMoJ2xvY2F0aW9uJykpe1xuICAgICAgICAgICAgc3RhdGUuc2V0KCdsb2NhdGlvbicsIG1vZGVsKVxuICAgICAgICAgICAgc3RhdGUuZ2V0KCdsb2NhdGlvbnMnKS5hZGQobW9kZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdGF0ZS5zZXQoJ2VkaXRNb2RlbCcsIG51bGwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMudHJpZ2dlcignY2xpY2snKVxuICAgIH0sXG5cbiAgICBvbkhvdmVyOiBmdW5jdGlvbihlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ2hvdmVyJylcbiAgICAgIGlmICghdGhpcy5tb2RlbCkgcmV0dXJuO1xuICAgICAgaWYgKCF0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSkgcmV0dXJuO1xuICAgICAgdmFyIGVuZCA9IGUuZ2V0KCdjb29yZHMnKSxcbiAgICAgICAgICBfZW5kID0gdGhpcy5tb2RlbC5nZXQoJ2VuZCcpO1xuICAgICAgaWYgKF9lbmRcbiAgICAgICAgICAmJiBNYXRoLmFicyhfZW5kWzBdIC0gZW5kWzBdKSA8IDAuMDAwMVxuICAgICAgICAgICYmIE1hdGguYWJzKF9lbmRbMV0gLSBlbmRbMV0pIDwgMC4wMDAxKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRFbmQoZW5kKTtcblxuICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5vYmplY3Q7XG5cbiAgICAgIGlmICh0aGlzLm1vZGVsLmlzVG93ZXIoKSl7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gbmV3IFNlY3Rvcih0aGlzLm1vZGVsLmdldCgnc3RhcnQnKSwgdGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBtYXAsIHtyYXc6dHJ1ZX0pO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm1vZGVsLmlzKCdsb2NhdGlvbicpKXtcbiAgICAgICAgdGhpcy5vYmplY3QgPSB0aGlzLmRyYXdMb2NhdGlvbih0aGlzLm1vZGVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gdGhpcy5kcmF3UG9pbnQodGhpcy5tb2RlbCwge2VkaXQ6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMub2JqZWN0LnJlbmRlciAmJiB0aGlzLm9iamVjdC5yZW5kZXIoKTtcbiAgICAgIGlmIChwcmV2aW91cyl7XG4gICAgICAgIHByZXZpb3VzLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRFbmQ6IGZ1bmN0aW9uKGVuZCl7XG4gICAgICB2YXIgcmFkaXVzID0gR2VvLmdldERpc3RhbmNlKHRoaXMubW9kZWwuZ2V0KCdzdGFydCcpLCBlbmQpO1xuICAgICAgaWYgKHRoaXMubW9kZWwuaXMoJ3Rvd2VyJykpe1xuICAgICAgICByYWRpdXMgPSBNYXRoLm1pbihyYWRpdXMsIDE1MDAwKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubW9kZWwuc2V0KHtcbiAgICAgICAgYXppbXV0aDogR2VvLmdldEF6aW11dGgodGhpcy5tb2RlbC5nZXQoJ3N0YXJ0JyksIGVuZCksXG4gICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICBlbmQ6IGVuZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uKG1vZGVsKXtcbiAgICAgIGlmIChtb2RlbC5pc1Rvd2VyKCkpe1xuICAgICAgICBpZiAoIW1vZGVsLl9pc05ldygpKXsgLy/QtdGB0LvQuCDQv9GA0LDQstC60LAg0YPQttC1INGB0YPRidC10YHRgtCy0YPRjtGJ0LXQuSDQstGL0YjQutC4XG4gICAgICAgICAgdGhpcy5yZW1vdmVUb3dlcihtb2RlbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3VG93ZXIobW9kZWwpO1xuXG4gICAgICB9IGVsc2UgaWYgKG1vZGVsLmlzKCdsb2NhdGlvbicpKXtcbiAgICAgICAgdGhpcy5kcmF3TG9jYXRpb24obW9kZWwpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRyYXdQb2ludChtb2RlbCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbW92ZVRvd2VyOiBmdW5jdGlvbihtb2RlbCl7XG4gICAgICBpZiAobW9kZWwuaXNIaWdod2F5KCkpe1xuICAgICAgICB0aGlzLnJlbW92ZVRvd2VyT2JqKG1vZGVsLmNpZCArICcwJyk7XG4gICAgICAgIHRoaXMucmVtb3ZlVG93ZXJPYmoobW9kZWwuY2lkICsgJzEnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVtb3ZlVG93ZXJPYmoobW9kZWwuY2lkKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlVG93ZXJPYmo6IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHZhciBvYmplY3QgPSB0aGlzLnRvd2Vyc0dlb09iamVjdHNbaWRdO1xuICAgICAgb2JqZWN0ICYmIG9iamVjdC5yZW1vdmUoKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlTG9jYXRpb246IGZ1bmN0aW9uKG1vZGVsKXtcbiAgICAgIHZhciBhcnIgPSB0aGlzLmxvY2F0aW9uR2VvT2JqZWN0c1ttb2RlbC5jaWRdO1xuICAgICAgYXJyICYmIF8uZWFjaChhcnIsIGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgZWwucmVtb3ZlKClcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRUb3dlcjogZnVuY3Rpb24oY2lkKXtcbiAgICAgIHJldHVybiB0aGlzLnRvd2Vyc0dlb09iamVjdHNbY2lkXTtcbiAgICB9LFxuXG4gICAgZHJhd1Rvd2VyOiBmdW5jdGlvbih0b3dlcil7XG4gICAgICBpZiAodG93ZXIuaXMoJ2hpZ2h3YXknKSl7XG4gICAgICAgIHRoaXMudG93ZXJzR2VvT2JqZWN0c1t0b3dlci5jaWQgKyAnMCddID0gbmV3IFNlY3Rvcih0b3dlci5nZXQoJ3N0YXJ0JyksIHRvd2VyLmF0dHJpYnV0ZXMsIG1hcCkucmVuZGVyKCk7XG4gICAgICAgIHZhciBhdHRycyA9IF8uY2xvbmUodG93ZXIuYXR0cmlidXRlcyksXG4gICAgICAgICAgICBhID0gYXR0cnMuYXppbXV0aDtcbiAgICAgICAgYXR0cnMuYXppbXV0aCA9IGEgPiAwID8gYSAtIE1hdGguUEkgOiBNYXRoLlBJICsgYTtcbiAgICAgICAgdGhpcy50b3dlcnNHZW9PYmplY3RzW3Rvd2VyLmNpZCArICcxJ10gPSBuZXcgU2VjdG9yKHRvd2VyLmdldCgnZW5kJyksIGF0dHJzLCBtYXApLnJlbmRlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50b3dlcnNHZW9PYmplY3RzW3Rvd2VyLmNpZF0gPSBuZXcgU2VjdG9yKHRvd2VyLmdldCgnc3RhcnQnKSwgdG93ZXIuYXR0cmlidXRlcywgbWFwKS5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlQ2lyY2xlOiBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucyl7XG4gICAgICB2YXIgY2lyY2xlID0gbmV3IHltYXBzLkNpcmNsZShcbiAgICAgICAgW1xuICAgICAgICAgIG1vZGVsLmdldCgnc3RhcnQnKSxcbiAgICAgICAgICBtb2RlbC5nZXQoJ3JhZGl1cycpXG4gICAgICAgIF0sXG4gICAgICAgIHt9LFxuICAgICAgICBfLmV4dGVuZCh7XG4gICAgICAgICAgaW50ZXJhY3Rpdml0eU1vZGVsOiAnZGVmYXVsdCN0cmFuc3BhcmVudCcsXG4gICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxuICAgICAgICB9LCBvcHRpb25zKVxuICAgICAgKTtcbiAgICAgIG1hcC5nZW9PYmplY3RzLmFkZChjaXJjbGUpO1xuICAgICAgdmFyIHJlc3VsdCA9IG5ldyBDaXJjbGUoY2lyY2xlKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGRyYXdMb2NhdGlvbjogZnVuY3Rpb24obW9kZWwpe1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuY3JlYXRlQ2lyY2xlKG1vZGVsLCB7XG4gICAgICAgIGZpbGxDb2xvcjogXCIjMDAwMFwiLFxuICAgICAgICBzdHJva2VDb2xvcjogXCIjODNoXCIsXG4gICAgICAgIHN0cm9rZU9wYWNpdHk6IDAuNCxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDJcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sb2NhdGlvbkdlb09iamVjdHNbbW9kZWwuY2lkXSA9IHRoaXMubG9jYXRpb25HZW9PYmplY3RzW21vZGVsLmNpZF0gfHwgW107XG4gICAgICB0aGlzLmxvY2F0aW9uR2VvT2JqZWN0c1ttb2RlbC5jaWRdLnB1c2gocmVzdWx0KVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZHJhd1BvaW50czogZnVuY3Rpb24oKXtcbiAgICAgIHZhciB2YWx1ZSA9IHN0YXRlLmdldCgnc2hvd1BvaW50cycpLFxuICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgaWYgKHZhbHVlKXtcbiAgICAgICAgdmFyIHBvaW50cyA9IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXRQb2ludHMoKVxuICAgICAgICBwb2ludHMuZWFjaChmdW5jdGlvbihwb2ludCl7XG4gICAgICAgICAgc2VsZi5kcmF3UG9pbnQocG9pbnQpXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW1vdmVQb2ludHMoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkcmF3UG9pbnQ6IGZ1bmN0aW9uKG1vZGVsLCBvcHRzKXtcbiAgICAgIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgICB2YXIgdG93ZXIgPSBtb2RlbC5nZXRUb3dlcigpO1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuY3JlYXRlQ2lyY2xlKG1vZGVsLCB7XG4gICAgICAgIGZpbGxDb2xvcjogdG93ZXIuZ2V0Q29sb3IoKSxcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHRvd2VyLmdldENvbG9yKCksXG4gICAgICAgIHN0cm9rZU9wYWNpdHk6IDAuNCxcbiAgICAgICAgekluZGV4OiA5OTk5OSxcbiAgICAgICAgb3BhY2l0eTogbW9kZWwuaXMoJ3BvaW50JykgPyAwLjggOiAxXG4gICAgICB9KTtcbiAgICAgIHRoaXMucG9pbnRzR2VvT2JqZWN0c1ttb2RlbC5jaWRdID0gcmVzdWx0XG5cbiAgICAgIGlmICghb3B0cy5lZGl0KXtcbiAgICAgICAgcmVzdWx0LmRhdGEubW9kZWxDaWQgPSBtb2RlbC5jaWRcbiAgICAgICAgcmVzdWx0LmRhdGEuZXZlbnRzLmFkZCgnbW91c2VlbnRlcicsIF8uYmluZChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciBjaWQgPSBlLmdldCgndGFyZ2V0JykubW9kZWxDaWQ7XG4gICAgICAgICAgdmFyIHBvaW50ID0gc3RhdGUuZ2V0KCdwb2ludHMnKS5nZXQoY2lkKVxuICAgICAgICAgIHRoaXMuc2hvd1BvaW50SGludChwb2ludClcbiAgICAgICAgfSwgdGhpcykpXG4gICAgICAgIC5hZGQoJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgbWFwLmhpbnQuY2xvc2UoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHNob3dQb2ludEhpbnQ6IGZ1bmN0aW9uKHBvaW50KXtcbiAgICAgIG1hcC5oaW50Lm9wZW4ocG9pbnQuZ2V0KCdzdGFydCcpLCBwb2ludC5nZXRUb3dlcigpLmdldCgnbmFtZScpICsgJyAtICcgKyBwb2ludC5nZXQoJ25hbWUnKSk7XG4gICAgfSxcblxuICAgIGRyYXdUb3dlcnM6IGZ1bmN0aW9uKHRvd2Vycyl7XG4gICAgICB0b3dlcnMuZWFjaChfLmJpbmQoZnVuY3Rpb24odG93ZXIpe1xuICAgICAgICB2YXIgZnJlcSA9IHRvd2VyLmdldEZyZXFfKCk7XG4gICAgICAgIGlmIChmcmVxLnNob3VsZFNob3coKSl7XG4gICAgICAgICAgdG93ZXIuc2V0KCdjb2xvcicsIGZyZXEuZ2V0KCdjb2xvcicpKTtcbiAgICAgICAgICB0aGlzLmRyYXdUb3dlcih0b3dlcik7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVkcmF3VG93ZXJzOiBmdW5jdGlvbih0b3dlcnMpe1xuICAgICAgdG93ZXJzLmVhY2goXy5iaW5kKGZ1bmN0aW9uKHRvd2VyKXtcbiAgICAgICAgdGhpcy5yZW1vdmVUb3dlcih0b3dlcilcbiAgICAgICAgaWYgKHRvd2VyLmdldEZyZXFfKCkuc2hvdWxkU2hvdygpKXtcbiAgICAgICAgICB0b3dlci51cGRhdGVDb2xvcigpXG4gICAgICAgICAgdGhpcy5kcmF3VG93ZXIodG93ZXIpXG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKVxuICAgIH0sXG5cbiAgICBpc1Nob3duOiBmdW5jdGlvbih0b3dlcil7XG4gICAgICByZXR1cm4gdGhpcy50b3dlcnNHZW9PYmplY3RzW3Rvd2VyLmNpZF0gfHwgdGhpcy50b3dlcnNHZW9PYmplY3RzW3Rvd2VyLmNpZCArICcwJ11cbiAgICB9LFxuXG4gICAgZHJhd0xvY2F0aW9uczogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBzaG93ID0gc3RhdGUuZ2V0KCdzaG93TG9jYXRpb25zJylcbiAgICAgIHRoaXMucmVtb3ZlTG9jYXRpb25zKCk7XG4gICAgICBpZiAoc2hvdyl7XG4gICAgICAgIHN0YXRlLmdldCgnbG9jYXRpb25zJykuZWFjaChfLmJpbmQoZnVuY3Rpb24obG9jKXtcbiAgICAgICAgICB0aGlzLmRyYXdMb2NhdGlvbihsb2MpO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbW92ZUFsbDogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucmVtb3ZlTG9jYXRpb25zKCk7XG4gICAgICB0aGlzLnJlbW92ZVRvd2VycygpO1xuICAgICAgdGhpcy5yZW1vdmVQb2ludHMoKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlVG93ZXJzOiBmdW5jdGlvbigpe1xuICAgICAgXy5mb3JPd24odGhpcy50b3dlcnNHZW9PYmplY3RzLCBmdW5jdGlvbih0KXtcbiAgICAgICAgdC5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy50b3dlcnNHZW9PYmplY3RzID0ge307XG4gICAgfSxcblxuICAgIHJlbW92ZUxvY2F0aW9uczogZnVuY3Rpb24oKXtcbiAgICAgIF8uZWFjaCh0aGlzLmxvY2F0aW9uR2VvT2JqZWN0cywgXy5iaW5kKGZ1bmN0aW9uKGFycil7XG4gICAgICAgIF8uZWFjaChhcnIsIGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgICBlbC5yZW1vdmUoKVxuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICAgIHRoaXMubG9jYXRpb25HZW9PYmplY3RzID0ge307XG4gICAgfSxcblxuICAgIHJlbW92ZVBvaW50czogZnVuY3Rpb24oKXtcbiAgICAgIF8uZWFjaCh0aGlzLnBvaW50c0dlb09iamVjdHMsIGZ1bmN0aW9uKHBvaW50KXtcbiAgICAgICAgcG9pbnQucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucG9pbnRzR2VvT2JqZWN0cyA9IHt9O1xuICAgIH1cblxuICB9KTtcblxufSgpKTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB3aW5kb3cuRmllbGRWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0cyl7XG4gICAgICBfLmJpbmRBbGwodGhpcylcbiAgICAgIHZhciAkaW5wdXQgPSB0aGlzLiRpbnB1dCA9IG9wdHMuJGVsO1xuICAgICAgdmFyIGZpZWxkID0gdGhpcy5maWVsZE5hbWUgPSBfLmlzU3RyaW5nKG9wdHMuZmllbGQpID8gb3B0cy5maWVsZCA6IG9wdHMuZmllbGQubmFtZTtcbiAgICAgIHRoaXMuZmllbGQgPSBfLmlzT2JqZWN0KG9wdHMuZmllbGQpID8gb3B0cy5maWVsZCA6IHtuYW1lOiBmaWVsZH07XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzLm1vZGVsID0gb3B0cy5tb2RlbDtcbiAgICAgIGlmICghZmllbGQpXG4gICAgICAgIGNvbnNvbGUud2FybignQ3JlYXRpbmcgRmllbGRWaWV3IGZvciBcIm51bGxcIiBmaWVsZCcpO1xuICAgICAgaWYgKCEkaW5wdXQubGVuZ3RoKVxuICAgICAgICBjb25zb2xlLndhcm4oXCJObyBpbnB1dCBmb3VuZCBmb3IgZmllbGQgYFwiICsgZmllbGQgKyBcImBcIik7XG4gICAgICBpZiAoIW1vZGVsKVxuICAgICAgICBjb25zb2xlLndhcm4oJ05vIG1vZGVsIGRlZmluZWQgZm9yIGZpZWxkICcgKyBmaWVsZCk7XG4gICAgICB0aGlzLmJpbmRGaWVsZCgpO1xuICAgIH0sXG5cbiAgICBiaW5kRmllbGQ6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLmlzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuJGlucHV0Lm9uKHRoaXMuZ2V0UHJvcGVydHlUb0xpc3RlblRvKCksIHRoaXMuaW5wdXRDaGFuZ2VMaXN0ZW5lcilcbiAgICAgIHRoaXMubW9kZWwub24oJ2NoYW5nZTonICsgdGhpcy5maWVsZE5hbWUsIHRoaXMubW9kZWxDaGFuZ2VMaXN0ZW5lcilcbiAgICAgIHRoaXMubW9kZWwub24oJ2ludmFsaWQ6JyArIHRoaXMuZmllbGROYW1lLCB0aGlzLmludmFsaWRMaXN0ZW5lcilcbiAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5tb2RlbC5nZXQodGhpcy5maWVsZE5hbWUpKVxuICAgIH0sXG5cbiAgICBpbnB1dENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5yZW1vdmVFcnJvcnMoKTtcbiAgICAgIHRoaXMuaXNDaGFuZ2luZyA9IHRydWU7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLmdldFJhd1ZhbHVlKCk7XG4gICAgICB2YXIgY3VycmVudCA9IHRoaXMubW9kZWwuZ2V0KHRoaXMuZmllbGROYW1lKVxuICAgICAgaWYgKHRoaXMuaXNWYWxpZCh2YWx1ZSkpe1xuICAgICAgICB2YXIgdmFsID0gdGhpcy5wYXJzZVZhbHVlKHZhbHVlKVxuICAgICAgICB2YXIgZXF1YWxzID0gY3VycmVudCA9PSB2YWwgfHwgXy5pc0VxdWFsKGN1cnJlbnQsIHZhbCk7XG4gICAgICAgIGlmICghZXF1YWxzKXtcbiAgICAgICAgICB0aGlzLm1vZGVsLnNldCh0aGlzLmZpZWxkTmFtZSwgdmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHRoaXMuZmllbGROYW1lLCBjdXJyZW50KSAvL3JldmVydCBiYWNrIHRvIHByZXZpb3VzIHZhbHVlXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoY3VycmVudClcbiAgICAgIH1cbiAgICAgIHRoaXMuaXNDaGFuZ2luZyA9IGZhbHNlXG4gICAgfSxcblxuICAgIG1vZGVsQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXRoaXMuaXNDaGFuZ2luZyl7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5tb2RlbC5nZXQodGhpcy5maWVsZE5hbWUpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWxyZWFkeSBjaGFuZ2luZyAtIHNvIGRvIG5vdGhpbmdcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW52YWxpZExpc3RlbmVyOiBmdW5jdGlvbihtc2cpe1xuICAgICAgdmFyIGdyb3VwID0gdGhpcy4kaW5wdXQucGFyZW50cygnLmZvcm0tZ3JvdXAnKVxuICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpXG4gICAgICB0aGlzLnNldEVycm9yTWVzc2FnZShtc2cpXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGdyb3VwLmFkZENsYXNzKCdoYXMtZXJyb3InKVxuICAgICAgICBncm91cC5hZGRDbGFzcygnZm9yY2UnKVxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3MoJ2ZvcmNlJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHJlbW92ZUVycm9yczogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBncm91cCA9IHRoaXMuJGlucHV0LnBhcmVudHMoJy5mb3JtLWdyb3VwJylcbiAgICAgIGdyb3VwLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKVxuICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3MoJ2ZvcmNlJylcbiAgICAgIHRoaXMuc2V0RXJyb3JNZXNzYWdlKCcnKVxuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRpbnB1dC5vZmYodGhpcy5nZXRQcm9wZXJ0eVRvTGlzdGVuVG8oKSwgdGhpcy5pbnB1dENoYW5nZUxpc3RlbmVyKVxuICAgICAgdGhpcy5tb2RlbC5vZmYoJ2NoYW5nZTonICsgdGhpcy5maWVsZE5hbWUsIHRoaXMubW9kZWxDaGFuZ2VMaXN0ZW5lcilcbiAgICAgIHRoaXMubW9kZWwub2ZmKCdpbnZhbGlkOicgKyB0aGlzLmZpZWxkTmFtZSwgdGhpcy5pbnZhbGlkTGlzdGVuZXIpXG4gICAgICB0aGlzLm9mZigpXG4gICAgfSxcblxuICAgIGdldFJhd1ZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgdmFyICRpbnB1dCA9IHRoaXMuJGlucHV0O1xuICAgICAgdmFyIHR5cGUgPSAkaW5wdXQucHJvcCgndHlwZScpO1xuICAgICAgc3dpdGNoICh0eXBlKXtcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgICByZXR1cm4gJGlucHV0LnZhbCgpO1xuICAgICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICAgICAgcmV0dXJuICRpbnB1dC5pcygnOmNoZWNrZWQnKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW50IGdldCB2YWx1ZSBvZiBgXCIgKyAkaW5wdXQuc2VsZWN0b3IgKyAnYCcpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VWYWx1ZSh0aGlzLmdldFJhd1ZhbHVlKCkpO1xuICAgIH0sXG5cblxuICAgIGdldFByb3BlcnR5VG9MaXN0ZW5UbzogZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkaW5wdXQgPSB0aGlzLiRpbnB1dDtcbiAgICAgIHN3aXRjaCAoJGlucHV0LnByb3AoJ3R5cGUnKSl7XG4gICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICBjYXNlICd0ZXh0YXJlYSc6XG4gICAgICAgICAgcmV0dXJuICdrZXl1cCc7XG4gICAgICAgIGNhc2UgJ3NlbGVjdC1vbmUnOlxuICAgICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgICByZXR1cm4gJ2NoYW5nZSc7XG4gICAgICB9XG4gICAgICBjb25zb2xlLndhcm4oJ0NhbnQgYmluZCB0byBmaWVsZCBgJyArIHRoaXMuZmllbGROYW1lICsgJ2AnKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBwYXJzZVZhbHVlOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICB2YXIgZXhwZWN0ZWRNZXRob2ROYW1lID0gJ3BhcnNlJyArIHRoaXMuZmllbGROYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmZpZWxkTmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICB2YXIgcHJvcCA9IHRoaXMubW9kZWxbZXhwZWN0ZWRNZXRob2ROYW1lXVxuICAgICAgaWYgKHByb3Ape1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHByb3ApKXtcbiAgICAgICAgICBjb25zb2xlLmxvZygnY2FsbGluZyBcIicgKyBleHBlY3RlZE1ldGhvZE5hbWUgKyAnXCIgb24gJyArIHRoaXMudG9TdHJpbmcoKSlcbiAgICAgICAgICByZXR1cm4gcHJvcC5jYWxsKHRoaXMsIHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdwcm9wZXJ0eSBcIicgKyBleHBlY3RlZE1ldGhvZE5hbWUgKyAnXCIgcmVnaXN0ZXJlZCwgYnV0IGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgcHJlcGFyZVZhbHVlOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICB2YXIgZXhwZWN0ZWRNZXRob2ROYW1lID0gJ3ByZXBhcmUnICsgdGhpcy5maWVsZE5hbWVbMF0udG9VcHBlckNhc2UoKSArIHRoaXMuZmllbGROYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIHZhciBwcm9wID0gdGhpcy5tb2RlbFtleHBlY3RlZE1ldGhvZE5hbWVdXG4gICAgICBpZiAocHJvcCl7XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24ocHJvcCkpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdjYWxsaW5nIFwiJyArIGV4cGVjdGVkTWV0aG9kTmFtZSArICdcIiBvbiAnICsgdGhpcy50b1N0cmluZygpKVxuICAgICAgICAgIHJldHVybiBwcm9wLmNhbGwodGhpcywgdmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Byb3BlcnR5IFwiJyArIGV4cGVjdGVkTWV0aG9kTmFtZSArICdcIiByZWdpc3RlcmVkLCBidXQgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24odil7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnByZXBhcmVWYWx1ZSh2KSxcbiAgICAgICAgICB0eXBlID0gdGhpcy4kaW5wdXQucHJvcCgndHlwZScpO1xuICAgICAgc3dpdGNoICh0eXBlKXtcbiAgICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgICAgY2FzZSAnc2VsZWN0LW11bHRpcGxlJzpcbiAgICAgICAgICB0aGlzLiRpbnB1dC52YWwodmFsdWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICAgICAgdGhpcy4kaW5wdXQucHJvcCgnY2hlY2tlZCcsIHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW50IHNldCB2YWx1ZSB0byBgXCIgKyB0aGlzLiRpbnB1dC5zZWxlY3RvciArICdgJylcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaXNWYWxpZDogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgaWYgKHRoaXMuZmllbGQudHlwZSl7XG4gICAgICAgIHN3aXRjaCAodGhpcy5maWVsZC50eXBlKXtcbiAgICAgICAgICBjYXNlICdmbG9hdCc6XG4gICAgICAgICAgICByZXR1cm4gIWlzTmFOKHZhbHVlKSB8fCB2YWx1ZS5yZXBsYWNlICYmICFpc05hTih2YWx1ZS5yZXBsYWNlKCcsJywgJy4nKSk7XG4gICAgICAgICAgY2FzZSAnaW50JyA6XG4gICAgICAgICAgICByZXR1cm4gIWlzTmFOKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgZ2V0SW5wdXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy4kaW5wdXQ7XG4gICAgfSxcblxuICAgIHNldEVycm9yTWVzc2FnZTogZnVuY3Rpb24obXNnKXtcbiAgICAgIHZhciBlbCA9IHRoaXMuZm9ybUdyb3VwKCkuZmluZCgnLmVycm9yLW1zZycpO1xuICAgICAgZWwuaHRtbChtc2cpXG4gICAgfSxcblxuICAgIGZvcm1Hcm91cDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLiRpbnB1dC5wYXJlbnRzKCcuZm9ybS1ncm91cCcpO1xuICAgIH1cblxuXG5cbiAgfSlcblxufSgpKTtcbiIsInZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIFZpZXcuZXh0ZW5kKHtcblxuICAgIF9nZXRNb2RlbDogZnVuY3Rpb24oJGVsKXtcbiAgICAgIHZhciBjaWQgPSAkZWwucGFyZW50KCdsaScpLmRhdGEoJ2NpZCcpO1xuICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5nZXQoY2lkKTtcbiAgICB9LFxuXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLmxpc3QtZWwnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgdmFyIGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldCgkZWwuZGF0YSgnY2lkJykpO1xuICAgICAgICB0aGlzLl9fc2V0QWN0aXZlKGVsLCB7JGVsOiRlbCwgY2xpY2s6dHJ1ZX0pO1xuICAgICAgfSxcbiAgICAgICdtb3VzZWRvd24gLmFkZCc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAkZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICB9LFxuICAgICAgJ2NsaWNrIC5hZGQnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLl9jcmVhdGVNb2RlbCgpO1xuICAgICAgICBpZiAobW9kZWwpe1xuICAgICAgICAgIHN0YXRlLnNldCgnZWRpdE1vZGVsJywgbW9kZWwpO1xuICAgICAgICAgIHRoaXMuX19zZXRBY3RpdmUobW9kZWwsIHthZGQ6dHJ1ZSwgY2xpY2s6dHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAnY2xpY2sgLnJlbW92ZSc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgkZWwpO1xuICAgICAgICBpZiAodGhpcy5fY2FuUmVtb3ZlKG1vZGVsKSAmJiBjb25maXJtKHRoaXMuX3JlbW92ZU1zZygpKSl7XG4gICAgICAgICAgbW9kZWwuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICAnY2xpY2sgLmVkaXQnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwoJGVsKTtcbiAgICAgICAgdGhpcy5fZWRpdE1vZGVsKG1vZGVsLCAkZWwpXG4gICAgICAgIHRoaXMuX19zZXRBY3RpdmUobW9kZWwsIHskZWw6JGVsLCBjbGljazp0cnVlfSlcbiAgICAgIH0sXG5cbiAgICAgICdtb3VzZWVudGVyIC5saXN0LWVsJzogZnVuY3Rpb24oZSl7XG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCcuZ2x5cGhpY29uJykuc2hvdygpO1xuICAgICAgfSxcbiAgICAgICdtb3VzZWxlYXZlIC5saXN0LWVsJzogZnVuY3Rpb24oZSl7XG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCcuZ2x5cGhpY29uJykuaGlkZSgpO1xuICAgICAgfSxcblxuICAgICAgJ2NoYW5nZSAuc2hvdy1sb2NhdGlvbnMnOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgc3RhdGUuc2V0KCdzaG93TG9jYXRpb25zJywgJGVsLmlzKFwiOmNoZWNrZWRcIikpO1xuICAgICAgfSxcblxuICAgICAgJ21vdXNlZG93biAuc29ydCc6IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgJGVsID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAkZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfSxcblxuICAgICAgJ2NsaWNrIC5zb3J0JzogZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciAkZWwgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgIHZhciBhdHRyID0gJGVsLmRhdGEoJ3NvcnQtYXR0cicpO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uc2V0U29ydCh7YXR0cjogYXR0cn0pXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5zb3J0KClcbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBiaW5kVG9TdGF0ZUV2ZW50czogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuc3RvcExpc3RlbmluZyhzdGF0ZSwgJ2NoYW5nZTplZGl0TW9kZWwnKVxuICAgICAgdGhpcy5saXN0ZW5UbyhzdGF0ZSwgJ2NoYW5nZTplZGl0TW9kZWwnLCBfLmJpbmQoZnVuY3Rpb24oc3RhdGUpe1xuICAgICAgICBpZiAoc3RhdGUuZ2V0KCdlZGl0TW9kZWwnKSA9PSBudWxsKXtcbiAgICAgICAgICBpZiAoc3RhdGUuZ2V0UHJldmlvdXNFZGl0TW9kZWwoKSAmJiBzdGF0ZS5nZXRQcmV2aW91c0VkaXRNb2RlbCgpLnVybCA9PSB0aGlzLl9nZXRUeXBlKCkpe1xuICAgICAgICAgICAgdGhpcy5fX2Ryb3BBY3RpdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKVxuICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKHN0YXRlLCAnc3luYzonICsgdGhpcy5fZ2V0VHlwZSgpKVxuICAgICAgdGhpcy5saXN0ZW5UbyhzdGF0ZSwgJ3N5bmM6JyArIHRoaXMuX2dldFR5cGUoKSwgXy5iaW5kKGZ1bmN0aW9uKHN0YXRlLCBtb2RlbCl7XG4gICAgICAgIHRoaXMuX19zZXRBY3RpdmUobW9kZWwsIHtjbGljazpmYWxzZX0pXG4gICAgICB9LCB0aGlzKSlcbiAgICB9LFxuXG4gICAgcmVuZGVyQXN5bmM6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXRoaXMuY29sbGVjdGlvbikgcmV0dXJuO1xuICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVQLmRvbmUoXy5iaW5kKGZ1bmN0aW9uKHRlbXBsYXRlKXtcbiAgICAgICAgdmFyIGRpc3BsYXkgPSB0aGlzLiRlbC5maW5kKCcuYWNjLWl0ZW0tZGF0YScpLmNzcygnZGlzcGxheScpO1xuICAgICAgICB2YXIgaHRtbCA9IHRlbXBsYXRlLmV4ZWN1dGUodGhpcy5fZGF0YSgpKVxuICAgICAgICB0aGlzLiRlbC5odG1sKGh0bWwpO1xuICAgICAgICB0aGlzLiRlbC5maW5kKCcuYWNjLWl0ZW0tZGF0YScpLmNzcygnZGlzcGxheScsIGRpc3BsYXkpO1xuICAgICAgICB0aGlzLiRlbC5maW5kKCcuZ2x5cGhpY29uJykuaGlkZSgpXG4gICAgICAgIHRoaXMuX2FmdGVyUmVuZGVyKCk7XG4gICAgICAgIHRoaXMuYmluZFRvU3RhdGVFdmVudHMoKTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICBzZXRDb2xsZWN0aW9uOiBmdW5jdGlvbihjb2xsZWN0aW9uKXtcbiAgICAgIGlmICh0aGlzLmNvbGxlY3Rpb24pe1xuICAgICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcodGhpcy5jb2xsZWN0aW9uKVxuICAgICAgfVxuICAgICAgdGhpcy5jb2xsZWN0aW9uID0gY29sbGVjdGlvbjtcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIHJlbW92ZSByZXNldCBjaGFuZ2Ugc3luYyBzb3J0JywgdGhpcy5yZW5kZXJBc3luYyk7XG4gICAgICB0aGlzLnJlbmRlckFzeW5jKCk7XG4gICAgfSxcblxuICAgIF9kYXRhOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGxpc3QgPSB0aGlzLmNvbGxlY3Rpb24ubWFwKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBlbC5nZXQoJ25hbWUnKSxcbiAgICAgICAgICBjaWQ6IGVsLmNpZCxcbiAgICAgICAgICBmcmVxOiBlbC5pcygndG93ZXInKSA/IGVsLmdldCgnZnJlcScpIDogJycsXG4gICAgICAgICAgY29sb3I6IGVsLmlzKCd0b3dlcicpID8gZWwuZ2V0Q29sb3IoKSA6ICcnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHR5cGU6IHRoaXMuX2dldFR5cGUoKSxcbiAgICAgICAgbGlzdDogbGlzdCxcbiAgICAgICAgc29ydDoge1xuICAgICAgICAgIG5hbWU6IHRoaXMubWFwU29ydE9wdHMoJ25hbWUnKSxcbiAgICAgICAgICBmcmVxOiB0aGlzLm1hcFNvcnRPcHRzKCdmcmVxJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtYXBTb3J0T3B0czogZnVuY3Rpb24oYXR0cil7XG4gICAgICB2YXIgb3B0cyA9IHRoaXMuY29sbGVjdGlvbi5zb3J0T3B0c1xuXG4gICAgICBpZiAob3B0cy5hdHRyID09IGF0dHIpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRpcjogb3B0cy5kaXIgPT0gJ2FzYycgPyAnZG93bicgOiAndXAnLFxuICAgICAgICAgIGFjdGl2ZTogJ2FjdGl2ZSdcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkaXI6ICdkb3duJyxcbiAgICAgICAgICBhY3RpdmU6ICcnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy90byByZWRlZmluZSBpbiBQb2ludHNWaWV3XG4gICAgX2VkaXRNb2RlbDogZnVuY3Rpb24obW9kZWwpe1xuICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBtb2RlbCk7XG4gICAgfSxcblxuICAgIF9fc2V0QWN0aXZlOiBmdW5jdGlvbihlbCwgb3B0cyl7XG4gICAgICBvcHRzID0gb3B0cyB8fCB7fVxuICAgICAgdGhpcy5fX2Ryb3BBY3RpdmUoKTtcbiAgICAgIGlmIChvcHRzLmFkZCl7XG4gICAgICAgIG9wdHMuJGVsID0gdGhpcy4kZWwuZmluZCgnLmFkZCcpXG4gICAgICB9XG4gICAgICBlbHNlIGlmICghb3B0cy4kZWwpe1xuICAgICAgICBvcHRzLiRlbCA9IHRoaXMuJGVsLmZpbmQoJ2xpW2RhdGEtY2lkPVwiJysgZWwuY2lkICsnXCJdJylcbiAgICAgIH1cbiAgICAgIG9wdHMuJGVsLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgIGlmIChvcHRzLmNsaWNrKXtcbiAgICAgICAgc3RhdGUudHJpZ2dlcignY2xpY2s6b2JqZWN0JywgZWwpXG4gICAgICAgIHN0YXRlLnNldCh0aGlzLl9nZXRUeXBlKCksIGVsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX19kcm9wQWN0aXZlOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy4kZWwuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgfSxcblxuICAgIF9jcmVhdGVNb2RlbCA6IGZ1bmN0aW9uKCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaW1wbGVtZW50ZWQnKVxuICAgIH0sXG5cbiAgICBfcmVtb3ZlTXNnOiBmdW5jdGlvbigpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmltcGxlbWVudGVkJylcbiAgICB9LFxuXG4gICAgX2NhblJlbW92ZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBfYWZ0ZXJSZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgfSxcblxuICAgIF9nZXRUeXBlOiBmdW5jdGlvbigpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHlwZSBub3QgZGVmaW5lZFwiKVxuICAgIH1cblxuXG4gIH0pXG5cblxufSgpKTtcbiIsInZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG52YXIgRmllbGRWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9GaWVsZFZpZXcnKTtcbnZhciBGcmVxID0gcmVxdWlyZSgnbW9kZWxzL0ZyZXEnKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIFZpZXcuZXh0ZW5kKHtcblxuICAgIGV2ZW50czoge1xuICAgICAgJ2NsaWNrIC5hZGQnOiAnYWRkTW9kZWwnLFxuICAgICAgJ2NsaWNrIC5yZW1vdmUnOiAncmVtb3ZlTW9kZWwnLFxuICAgICAgJ2NsaWNrIC5lZGl0JzogJ2VkaXRNb2RlbCdcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5maWVsZHMgPSB0aGlzLmNvbGxlY3Rpb24uZmllbGRzO1xuICAgICAgdGhpcy5jb2xsZWN0aW9ucyA9IHRoaXMub3B0aW9ucy5jb2xsZWN0aW9ucztcbiAgICAgIHRoaXMudGFibGVUZW1wbGF0ZSA9IFRlbXBsYXRlcy5nZXQoJ3RhYmxlJyk7XG4gICAgICB0aGlzLnRyVGVtcGxhdGUgPSBUZW1wbGF0ZXMuZ2V0KCd0cicpO1xuICAgICAgXy5iaW5kQWxsKHRoaXMsIFsnaW5wdXRIYW5kbGVyJywgJ2Nsb3NlSW5wdXQnXSk7XG4gICAgICB0aGlzLmJpbmRFdmVudCgkKCdib2R5JyksICdjbGljaycsIHRoaXMuY2xvc2VJbnB1dCk7XG4gICAgICB0aGlzLnNhdmUgPSB0cnVlO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnJlbmRlckFzeW5jKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgVmlldy5wcm90b3R5cGUucmVtb3ZlLmNhbGwodGhpcyk7XG4gICAgfSxcblxuICAgIHJlbmRlckFzeW5jOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGNvbGxlY3Rpb25QID0gdGhpcy5jb2xsZWN0aW9uLmZldGNoKCk7XG4gICAgICByZXR1cm4gJC53aGVuKHRoaXMudGFibGVUZW1wbGF0ZSwgdGhpcy50clRlbXBsYXRlLCBjb2xsZWN0aW9uUCkuZG9uZShfLmJpbmQoZnVuY3Rpb24odCwgdHJUZW1wbGF0ZSl7XG4gICAgICAgIHZhciBtb2RlbCA9IHtcbiAgICAgICAgICBmaWVsZHM6IHRoaXMuZmllbGRzLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbi5tb2RlbHMsXG4gICAgICAgICAgdHJUZW1wbGF0ZTogdHJUZW1wbGF0ZVxuICAgICAgICB9O1xuICAgICAgICB2YXIgaHRtbCA9IHQuZXhlY3V0ZShtb2RlbCk7XG4gICAgICAgIHRoaXMuJGVsLmh0bWwoaHRtbCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgdGhpcykpXG4gICAgfSxcblxuICAgIGFkZE1vZGVsOiBmdW5jdGlvbihlKXtcbiAgICAgIHRoaXMudHJUZW1wbGF0ZS5kb25lKF8uYmluZChmdW5jdGlvbih0KXtcbiAgICAgICAgdmFyIG1vZGVsID0gbmV3IHRoaXMuY29sbGVjdGlvbi5tb2RlbCgpO1xuICAgICAgICB2YXIgdHIgPSB0LmV4ZWN1dGUoe1xuICAgICAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgICAgICBmaWVsZHM6IHRoaXMuZmllbGRzXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5hZGQobW9kZWwpO1xuICAgICAgICB0aGlzLiQoJ3Rib2R5JykuYXBwZW5kKHRyKTtcbiAgICAgICAgc2V0VGltZW91dChfLmJpbmQoZnVuY3Rpb24oKXtcbiAgICAgICAgICB0aGlzLiQoJ3Rib2R5JykuZmluZCgndHI6bGFzdCcpLmZpbmQoJ3RkOmZpcnN0JykuY2xpY2soKTtcbiAgICAgICAgfSwgdGhpcykpXG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIHJlbW92ZU1vZGVsOiBmdW5jdGlvbihlKXtcbiAgICAgIHZhciB0ZCA9ICQoZS5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICBtb2RlbCA9IHRoaXMuX2dldE1vZGVsKHRkKTtcbiAgICAgIGlmIChtb2RlbCl7XG4gICAgICAgIGlmIChjb25maXJtKCfQlNC10LnRgdGC0LLQuNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCDQtNCw0L3QvdGL0LU/Jykpe1xuICAgICAgICAgIHRkLnBhcmVudCgndHInKS5yZW1vdmUoKTtcbiAgICAgICAgICBtb2RlbC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZWRpdE1vZGVsOiBmdW5jdGlvbihlKXtcbiAgICAgIHZhciB0ZCA9ICQoZS5jdXJyZW50VGFyZ2V0KSxcbiAgICAgICAgICBmaWVsZCA9IHRkLmRhdGEoJ2ZpZWxkJyksXG4gICAgICAgICAgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbCh0ZCksXG4gICAgICAgICAgZmllbGRDaGFuZ2VkID0gZmllbGQgJiYgdGhpcy5maWVsZCAhPSBmaWVsZCxcbiAgICAgICAgICBtb2RlbENoYW5nZWQgPSBtb2RlbCAmJiB0aGlzLm1vZGVsICE9IG1vZGVsO1xuXG4gICAgICBpZiAoZmllbGRDaGFuZ2VkIHx8IG1vZGVsQ2hhbmdlZCl7XG4gICAgICAgIHRoaXMuY2xvc2VJbnB1dCgpO1xuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XG4gICAgICAgIHRoaXMuZmllbGQgPSBmaWVsZDtcbiAgICAgICAgdGhpcy50ZCA9IHRkO1xuICAgICAgICB2YXIgaW5wdXQgPSB0aGlzLmNyZWF0ZUlucHV0KCk7XG4gICAgICAgIHRoaXMuYmluZEV2ZW50KGlucHV0LCAna2V5ZG93bicsIHRoaXMuaW5wdXRIYW5kbGVyKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgIH0pXG5cbiAgICAgIH1cbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSxcblxuICAgIHNhdmVNb2RlbDogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLm1vZGVsICYmIHRoaXMubW9kZWwuaGFzQ2hhbmdlZCgpKXtcbiAgICAgICAgdGhpcy5tb2RlbC5zYXZlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnNhdmUgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBjcmVhdGVJbnB1dDogZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0ZCA9IHRoaXMudGQsXG4gICAgICAgICAgZmllbGQgPSB0aGlzLmZpZWxkLFxuICAgICAgICAgIG1vZGVsID0gdGhpcy5tb2RlbCxcbiAgICAgICAgICB2YWx1ZSA9IG1vZGVsLmdldChmaWVsZCk7XG5cbiAgICAgIHZhciBpbnB1dCA9IG51bGw7XG4gICAgICB2YXIgaW5wdXRUeXBlID0gdGhpcy5fZ2V0RmllbGQoZmllbGQpLmlucHV0O1xuICAgICAgc3dpdGNoIChpbnB1dFR5cGUpIHtcbiAgICAgICAgY2FzZSAndGV4dGFyZWEnOntcbiAgICAgICAgICBpbnB1dD0gJCgnPHRleHRhcmVhPicpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6e1xuICAgICAgICAgIGlmICghdGhpcy5jb2xsZWN0aW9ucyB8fCAhdGhpcy5jb2xsZWN0aW9uc1tmaWVsZF0pIHRocm93IG5ldyBFcnJvcignQ29sbGVjdGlvbiBmb3IgZmllbGQgJyArIGZpZWxkICsgJyBub3QgZGVmaW5lZCcpXG4gICAgICAgICAgaW5wdXQgPSAkKCc8c2VsZWN0PicpXG4gICAgICAgICAgaW5wdXQuYXR0cignbXVsdGlwbGUnLCAnbXVsdGlwbGUnKVxuICAgICAgICAgIHRoaXMuY29sbGVjdGlvbnNbZmllbGRdLmVhY2goZnVuY3Rpb24oZWwpe1xuICAgICAgICAgICAgdmFyIG9wdCA9ICQoJzxvcHRpb24+Jyk7XG4gICAgICAgICAgICBvcHQuYXR0cigndmFsdWUnLCBlbC5nZXQoJ25hbWUnKSlcbiAgICAgICAgICAgIG9wdC5odG1sKGVsLmdldCgnbmFtZScpKVxuICAgICAgICAgICAgaW5wdXQuYXBwZW5kKG9wdCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpbnB1dC5zZWxlY3QyKHtcbiAgICAgICAgICAgICAgYWxsb3dDbGVhcjp0cnVlLFxuICAgICAgICAgICAgICB3aWR0aDogJzIwMHB4J1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpbnB1dCA9ICQoJzxpbnB1dD4nKTtcbiAgICAgIH1cbiAgICAgIHRkLmh0bWwoaW5wdXQpO1xuICAgICAgaW5wdXQudmFsKHZhbHVlKTtcbiAgICAgIHRoaXMuZmllbGRWaWV3ID0gbmV3IEZpZWxkVmlldyh7XG4gICAgICAgICRlbDogaW5wdXQsXG4gICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgbW9kZWw6IG1vZGVsXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH0sXG5cbiAgICBjbG9zZUlucHV0OiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMuc2F2ZSl7XG4gICAgICAgIHRoaXMuc2F2ZU1vZGVsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNsb3NlRmllbGRWaWV3KCk7XG4gICAgICB0aGlzLm1vZGVsID0gbnVsbDtcbiAgICAgIHRoaXMuZmllbGQgPSBudWxsO1xuICAgICAgdGhpcy50ZCA9IG51bGw7XG4gICAgfSxcblxuICAgIGNsb3NlRmllbGRWaWV3OiBmdW5jdGlvbigpe1xuICAgICAgaWYgKHRoaXMuZmllbGRWaWV3KXtcbiAgICAgICAgdmFyIGlucHV0ID0gdGhpcy5maWVsZFZpZXcuZ2V0SW5wdXQoKTtcbiAgICAgICAgaW5wdXQucGFyZW50KCkuaHRtbCh0aGlzLm1vZGVsLmdldFYodGhpcy5maWVsZCkpO1xuICAgICAgICBpbnB1dC5yZW1vdmUoKVxuICAgICAgICB0aGlzLmZpZWxkVmlldy5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5maWVsZFZpZXcgPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfZ2V0TW9kZWw6IGZ1bmN0aW9uKHRkKXtcbiAgICAgIHZhciBjaWQgPSB0ZC5wYXJlbnQoJ3RyJykuZGF0YSgnbW9kZWwtY2lkJyk7XG4gICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmdldChjaWQpO1xuICAgIH0sXG5cbiAgICBpbnB1dEhhbmRsZXI6IGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIGtleSA9IGUud2hpY2g7XG4gICAgICBzd2l0Y2ggKGtleSl7XG4gICAgICAgIGNhc2UgRU5URVI6XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLmNsb3NlSW5wdXQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEVTQzpcbiAgICAgICAge1xuICAgICAgICAgIHRoaXMuc2F2ZSA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuY2xvc2VJbnB1dCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgVEFCOlxuICAgICAgICB7XG4gICAgICAgICAgdmFyIG5leHQgPSB0aGlzLl9nZXROZXh0Q2VsbCgpO1xuICAgICAgICAgIGlmIChuZXh0Lmxlbmd0aCl7XG4gICAgICAgICAgICBuZXh0LmNsaWNrKClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbG9zZUlucHV0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9nZXROZXh0Q2VsbDogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMudGQuaW5kZXgoKSxcbiAgICAgICAgICBuZXh0SW5kZXggPSBpbmRleCArIDEsXG4gICAgICAgICAgZWRpdGFibGVDZWxscyA9IHRoaXMudGQucGFyZW50KCkuY2hpbGRyZW4oJy5lZGl0Jyk7XG4gICAgICBpZiAobmV4dEluZGV4IDwgZWRpdGFibGVDZWxscy5sZW5ndGgpe1xuICAgICAgICByZXR1cm4gJChlZGl0YWJsZUNlbGxzLmdldChuZXh0SW5kZXgpKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRySW5kZXggPSB0aGlzLnRkLnBhcmVudCgndHInKS5pbmRleCgpLFxuICAgICAgICAgICAgbmV4dFRySW5kZXggPSB0ckluZGV4ICsgMTtcbiAgICAgICAgcmV0dXJuIHRoaXMudGQucGFyZW50cygndGJvZHknKS5jaGlsZHJlbignOmVxKCcgKyBuZXh0VHJJbmRleCArICcpJykuZmluZCgnLmVkaXQ6Zmlyc3QnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2dldEZpZWxkOiBmdW5jdGlvbihuYW1lKXtcbiAgICAgIHJldHVybiBfLmZpbmQodGhpcy5maWVsZHMsIGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgcmV0dXJuIGVsLm5hbWUgPT0gbmFtZTtcbiAgICAgIH0pXG4gICAgfVxuXG4gIH0pO1xuXG4gIHZhciBFTlRFUiA9IDEzLFxuICAgICAgRVNDID0gMjcsXG4gICAgICBUQUIgPSA5O1xuXG59KCkpO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cbiAgICBmaWVsZHM6IFtdLFxuXG4gICAgc2hvdzogZnVuY3Rpb24oKXtcbiAgICAgIGlmICghdGhpcy5yZW5kZXJlZCl7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIHRoaXMucmVuZGVyZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdGhpcy4kZWwuc2hvdygpO1xuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy4kZWwuaGlkZSgpO1xuICAgIH0sXG5cbiAgICBiaW5kRmllbGRzOiBmdW5jdGlvbihmaWVsZHMpe1xuICAgICAgXy5iaW5kQWxsKHRoaXMpO1xuICAgICAgaWYgKCF0aGlzLm1vZGVsKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gbW9kZWwgdG8gYmluZCB0byFcIilcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5tb2RlbC5maWVsZHMgJiYgIWZpZWxkcyl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vIGZpZWxkcyB0byBiaW5kIHRvIVwiKVxuICAgICAgfVxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5maWVsZHMgPSB7fTtcbiAgICAgIF8uZWFjaCh0aGlzLm1vZGVsLmZpZWxkcyB8fCBmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkKXtcblxuICAgICAgICB2YXIgZk5hbWUgPSBfLmlzU3RyaW5nKGZpZWxkKSA/IGZpZWxkIDogZmllbGQubmFtZTtcbiAgICAgICAgdmFyICRlbCA9IHNlbGYuJCgnLicgICsgZk5hbWUpXG4gICAgICAgIGlmICghJGVsLmxlbmd0aCl7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiTm8gaW5wdXQgZm91bmQgZm9yIGZpZWxkIGBcIiArIGZOYW1lICsgXCJgXCIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5maWVsZHNbZk5hbWVdID0gbmV3IEZpZWxkVmlldyh7XG4gICAgICAgICAgICAkZWw6ICRlbCxcbiAgICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgIG1vZGVsOiBzZWxmLm1vZGVsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgdW5iaW5kRmllbGRzOiBmdW5jdGlvbigpe1xuICAgICAgXy5lYWNoKHRoaXMuZmllbGRzLCBmdW5jdGlvbihmaWVsZFZpZXcpe1xuICAgICAgICBmaWVsZFZpZXcucmVtb3ZlKCk7XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKCRlbCwgZXZlbnROYW1lLCBmdW5jKXtcbiAgICAgIHRoaXMuaW5wdXRFdmVudHMgPSB0aGlzLmlucHV0RXZlbnRzIHx8IFtdO1xuICAgICAgdGhpcy5pbnB1dEV2ZW50cy5wdXNoKHtcbiAgICAgICAgaW5wdXQ6ICRlbCxcbiAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICBmdW5jOiBmdW5jXG4gICAgICB9KVxuICAgICAgJGVsLm9uKGV2ZW50TmFtZSwgZnVuYyk7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMudW5iaW5kRmllbGRzKCk7XG4gICAgICBfLmVhY2godGhpcy5pbnB1dEV2ZW50cywgZnVuY3Rpb24oZWwpe1xuICAgICAgICBlbC5pbnB1dC5vZmYoZWwubmFtZSwgZWwuZnVuYyk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuJGVsLmh0bWwoXCJcIik7XG4gICAgICB0aGlzLnN0b3BMaXN0ZW5pbmcoKTtcbiAgICB9LFxuXG4gICAgZm9jdXM6IGZ1bmN0aW9uKHNlbGVjdG9yKXtcbiAgICAgIHZhciAkZWwgPSB0aGlzLiQoc2VsZWN0b3IpXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbC5mb2N1cygpO1xuICAgICAgfSlcbiAgICB9XG5cbiAgfSk7XG5cbn0oKSk7XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgaXNQcm9kOiB3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdsb2NhbGhvc3QnKSA8IDBcblxufSIsInZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG52YXIgVGVtcGxhdGVzID0gcmVxdWlyZSgnbW9kZWxzL1RlbXBsYXRlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHZhciB0ID0gJzxsaSBjbGFzcz1cImZyZXEgbGlzdC1pdGVtXCI+PGlucHV0IGNsYXNzPVwiY29sb3JcIiB0eXBlPVwiY29sb3JcIiBkYXRhLWZyZXE9XCIke3ZhbHVlfVwiIHZhbHVlPVwiJHtjb2xvcn1cIj48L2Rpdj48bGFiZWw+JHt2YWx1ZX0gTWh6PC9sYWJlbD48L2xpPidcblxuICByZXR1cm4gVmlldy5leHRlbmQoe1xuXG4gICAgZXZlbnRzOntcbiAgICAgICdjbGljayAudG9nZ2xlJzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy4kKCcuZm9ybS1ib2R5JykudG9nZ2xlKCk7XG4gICAgICB9LFxuICAgICAgJ2NoYW5nZSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nOiBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd0b2dnbGUtYWxsJykpe1xuICAgICAgICAgIHRoaXMudG9nZ2xlQWxsKCRlbC5pcyhcIjpjaGVja2VkXCIpKVxuXG4gICAgICAgIH0gZWxzZSBpZiAoJGVsLmRhdGEoJ3RvZ2dsZS1wb2ludHMnKSl7XG4gICAgICAgICAgc3RhdGUuc2V0KCdzaG93UG9pbnRzJywgJGVsLmlzKCc6Y2hlY2tlZCcpKVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGNpZCA9ICRlbC5kYXRhKCdmcmVxLWNpZCcpXG4gICAgICAgICAgdmFyIGZyZXEgPSBzdGF0ZS5nZXQoJ2ZyZXFzJykuZ2V0KGNpZClcbiAgICAgICAgICBmcmVxLnN3aXRjaFZpc2liaWxpdHkoKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ2NoYW5nZSAuY29sb3InOiAnb25Db2xvckNoYW5nZSdcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXtcbiAgICAgIF8uYmluZEFsbCh0aGlzKVxuICAgICAgdGhpcy5zaG93QWxsID0gZmFsc2U7XG4gICAgICB0aGlzLnRlbXBsYXRlUHJvbWlzZSA9IFRlbXBsYXRlcy5nZXQoJ2xlZ2VuZCcpXG4gICAgICB0aGlzLmZyZXFzID0gc3RhdGUuZ2V0KCdmcmVxcycpO1xuICAgICAgdGhpcy5mcmVxcy5lYWNoKGZ1bmN0aW9uKGZyZXEpe1xuICAgICAgICBmcmVxLnNldCh7c2hvdzogZmFsc2V9KVxuICAgICAgfSlcbiAgICAgIGlmICghdGhpcy5mcmVxcy5sZW5ndGgpe1xuICAgICAgICB0aGlzLiRlbC5oaWRlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMuZnJlcXMsICdhZGQgcmVzZXQgcmVtb3ZlJywgdGhpcy5yZW5kZXIpXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOmxvY2F0aW9uJywgdGhpcy5yZW5kZXIpXG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOmxvY2F0aW9uJywgdGhpcy5saXN0ZW5Ub1Rvd2Vyc0FkZGl0aW9uKVxuICAgIH0sXG5cbiAgICBsaXN0ZW5Ub1Rvd2Vyc0FkZGl0aW9uOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRvd2VycyA9IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXRUb3dlcnMoKTtcbiAgICAgIHRoaXMubGlzdGVuVG8odG93ZXJzLCAnYWRkJywgdGhpcy5yZW5kZXIpXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLmZyZXFzLmxlbmd0aCl7XG4gICAgICAgIHRoaXMuJGVsLnNob3coKTtcbiAgICAgIH1cbiAgICAgIHZhciBmcmVxcyA9IHRoaXMuZnJlcXMuZmlsdGVyKF8uYmluZChmdW5jdGlvbihmcmVxKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzKGZyZXEpXG4gICAgICB9LCB0aGlzKSk7XG4gICAgICB0aGlzLnRlbXBsYXRlUHJvbWlzZS5kb25lKF8uYmluZChmdW5jdGlvbih0KXtcbiAgICAgICAgdmFyIGh0bWwgPSB0LmV4ZWN1dGUoe1xuICAgICAgICAgIGZyZXFzOiBmcmVxcyxcbiAgICAgICAgICBzaG93QWxsOiB0aGlzLnNob3dBbGwsXG4gICAgICAgICAgc2hvd1BvaW50czogc3RhdGUuZ2V0KCdzaG93UG9pbnRzJylcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGVsLmh0bWwoaHRtbClcbiAgICAgIH0sIHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBoYXM6IGZ1bmN0aW9uKGZyZXEpe1xuICAgICAgdmFyIHRvd2VycyA9IHN0YXRlLmdldCgnbG9jYXRpb24nKS5nZXRUb3dlcnMoKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3dlcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICB2YXIgdCA9IHRvd2Vycy5hdChpKTtcbiAgICAgICAgaWYgKHQuZ2V0KCdmcmVxJykgPT0gZnJlcS5nZXQoJ3ZhbHVlJykpe1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIG9uQ29sb3JDaGFuZ2U6IGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgIHZhciBmcmVxID0gJGVsLmRhdGEoJ2ZyZXEnKVxuICAgICAgdmFyIG1vZGVsID0gdGhpcy5mcmVxcy5maW5kV2hlcmUoe3ZhbHVlOmZyZXF9KVxuICAgICAgbW9kZWwuc2V0KCdjb2xvcicsICRlbC52YWwoKSlcbiAgICAgIG1vZGVsLnNhdmUoKVxuICAgICAgdGhpcy5mcmVxcy50cmlnZ2VyKCdjaGFuZ2UnLCBtb2RlbClcbiAgICB9LFxuXG4gICAgdG9nZ2xlQWxsOiBmdW5jdGlvbihzaG93KXtcbiAgICAgIHN0YXRlLnNldCgnc2hvd1BvaW50cycsIHNob3cpXG4gICAgICB0aGlzLnNob3dBbGwgPSBzaG93O1xuICAgICAgdGhpcy5mcmVxcy5lYWNoKGZ1bmN0aW9uKGZyZXEpe1xuICAgICAgICBmcmVxLnNldCh7c2hvdzpzaG93fSlcbiAgICAgIH0pO1xuICAgICAgdGhpcy4kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgc2hvdylcbiAgICB9XG5cbiAgfSk7XG5cblxufSgpKTtcbiIsInZhciBWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9WaWV3Jyk7XG52YXIgVGVtcGxhdGVzID0gcmVxdWlyZSgnbW9kZWxzL1RlbXBsYXRlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBWaWV3LmV4dGVuZCh7XG5cbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAucmVtb3ZlJzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5tb2RlbC5yZXZlcnQoKTtcbiAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBudWxsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgQmFja2JvbmUudHJpZ2dlcigndXBkYXRlOmxvY2F0aW9uJywgdGhpcy5tb2RlbCk7XG4gICAgICBWaWV3LnByb3RvdHlwZS5yZW1vdmUuYXBwbHkodGhpcylcbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICBfLmJpbmRBbGwodGhpcyk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5sb2NhdGlvbnMgPSBvcHRpb25zLmxvY2F0aW9ucztcbiAgICAgIHRoaXMudGVtcGxhdGUgPSBUZW1wbGF0ZXMuZ2V0KCdsb2NhdGlvbicpO1xuICAgIH0sXG5cbiAgICByZW5kZXJBc3luYzogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnRlbXBsYXRlLmRvbmUoXy5iaW5kKGZ1bmN0aW9uKHQpe1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICBuYW1lOiB0aGlzLm1vZGVsLmdldE5hbWUoKVxuICAgICAgICB9O1xuICAgICAgICB2YXIgaHRtbCA9IHQuZXhlY3V0ZShkYXRhKTtcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpXG4gICAgICAgIHRoaXMuYmluZEZpZWxkcygpO1xuICAgICAgICB0aGlzLmZvY3VzKCcubmFtZScpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH1cblxuICB9KVxuXG5cbn0oKSk7XG4iLCJ2YXIgTGlzdFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL0xpc3RWaWV3Jyk7XG52YXIgTG9jYXRpb24gPSByZXF1aXJlKCdtb2RlbHMvTG9jYXRpb24nKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGJvdHRvbSA9ICc8ZGl2IHJvbGU9XCJmb3JtXCIgc3R5bGU9XCIgaGVpZ2h0OiAzMHB4OyBcIj5cXFxuICAgICAgICAgICAgICA8bGFiZWw+0J/QvtC60LDQt9Cw0YLRjCDQs9GA0LDQvdC40YbRizwvbGFiZWw+XFxcbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2hvdy1sb2NhdGlvbnNcIiBjaGVja2VkPVwiY2hlY2tlZFwiIHN0eWxlPVwiIG1hcmdpbjo5cHggMCAwIDVweDtcIi8+XFxcbiAgICAgICAgICAgPC9kaXY+JztcblxuICByZXR1cm4gTGlzdFZpZXcuZXh0ZW5kKHtcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgXy5iaW5kQWxsKHRoaXMpO1xuICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgdGhpcy50ZW1wbGF0ZVAgPSBUZW1wbGF0ZXMuZ2V0KCdsb2NhdGlvbnMnKTtcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5jb2xsZWN0aW9uLCAnYWRkIHJlbW92ZSByZXNldCBjaGFuZ2UnLCB0aGlzLnJlbmRlckFzeW5jKTtcbiAgICB9LFxuXG4gICAgX2FmdGVyUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGFjdGl2ZSA9IHN0YXRlLmdldCgnbG9jYXRpb24nKVxuICAgICAgaWYgKGFjdGl2ZSA9PSB0aGlzLmN1cnJlbnQpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnQgPSBhY3RpdmU7XG4gICAgICBpZiAoYWN0aXZlKXtcbiAgICAgICAgdGhpcy4kZWwuZmluZCgnbGlbZGF0YS1jaWQ9XCInKyBhY3RpdmUuY2lkICsnXCJdJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcuc2hvdy1sb2NhdGlvbnMnKS5hdHRyKCdjaGVja2VkJywgc3RhdGUuZ2V0KCdzaG93TG9jYXRpb25zJykpXG4gICAgfSxcblxuICAgIF9nZXRUeXBlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuICdsb2NhdGlvbidcbiAgICB9LFxuXG4gICAgX2NyZWF0ZU1vZGVsIDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgTG9jYXRpb24oKTtcbiAgICB9LFxuXG4gICAgX3JlbW92ZU1zZzogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBcItCj0LTQsNC70LjRgtGMINC70L7QutCw0YbQuNGOP1wiXG4gICAgfSxcblxuICAgIF9jYW5SZW1vdmU6IGZ1bmN0aW9uKG1vZGVsKXtcbiAgICAgIHZhciBjYW5SZW1vdmUgPSAhbW9kZWwuZ2V0VG93ZXJzKCkgfHwgbW9kZWwuZ2V0VG93ZXJzKCkubGVuZ3RoID09IDA7XG4gICAgICBpZiAoIWNhblJlbW92ZSkgYWxlcnQoJ9Cn0YLQvtCx0Ysg0YPQtNCw0LvQuNGC0Ywg0LvQvtC60LDRhtC40Y4sINGB0L/QtdGA0LLQsCDQvdGD0LbQvdC+INGD0LTQsNC70LjRgtGMINCy0YHQtSDQstGL0YjQutC4LicpXG4gICAgICByZXR1cm4gY2FuUmVtb3ZlO1xuICAgIH1cblxuICB9KVxuXG5cbn0oKSk7XG4iLCJ2YXIgTGlzdFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL0xpc3RWaWV3Jyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCdtb2RlbHMvUG9pbnQnKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgcmV0dXJuIExpc3RWaWV3LmV4dGVuZCh7XG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgIF8uYmluZEFsbCh0aGlzKVxuICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgdGhpcy50ZW1wbGF0ZVAgPSBUZW1wbGF0ZXMuZ2V0KCdsaXN0Jyk7XG4gICAgICB0aGlzLmxpc3RlblRvKHN0YXRlLCAnY2hhbmdlOnRvd2VyJywgZnVuY3Rpb24oc3RhdGUsIHRvd2VyKXtcbiAgICAgICAgdGhpcy50b3dlciA9IHRvd2VyO1xuICAgICAgICBpZiAodG93ZXIuX2lzTmV3KCkpe1xuICAgICAgICAgIHRoaXMuJGVsLmhpZGUoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0Q29sbGVjdGlvbihzdGF0ZS5nZXQoJ3BvaW50cycpKVxuICAgICAgICAgIHRoaXMuJGVsLnNob3coKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKTtcbiAgICAgIHRoaXMubGlzdGVuVG8oc3RhdGUsICdjaGFuZ2U6bG9jYXRpb24nLCBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLiRlbC5oaWRlKClcbiAgICAgIH0sIHRoaXMpXG4gICAgfSxcblxuICAgIF9kYXRhOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRvd2VySWQgPSB0aGlzLnRvd2VyLmdldCgnaWQnKTtcbiAgICAgIHZhciBmaWx0ZXJlZCA9IHRoaXMuY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24oZWwpe1xuICAgICAgICByZXR1cm4gdG93ZXJJZCA9PSBlbC5nZXQoJ3Rvd2VySWQnKVxuICAgICAgfSk7XG4gICAgICB2YXIgbGlzdCA9IF8oZmlsdGVyZWQpLm1hcChmdW5jdGlvbihlbCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogZWwuZ2V0KCduYW1lJyksXG4gICAgICAgICAgY2lkOiBlbC5jaWRcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOnRoaXMubmFtZSxcbiAgICAgICAgbGlzdDogbGlzdC5fX3dyYXBwZWRfXyxcbiAgICAgICAgc29ydDogZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2FmdGVyUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy4kKCcubGlzdC1tb3JlJylcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgICAgICAgLmh0bWwoJzxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+PGxhYmVsIHRpdGxlPVwi0J3QsNC30LLQsNC90LjQtSDRgdC70LXQtNGD0YnQtdC5INGC0L7Rh9C60LhcIj7QndCw0LfQstCw0L3QuNC1PC9sYWJlbD48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInBvaW50LW5hbWVcIi8+PC9kaXY+JylcbiAgICAgIHZhciAkcG9pbnROYW1lID0gdGhpcy4kKCcucG9pbnQtbmFtZScpO1xuICAgICAgJHBvaW50TmFtZVxuICAgICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgUG9pbnQuc2V0TmFtZSgkKHRoaXMpLnZhbCgpKVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICBfZWRpdE1vZGVsOiBmdW5jdGlvbihtb2RlbCwgJGVsKXtcbiAgICAgIHZhciBsaSA9ICRlbC5wYXJlbnQoKTtcblxuICAgICAgdmFyICRpbnB1dCA9ICQoJzxpbnB1dCBjbGFzcz1cImVkaXQtcG9pbnQtbmFtZVwiIHR5cGU9XCJ0ZXh0XCIvPicpXG4gICAgICAkaW5wdXQudmFsKG1vZGVsLmdldCgnbmFtZScpKVxuICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgIHZhciAkb2sgPSAkKCc8c3BhbiBjbGFzcz1cIm9rIGdseXBoaWNvbiBnbHlwaGljb24tb2tcIiB0aXRsZT1cItCT0L7RgtC+0LLQvlwiPicpLmhpZGUoKVxuICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBtb2RlbC5zZXQoe1xuICAgICAgICAgICAgbmFtZTogJGlucHV0LnZhbCgpLFxuICAgICAgICAgICAgdG93ZXJJZDogJHNlbGVjdC52YWwoKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgbW9kZWwuc2F2ZSgpXG4gICAgICAgICAgc3RhdGUudHJpZ2dlcigncmVkcmF3OnBvaW50JywgbW9kZWwpXG4gICAgICAgICAgc2VsZi5fZmluaXNoRWRpdGluZyhtb2RlbCwgbGkpXG4gICAgICAgIH0pO1xuXG4gICAgICB2YXIgJGNhbmNlbCA9ICQoJzxzcGFuIGNsYXNzPVwiY2FuY2VsIGdseXBoaWNvbiBnbHlwaGljb24tcmVtb3ZlXCIgdGl0bGU9XCLQntGC0LzQtdC90LBcIj4nKS5oaWRlKClcbiAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgc2VsZi5fZmluaXNoRWRpdGluZyhtb2RlbCwgbGkpXG4gICAgICAgIH0pO1xuICAgICAgdmFyICRzZWxlY3QgPSAkKCc8c2VsZWN0IGlkPVwidG93ZXJTZWxlY3RcIiBjbGFzcz1cIlwiPjwvc2VsZWN0PicpXG4gICAgICBzdGF0ZS5nZXQoJ2xvY2F0aW9uJykuZ2V0VG93ZXJzKCkuZWFjaChmdW5jdGlvbih0KXtcbiAgICAgICAgJHNlbGVjdC5hcHBlbmQoJCgnPG9wdGlvbiB2YWx1ZT1cIicgKyB0LmdldCgnaWQnKSArICdcIj4nICsgdC5nZXQoJ25hbWUnKSArICc8L29wdGlvbj4nKSlcbiAgICAgIH0pXG4gICAgICAkc2VsZWN0LnZhbChtb2RlbC5nZXQoJ3Rvd2VySWQnKSlcbiAgICAgIGxpLmNoaWxkcmVuKCkucmVtb3ZlKClcbiAgICAgIHZhciBkaXYgPSAkKCc8ZGl2IGNsYXNzPVwid3JhcHBlclwiPicpXG4gICAgICBkaXYuYXBwZW5kKCRpbnB1dClcbiAgICAgIGRpdi5hcHBlbmQoJGNhbmNlbClcbiAgICAgIGRpdi5hcHBlbmQoJG9rKVxuICAgICAgbGkuYXBwZW5kKGRpdilcbiAgICAgIGxpLmFwcGVuZCgkc2VsZWN0KVxuICAgICAgJHNlbGVjdC5zZWxlY3QyKClcbiAgICB9LFxuXG4gICAgX2ZpbmlzaEVkaXRpbmc6IGZ1bmN0aW9uKG1vZGVsLCBsaSl7XG4gICAgICBtb2RlbC5jb2xsZWN0aW9uLnNvcnQoKVxuICAgICAgbGkucmVtb3ZlQ2xhc3MoJ3dyYXBwZXInKVxuICAgIH0sXG5cbiAgICBfZ2V0VHlwZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAncG9pbnQnXG4gICAgfSxcblxuICAgIF9jcmVhdGVNb2RlbCA6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdG93ZXIgPSBzdGF0ZS5nZXQoJ3Rvd2VyJyk7XG4gICAgICBpZiAoIXRvd2VyKXtcbiAgICAgICAgYWxlcnQoXCLQndC1INCy0YvQsdGA0LDQvdCwINCy0YvRiNC60LBcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdG93ZXIuaWQpe1xuICAgICAgICBhbGVydChcItCS0YvRiNC60LAg0L3QtSDRgdC+0YXRgNCw0L3QtdC90LAuINCf0L7Qv9GA0L7QsdGD0LnRgtC1INC10YnQtSDRgNCw0LcuXCIpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUG9pbnQoe1xuICAgICAgICB0b3dlcklkOiB0b3dlci5nZXQoJ2lkJyksXG4gICAgICAgIGxvY2F0aW9uSWQ6IHN0YXRlLmdldCgnbG9jYXRpb24nKS5pZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9yZW1vdmVNc2c6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gXCLQo9C00LDQu9C40YLRjCDRgtC+0YfQutGDP1wiXG4gICAgfVxuXG5cbiAgfSlcblxuXG59KCkpO1xuIiwidmFyIEZyZXEgPSByZXF1aXJlKCdtb2RlbHMvRnJlcScpO1xudmFyIFZpZXcgPSByZXF1aXJlKCd2aWV3cy9iYXNlL1ZpZXcnKTtcbnZhciBUZW1wbGF0ZXMgPSByZXF1aXJlKCdtb2RlbHMvVGVtcGxhdGVzJyk7XG52YXIgVG93ZXIgPSByZXF1aXJlKCdtb2RlbHMvVG93ZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICByZXR1cm4gVmlldy5leHRlbmQoe1xuXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLmJpbmQtY29sb3InOiAnYmluZENvbG9yJyxcbiAgICAgICdjbGljayAucmVtb3ZlJzogZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5tb2RlbC5yZXZlcnQoKTtcbiAgICAgICAgc3RhdGUuc2V0KCdlZGl0TW9kZWwnLCBudWxsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICBfLmJpbmRBbGwodGhpcyk7XG4gICAgICB0aGlzLmZyZXEgPSBudWxsO1xuICAgICAgdGhpcy5tb2RlbCA9IG9wdGlvbnMubW9kZWw7XG4gICAgICB0aGlzLnRlbXBsYXRlID0gVGVtcGxhdGVzLmdldCgndG93ZXInKTtcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2NoYW5nZTp0eXBlJywgdGhpcy5yZW5kZXJBc3luYylcbiAgICAgIHRoaXMubGlzdGVuVG8odGhpcy5tb2RlbCwgJ2JlZm9yZVNhdmUnLCB0aGlzLmJpbmRDb2xvcilcbiAgICB9LFxuXG4gICAgcmVuZGVyQXN5bmM6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZS5kb25lKF8uYmluZChmdW5jdGlvbih0KXtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgYW5nbGVzOiBUb3dlci5hbmdsZXNbdGhpcy5tb2RlbC5nZXQoJ3R5cGUnKV0sXG4gICAgICAgICAgbmFtZTogdGhpcy5tb2RlbC5nZXROYW1lKClcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGh0bWwgPSB0LmV4ZWN1dGUoZGF0YSlcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpXG4gICAgICAgIHRoaXMuYmluZEZpZWxkcygpO1xuICAgICAgICB0aGlzLmluaXRGcmVxQ29sb3IoKTtcbiAgICAgICAgdGhpcy5hZnRlclJlbmRlcigpO1xuICAgICAgICB0aGlzLmZvY3VzKCcubmFtZScpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLmJpbmRDb2xvcigpO1xuICAgICAgVmlldy5wcm90b3R5cGUucmVtb3ZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHR5cGVTZWxlY3QgPSB0aGlzLiQoJy50eXBlJyk7XG4gICAgICBpZiAoIXRoaXMubW9kZWwuICBpc05ldygpKXtcbiAgICAgICAgdHlwZVNlbGVjdC5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpXG4gICAgICB9XG4gICAgfSxcblxuICAgIGluaXRGcmVxQ29sb3I6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6Y29sb3InLCBmdW5jdGlvbihtb2RlbCwgY29sb3Ipe1xuICAgICAgICBpZiAoIW1vZGVsLmdldCgnZnJlcScpKSByZXR1cm47XG4gICAgICAgIHNlbGYuJCgnLmJpbmQtY29sb3InKS5zaG93KCk7XG4gICAgICB9KVxuICAgICAgdmFyICRjb2xvciA9IHRoaXMuJCgnLmNvbG9yJyk7XG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMubW9kZWwsICdjaGFuZ2U6ZnJlcScsIGZ1bmN0aW9uKG1vZGVsLCBmcmVxKXtcbiAgICAgICAgaWYgKCFmcmVxKXtcbiAgICAgICAgICBzZWxmLiQoJy5iaW5kLWNvbG9yJykuaGlkZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZi5mcmVxKXtcbiAgICAgICAgICBzZWxmLnN0b3BMaXN0ZW5pbmcoc2VsZi5mcmVxKVxuICAgICAgICB9XG4gICAgICAgIHZhciBmb3VuZCA9IHN0YXRlLmdldCgnZnJlcXMnKS5maW5kV2hlcmUoe3ZhbHVlOiBwYXJzZUZsb2F0KGZyZXEpfSk7XG4gICAgICAgIGlmIChmb3VuZCl7XG4gICAgICAgICAgc2VsZi5mcmVxID0gZm91bmQ7XG4gICAgICAgICAgc2VsZi5saXN0ZW5UbyhzZWxmLmZyZXEsICdjaGFuZ2U6Y29sb3InLCBmdW5jdGlvbihtLCBjb2xvcil7XG4gICAgICAgICAgICAkY29sb3IudmFsKGNvbG9yKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNlbGYubW9kZWwuc2V0KCdjb2xvcicsIGZvdW5kLmdldCgnY29sb3InKSlcbiAgICAgICAgICBzZWxmLiQoJy5jb2xvcicpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcbiAgICAgICAgICBzZWxmLiQoJy5iaW5kLWNvbG9yJykuaGlkZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuJCgnLmNvbG9yJykucmVtb3ZlQXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKVxuICAgICAgICAgIHNlbGYuJCgnLmJpbmQtY29sb3InKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGJpbmRDb2xvcjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLiQoJy5iaW5kLWNvbG9yJykuaXMoJzpoaWRkZW4nKSkgcmV0dXJuO1xuICAgICAgaWYgKHRoaXMuZnJlcSl7XG4gICAgICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLmZyZXEpXG4gICAgICB9XG4gICAgICB2YXIgdmFsdWUgPSBwYXJzZUZsb2F0KHRoaXMubW9kZWwuZ2V0KCdmcmVxJykpXG4gICAgICBpZiAoIXZhbHVlIHx8IHN0YXRlLmdldCgnZnJlcXMnKS5maW5kV2hlcmUoe3ZhbHVlOiB2YWx1ZX0pKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyICRjb2xvciA9IHRoaXMuJCgnLmNvbG9yJyk7XG4gICAgICB2YXIgZnJlcSA9IG5ldyBGcmVxKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBjb2xvcjogJGNvbG9yLnZhbCgpXG4gICAgICB9KVxuICAgICAgdGhpcy5mcmVxID0gZnJlcTtcbiAgICAgIHRoaXMubGlzdGVuVG8oZnJlcSwgJ2NoYW5nZTpjb2xvcicsIGZ1bmN0aW9uKG0sIGNvbG9yKXtcbiAgICAgICAgJGNvbG9yLnZhbChjb2xvcilcbiAgICAgIH0pO1xuICAgICAgc3RhdGUuZ2V0KCdmcmVxcycpLmFkZChmcmVxKTtcbiAgICAgIGZyZXEuc2F2ZSgpO1xuXG4gICAgICB0aGlzLiQoJy5iaW5kLWNvbG9yJykuaGlkZSgpO1xuICAgICAgJGNvbG9yLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcblxuICAgICAgY29uc29sZS5sb2coJ2JpbmQgY29sb3IgdG8gZnJlcSAnICsgZnJlcS5nZXQoJ3ZhbHVlJykpO1xuICAgIH0sXG5cblxuICAgIGdldEFuZ2xlOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuZmllbGRzLmFuZ2xlLmdldFZhbHVlKCk7XG4gICAgfSxcblxuICAgIHNldFZhbHVlOiBmdW5jdGlvbigkZWwsIGZpZWxkTmFtZSl7XG4gICAgICBpZiAoZmllbGROYW1lICE9ICdhbmdsZScpe1xuICAgICAgICB0aGlzW2ZpZWxkTmFtZV0uc2V0VmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gJ1Rvd2VyVmlldydcbiAgICB9XG5cbiAgfSlcblxuXG59KCkpO1xuIiwidmFyIExpc3RWaWV3ID0gcmVxdWlyZSgndmlld3MvYmFzZS9MaXN0VmlldycpO1xudmFyIFRlbXBsYXRlcyA9IHJlcXVpcmUoJ21vZGVscy9UZW1wbGF0ZXMnKTtcbnZhciBUb3dlciA9IHJlcXVpcmUoJ21vZGVscy9Ub3dlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuXG4gIHJldHVybiBMaXN0Vmlldy5leHRlbmQoe1xuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICBfLmJpbmRBbGwodGhpcylcbiAgICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgICAgIHRoaXMudGVtcGxhdGVQID0gVGVtcGxhdGVzLmdldCgnbGlzdCcpO1xuICAgICAgc3RhdGUub24oJ2NoYW5nZTpsb2NhdGlvbicsIF8uYmluZChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdG93ZXJzID0gc3RhdGUuZ2V0KCdsb2NhdGlvbicpLmdldFRvd2VycygpO1xuICAgICAgICB0aGlzLnNldENvbGxlY3Rpb24odG93ZXJzKVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICBfZ2V0VHlwZTogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAndG93ZXInXG4gICAgfSxcblxuICAgIF9jcmVhdGVNb2RlbCA6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoIXN0YXRlLmdldCgnbG9jYXRpb24nKSl7XG4gICAgICAgIGFsZXJ0KFwi0J3QtSDQstGL0LHRgNCw0L3QsCDQu9C+0LrQsNGG0LjRj1wiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCFzdGF0ZS5nZXQoJ2xvY2F0aW9uJykuaWQpe1xuICAgICAgICBhbGVydCgn0JvQvtC60LDRhtC40Y8g0LXRidC1INC90LUg0YHQvtGF0YDQsNC90LXQvdCwLiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3JylcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBUb3dlcih7XG4gICAgICAgIHR5cGU6J3Rvd2VyJywgLy8g0L/Qvi3Rg9C80L7Qu9GH0LDQvdC40Y4g0LLRi9GI0LrQsCAtINCx0YvQstCw0LXRgiDQtdGJ0LUg0YLQvtGH0LrQsC3RgtC+0YfQutCwXG4gICAgICAgIGxvY2F0aW9uSWQ6IHN0YXRlLmdldCgnbG9jYXRpb24nKS5pZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9yZW1vdmVNc2c6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gXCLQo9C00LDQu9C40YLRjCDQstGL0YjQutGDP1wiXG4gICAgfVxuXG5cbiAgfSlcblxuXG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICB2YXIgZ2VvID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4geW1hcHMuY29vcmRTeXN0ZW0uZ2VvO1xuICB9XG5cbiAgcmV0dXJuIHtcblxuICAgIGdldEF6aW11dGg6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuICAgICAgcmV0dXJuIHRoaXMuYXppbXV0aEZyb21EZWx0YShnZW8oKS5zb2x2ZUludmVyc2VQcm9ibGVtKHN0YXJ0LCBlbmQpLnN0YXJ0RGlyZWN0aW9uKTtcbiAgICB9LFxuXG4gICAgZ2V0RGlzdGFuY2U6IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpe1xuICAgICAgcmV0dXJuIGdlbygpLmdldERpc3RhbmNlKHN0YXJ0LCBlbmQpXG4gICAgfSxcblxuICAgIGVuZFBvaW50OmZ1bmN0aW9uKHN0YXJ0LCBhemltdXRoLCBkaXN0YW5jZSl7XG4gICAgICByZXR1cm4gZ2VvKCkuc29sdmVEaXJlY3RQcm9ibGVtKHN0YXJ0LCB0aGlzLmRlbHRhRnJvbUF6aW11dGgoYXppbXV0aCksIGRpc3RhbmNlKS5lbmRQb2ludDtcbiAgICB9LFxuXG4gICAgYXppbXV0aEZyb21EZWx0YTogZnVuY3Rpb24oZGVsdGEpe1xuICAgICAgcmV0dXJuIE1hdGguYXRhbjIoZGVsdGFbMF0sIGRlbHRhWzFdKVxuICAgIH0sXG5cbiAgICBkZWx0YUZyb21BemltdXRoOiBmdW5jdGlvbihhemltdXRoKXtcbiAgICAgIHdpdGggKE1hdGgpe1xuICAgICAgICB2YXIgZGVsdGEgPSBbc2luKGF6aW11dGgpLCBjb3MoYXppbXV0aCldXG4gICAgICB9XG4gICAgICByZXR1cm4gZGVsdGE7XG4gICAgfVxuXG4gIH1cblxufSgpKTtcbiIsInZhciBHZW8gPSByZXF1aXJlKCd2aWV3cy9tYXAvR2VvJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgdmFyIFNlY3RvciA9IGZ1bmN0aW9uKGNlbnRlciwgdG93ZXJBdHRycywgbWFwLCBvcHRzKXtcbiAgICB0aGlzLnJhdyA9IG9wdHMgJiYgb3B0cy5yYXc7XG4gICAgdGhpcy5jZW50ZXIgPSBjZW50ZXI7XG4gICAgdGhpcy5zZWN0b3IgPSB0aGlzLmF0dHJzID0gdG93ZXJBdHRycztcbiAgICB2YXIgYW5nbGUgPSBwYXJzZUFuZ2xlKHRoaXMuc2VjdG9yLmFuZ2xlKTtcbiAgICB0aGlzLmFuZ2xlID0gYW5nbGUucmFkO1xuICAgIHRoaXMuYW5nbGVTdGVwcyA9IGdldFN0ZXBzKHRoaXMuc2VjdG9yLnR5cGUsIGFuZ2xlLmRlZywgdGhpcy5yYXcpO1xuICAgIHRoaXMuZ3JhZGllbnRTdGVwcyA9IHRoaXMuc2VjdG9yLnR5cGUgPT0gJ2hpZ2h3YXknID8gMSA6IDE1O1xuICAgIHRoaXMubWFwID0gbWFwO1xuICAgIHRoaXMuZ2VvT2JqZWN0cyA9IG1hcC5nZW9PYmplY3RzO1xuICAgIHRoaXMudGV4dCA9IHRoaXMuc2VjdG9yLm5hbWUgKyAnPGJyPicgKyAodGhpcy5zZWN0b3IuY29tbWVudCA/IFwiIFwiICsgdGhpcy5zZWN0b3IuY29tbWVudCA6ICcnKTtcbiAgICB0aGlzLnBhcnRzID0gbmV3IHltYXBzLkdlb09iamVjdENvbGxlY3Rpb24oe30sIHtcbiAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICBpbnRlcmFjdGl2aXR5TW9kZWw6ICdkZWZhdWx0I3RyYW5zcGFyZW50J1xuICAgIH0pO1xuICAgIHRoaXMucGFydHMuZXZlbnRzLmFkZChbJ2NsaWNrJ10sIGZ1bmN0aW9uKGUpe1xuICAgICAgICB0aGlzLm9wZW5CYWxsb29uKCk7XG4gICAgfSwgdGhpcylcbiAgICB0aGlzLmJhc2UgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGdldFN0ZXBzKHR5cGUsIGFuZ2xlLCByYXcpe1xuICAgICAgaWYgKHR5cGUgPT0gJ2hpZ2h3YXknKXtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmF3ID8gMSA6IGFuZ2xlIC8gMzBcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkLmV4dGVuZChTZWN0b3IucHJvdG90eXBlLCB7XG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgICBpZiAoTWF0aC5QSSAtIHRoaXMuYW5nbGUgPCAwLjAxKXtcbiAgICAgICAgdGhpcy5yZW5kZXJDaXJjbGVUb3dlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW5kZXJTZWN0b3IoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5yYXcpe1xuICAgICAgICB0aGlzLnJlbmRlckJhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBvcGVuQmFsbG9vbjogZnVuY3Rpb24oKXtcbiAgICAgIGlmICh0aGlzLmJhc2UpIHRoaXMuYmFzZS5iYWxsb29uLm9wZW4oKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyQ2lyY2xlVG93ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGVuZ3RoU3RlcCA9IHRoaXMuZ2V0TGVuZ3RoU3RlcHMoKTtcbiAgICAgIHZhciBvcGFjaXR5ID0gNTtcbiAgICAgIHZhciB5Q29sb3IgPSB0aGlzLnNlY3Rvci5jb2xvciArIGRpZ2l0VG9MZXR0ZXIob3BhY2l0eSkgKyAnMCc7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IHRoaXMuZ3JhZGllbnRTdGVwczsgaSsrKXtcbiAgICAgICAgdmFyIHJhZGl1cyA9IGxlbmd0aFN0ZXAgKiBpO1xuICAgICAgICB2YXIgY2lyY2xlID0gbmV3IHltYXBzLkNpcmNsZShcbiAgICAgICAgICAgIFt0aGlzLmNlbnRlciwgcmFkaXVzXSxcbiAgICAgICAgICAgIHt9LCB7XG4gICAgICAgICAgICAgIGludGVyYWN0aXZpdHlNb2RlbDogJ2RlZmF1bHQjdHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6IHlDb2xvcixcbiAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IHlDb2xvcixcbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgICAgICAgIG9wYWNpdHk6IDAuOFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFydHMuYWRkKGNpcmNsZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmdlb09iamVjdHMuYWRkKHRoaXMucGFydHMpO1xuICAgIH0sXG5cbiAgICByZW5kZXJTZWN0b3I6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcHJldmlvdXMgPSBudWxsLC8vdHJpYW5nbGVcbiAgICAgICAgICBzZWN0b3IgPSB0aGlzLnNlY3RvcixcbiAgICAgICAgICBhemltdXRoID0gc2VjdG9yLmF6aW11dGgsXG4gICAgICAgICAgc3RhcnRBemltdXRoID0gYXppbXV0aCAtIHRoaXMuYW5nbGUsXG4gICAgICAgICAgYW5nbGVTdGVwID0gdGhpcy5hbmdsZSAvIHRoaXMuYW5nbGVTdGVwcyxcbiAgICAgICAgICBsZW5ndGhTdGVwID0gdGhpcy5nZXRMZW5ndGhTdGVwcygpLFxuXG4gICAgICAgICAgcGFydCA9IG51bGwsXG4gICAgICAgICAgYSwgYiwgYywgZDtcblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmFuZ2xlU3RlcHMgKiAyOyBqKyspe1xuXG4gICAgICAgIHByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgYXppbXV0aCA9IHN0YXJ0QXppbXV0aCArIGogKiBhbmdsZVN0ZXA7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gdGhpcy5ncmFkaWVudFN0ZXBzOyBpKyspe1xuICAgICAgICAgIGlmICghcHJldmlvdXMpe1xuICAgICAgICAgICAgYSA9IHRoaXMuY2VudGVyO1xuICAgICAgICAgICAgYiA9IEdlby5lbmRQb2ludChhLCBhemltdXRoLCBsZW5ndGhTdGVwKTtcbiAgICAgICAgICAgIGMgPSBHZW8uZW5kUG9pbnQoYSwgYXppbXV0aCArIGFuZ2xlU3RlcCwgbGVuZ3RoU3RlcCk7XG4gICAgICAgICAgICBwYXJ0ID0gdGhpcy5jcmVhdGVQb2x5Z29uKFthLCBiLCBjXSwgaSlcbiAgICAgICAgICAgIHRoaXMuZmlyc3QgPSBwYXJ0O1xuICAgICAgICAgICAgcHJldmlvdXMgPSBbYiwgY11cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhID0gcHJldmlvdXNbMF07XG4gICAgICAgICAgICBiID0gcHJldmlvdXNbMV07XG4gICAgICAgICAgICBjID0gR2VvLmVuZFBvaW50KGEsIGF6aW11dGgsIGxlbmd0aFN0ZXApO1xuICAgICAgICAgICAgZCA9IEdlby5lbmRQb2ludChiLCBhemltdXRoICsgYW5nbGVTdGVwLCBsZW5ndGhTdGVwKTtcbiAgICAgICAgICAgIHBhcnQgPSB0aGlzLmNyZWF0ZVBvbHlnb24oW2EsIGMsIGQsIGJdLCBpKVxuICAgICAgICAgICAgcHJldmlvdXMgPSBbYywgZF1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJ0cy5hZGQocGFydCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZ2VvT2JqZWN0cy5hZGQodGhpcy5wYXJ0cyk7XG4gICAgfSxcblxuICAgIGdldExlbmd0aFN0ZXBzOiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc2VjdG9yLnJhZGl1cyAvIHRoaXMuZ3JhZGllbnRTdGVwcztcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5wYXJ0cy5yZW1vdmVBbGwoKTtcbiAgICAgIGlmICh0aGlzLmJhc2Upe1xuICAgICAgICB0aGlzLmdlb09iamVjdHMucmVtb3ZlKHRoaXMuYmFzZSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlUG9seWdvbjogZnVuY3Rpb24ocG9pbnRzLHN0ZXApe1xuICAgICAgaWYgKHRoaXMuc2VjdG9yLmNvbG9yKXtcbiAgICAgICAgb3BhY2l0eSA9IDE2IC0gc3RlcCAqIDE1IC8gdGhpcy5ncmFkaWVudFN0ZXBzO1xuICAgICAgICB5Q29sb3IgPSB0aGlzLnNlY3Rvci5jb2xvciArIGRpZ2l0VG9MZXR0ZXIob3BhY2l0eSkgKyAnMCc7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2xvciA9ICcyNTUsMCwwLCdcbiAgICAgICAgdmFyIG9wYWNpdHkgPSAxLjIgLSBzdGVwIC8gdGhpcy5ncmFkaWVudFN0ZXBzO1xuICAgICAgICB2YXIgeUNvbG9yID0gJ3JnYignICArIGNvbG9yICsgb3BhY2l0eSArICcpJ1xuICAgICAgfVxuICAgICAgdmFyIHBvbHkgPSBuZXcgeW1hcHMuUG9seWdvbihbXG4gICAgICAgIHBvaW50cyxcbiAgICAgICAgW11cbiAgICAgIF0se30sIHtcbiAgICAgICAgaW50ZXJhY3Rpdml0eU1vZGVsOiAnZGVmYXVsdCN0cmFuc3BhcmVudCcsXG4gICAgICAgIGZpbGxDb2xvcjogeUNvbG9yLFxuICAgICAgICBzdHJva2VDb2xvcjogeUNvbG9yLFxuICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgb3BhY2l0eTogMC44XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHBvbHk7XG4gICAgfSxcblxuICAgIHJlbmRlckJhc2U6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgY2lyY2xlID0gbmV3IHltYXBzLkNpcmNsZShbdGhpcy5jZW50ZXIsIDFdLCB7XG4gICAgICAgIGJhbGxvb25Db250ZW50Qm9keTp0aGlzLnRleHRcbiAgICAgIH0sIHtcbiAgICAgICAgZmlsbDpmYWxzZSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6MFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNldEJhc2UoY2lyY2xlKTtcbiAgICB9LFxuXG4gICAgc2V0QmFzZTogZnVuY3Rpb24oY2lyY2xlKXtcbiAgICAgIHRoaXMuYmFzZSA9IGNpcmNsZTtcbiAgICAgIHRoaXMuZ2VvT2JqZWN0cy5hZGQoY2lyY2xlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGRpZ2l0VG9MZXR0ZXIoZCl7XG4gICAgaWYgKGQgPiAxNSB8fCBkIDwgMCl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnQgY29udmVydCB0byBoZXg6ICcgKyBkKVxuICAgIH1cbiAgICBzd2l0Y2ggKGQpe1xuICAgICAgY2FzZSAxMDogcmV0dXJuICdBJ1xuICAgICAgY2FzZSAxMTogcmV0dXJuICdCJ1xuICAgICAgY2FzZSAxMjogcmV0dXJuICdDJ1xuICAgICAgY2FzZSAxMzogcmV0dXJuICdEJ1xuICAgICAgY2FzZSAxNDogcmV0dXJuICdFJ1xuICAgICAgY2FzZSAxNTogcmV0dXJuICdGJ1xuICAgICAgZGVmYXVsdDogcmV0dXJuIGQ7XG4gICAgfVxuICB9XG5cblxuICBmdW5jdGlvbiBwYXJzZUFuZ2xlKHN0cil7XG4gICAgdmFyIGFuZ2xlUGF0dGVybiA9IC8oXFxkKykoW15cXGRdKikvO1xuICAgIGlmICghc3RyIHx8ICFfLmlzU3RyaW5nKHN0cikpe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFuZ2xlJylcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydCh2YWx1ZSwgdW5pdCl7XG4gICAgICBzd2l0Y2ggKHVuaXQpe1xuICAgICAgICBjYXNlIFwiwrBcIjpcbiAgICAgICAgICByZXR1cm4gdmFsdWUgKiBNYXRoLlBJIC8gMzYwXG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgcmV0dXJuIGxpbWl0KHZhbHVlICogTWF0aC5QSSAvIDM2MCAvIDYwKVxuICAgICAgICBjYXNlICcnOlxuICAgICAgICAgIHJldHVybiBsaW1pdCh2YWx1ZSAqIE1hdGguUEkgLyAzNjAgLyAzNjAwKVxuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pdCBub3QgZm91bmQgLSBcIiArIHVuaXQpXG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbnZlcnRUb0RlZ3JlZXModmFsdWUsIHVuaXQpe1xuICAgICAgaWYgKHVuaXQgPT0gJ8KwJyl7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBzdHIucmVwbGFjZShhbmdsZVBhdHRlcm4sIGZ1bmN0aW9uKG0sIHZhbHVlLCB1bml0KXtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgcmFkOiBjb252ZXJ0KHZhbHVlLCB1bml0KSxcbiAgICAgICAgZGVnOiBjb252ZXJ0VG9EZWdyZWVzKHZhbHVlLCB1bml0KVxuICAgICAgfTtcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsaW1pdChhbmdsZSl7XG4gICAgaWYgKGFuZ2xlIDwgMC4wMDMpIHJldHVybiAwLjAwMztcbiAgICBlbHNlIHJldHVybiBhbmdsZTtcbiAgfVxuXG4gIHJldHVybiBTZWN0b3I7XG5cblxufSgpKTtcbiJdfQ==
