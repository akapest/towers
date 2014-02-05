/**
 * require()
 */
(function(){

  var geo;

  ymaps.ready(function(){
    geo = ymaps.coordSystem.geo;
  });

  window.Geo = {

    getAzimuth: function(start, end){
      return Geo.azimuthFromDelta(geo.solveInverseProblem(start, end).startDirection);
    },

    getDistance: function(start, end){
      return geo.getDistance(start, end)
    },

    endPoint:function(start, azimuth, distance){
      return geo.solveDirectProblem(start, Geo.deltaFromAzimuth(azimuth), distance).endPoint;
    },

    azimuthFromDelta: function(delta){
      return Math.atan2(delta[0], delta[1])
    },

    deltaFromAzimuth: function(azimuth){
      with (Math){
        var delta = [sin(azimuth), cos(azimuth)]
      }
      return delta;
    },

  }

}());
