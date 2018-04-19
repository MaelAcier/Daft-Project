const fs = require('fs')
const https = require('https')
const ipc = require('electron').ipcMain
const package = require('../package.json')
const logging = require('./logging.js')

ipc.on('get-info', (event) => {
    console.log('get-info')
    event.sender.send('get-info', package.productName, package.version, package.description, package.author)
})

module.exports = {
    checkInternet: (result) => {
        require('dns').lookup('google.com',function(err) {
            if (err && err.code == "ENOTFOUND") {
              console.log(err)
                result(false);
            } else {
                result(true);
            }
        })
    },
    download: (url, dest, callback) => {
        var file = fs.createWriteStream(dest)
        log(`Téléchargement: ${url} vers ${dest}`)
        https.get(url, (response) => {
          response.pipe(file)
          file.on('finish', () => {
            file.close()
            callback()
          })
        })
    }
};

function log (args, level) {
    logging.write(__filename, args, level)
}
