process.env.VUE_APP_NAME = require('./package.json').name || 'vue'

module.exports = {
    // options...
    devServer: {
        disableHostCheck: true
    }
}