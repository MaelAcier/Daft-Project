const LastFM = require('last-fm')
const glob = require('glob');
const ipc = require('electron').ipcMain;
const lastfm = new LastFM('e01234609d70b34055b389734707ac0a', { userAgent: 'MyApp/1.0.0 (http://example.com)' })

/*lastfm.trackSearch({ q: 'Safe and Sound' }, (err, data) => {
  if (err) console.error(err)
  else console.log(data)
})*/

lastfm.artistInfo({ name: 'Daft Punk' }, (err, data) => {
  if (err) console.error(err)
  else console.log(data)
})