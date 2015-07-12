
dest = 'build'
cssDest  = dest + '/css'
jsDest  = dest + '/js'

module.exports =

  scripts: 
    entries   : ['./client/views/Router.js']
    dest: jsDest
    bundleName: 'app.js'
    sourcemap : true

  styles:
    main:
      src: 'css/**/*.less'
      dest: cssDest
      name: 'app.css'

    login:
      src: 'css/login/*.css'
      name: 'login.css'
      dest: cssDest

  vendor:
    css:
      src: 'css/vendor/*.css'
      dest: cssDest
      name: 'vendor.css'

    images:
      src: 'css/vendor/!(*.css|*.less)'
      dest: cssDest + '/vendor'

    scripts:
      src: 'client/vendor/*.js'
      dest: jsDest
      name: 'vendor.js'