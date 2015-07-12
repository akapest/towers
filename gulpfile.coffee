requireDir = require 'require-dir'

#
# thx to https://github.com/greypants/gulp-starter
#

console.log('~~~~~~~~~~~~~~~~Starting gulp...~~~~~~~~~~~~~~~')
console.log('NODE_ENV: ', process.env.NODE_ENV || 'undefined')

global.isProd = process.env.NODE_ENV == 'production'
console.log('Set up global.isProd to ', global.isProd)

# Require all tasks in gulp, including subfolders
requireDir('./gulp/tasks', { recurse: true });
