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
