const os = require('os')
const https = require('https')
const fs = require('fs')
const glob = require('glob')
const LastFM = require('last-fm')
const electron = require('electron')
const {dialog, app} = require('electron')
const lastfm = new LastFM('e01234609d70b34055b389734707ac0a', { userAgent: 'MyApp/1.0.0 (http://example.com)' })

const temp = `${os.tmpdir()}\\${electron.app.getName()}-${electron.app.getVersion()}`

module.exports = {
  artist: function (artist) {
    lastfm.artistInfo({ name: artist }, (err, data) => {
      if (err) console.error(err)
      else {
        console.log('data')
        download(data.images[data.images.length - 1], `${temp}\\${artist}.png`)
      }
    })
  },
  track: function (track) {
    lastfm.trackSearch({ q: track }, (err, data) => {
      if (err) console.error(err)
      else console.log(data)
    })
  }
}

var download = function (url, dest) {
  var file = fs.createWriteStream(dest)
  var request = https.get(url, function (response) {
    response.pipe(file)
    file.on('finish', function () {
      file.close()
    })
  })
}
