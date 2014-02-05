

create = function(name, sector, freq){

  var obj = {
    name: name,
    frequency: freq,
    sector:sector
  }

  $.ajax('/towers?' + $.param({tower:obj}), {
    type: 'POST'
  })
}

edit = function(id, name, angle, freq){

  var obj = {
    id: id,
    name: name,
    angle: angle,
    freq: freq,
    center: {
      latitude:6,
      longitude:6
    }
  }

  $.ajax('/towers?' + $.param({tower:obj}), {
    type: 'PUT'
  })
}

remove = function(id){

  $.ajax('/towers?' + $.param({tower:{id:id}}), {
    type: 'DELETE'
  })
}





