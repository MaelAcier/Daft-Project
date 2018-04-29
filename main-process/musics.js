const fs = require('fs')
const path = require('path')
const glob = require('glob')
const LastFM = require('last-fm')
const dialog = require('electron').dialog
const ipc = require('electron').ipcMain
const logging = require('./logging.js')
const assets = require('./assets.js')
var ffmetadata

const lastfm = new LastFM('e01234609d70b34055b389734707ac0a')

var musics = {
  index: {
    list: {},
    error: {},
    missingData: {}
  },

  received: {
    list: {},
    export: []
  },

  services: {
    lastFm: "up"
  },

  coversTemp: path.join(assets.temp,"covers"),

  ini: () => {
    let ffmetadataPath = path.resolve(__dirname,"../node_modules/ffmetadata/index.js")
    fs.readFile(ffmetadataPath, 'utf-8', function(err, data){
      if (err) throw err;
      console.log(typeof(data)); // string
      var newData = data.replace('ffmpeg = spawn.bind(null, process.env.FFMPEG_PATH || "ffmpeg"),', `ffmpeg = spawn.bind(null, "./resources/ffmpeg"),`);
      fs.writeFile(ffmetadataPath, newData, 'utf-8', function (err) {
        if (err) throw err;
        console.log('filelistAsync complete');
        ffmetadata = require('ffmetadata')
      })
    })
    assets.createFolder(musics.coversTemp)
  },

  analyze: {
    directory: (dir) => {
      musics.received.list[dir] = glob.sync(path.join(dir,'/**/@(*.mp3)'))
      console.log(musics.received.list)
    },
    musics: (list) => {
      musics.index.list = {}
      list.forEach((file)=>{
        ffmetadata.read(file, (err, data) => {
          if (err) {
            log(`Impossible de lire les données de ${file}: ${err}`, 2)
            index.error.push(file)
          }
          else if(data.album_artist===undefined||data.album===undefined||data.track===undefined||data.title===undefined){
            log(`Manque de données pour ${file}`, 1)
            index.missingData.push(file)
          }
          else {
            log(`Musique analysée: ${data.album_artist}/ ${data.album}/ ${data.title}`)
  
            if (!Object.keys(musics.index.list).includes(data.album_artist)) {
              musics.index.list[data.album_artist] = {}
              musics.index.list[data.album_artist].albums = {}
              musics.request.artist.lastFm(data.album_artist)
            }
            if (!Object.keys(musics.index.list[data.album_artist].albums).includes(data.album)) {
              musics.index.list[data.album_artist].albums[data.album] = {}
              let coverPath = path.join(musics.coversTemp, data.album_artist)
              assets.createFolder(coverPath)
              ffmetadata.read(file, {coverPath: [path.join(coverPath,`${data.album}.jpg`)]}, (err) => {
                if (err) {
                  console.error('Error writing cover art')
                  log(`Pochette (${data.album}): ${err}`, 1)
                  musics.request.album.lastFm(data.album_artist, data.album)
                } else console.log('Cover art added')
                log(`Pochette ajoutée: ${data.album}`)
              })
              
            }
            musics.index.list[data.album_artist].albums[data.album][data.track] = {}
            musics.index.list[data.album_artist].albums[data.album][data.track].title = data.title
            musics.index.list[data.album_artist].albums[data.album][data.track].path = file
            console.log(JSON.stringify(musics.index.list))
          }
        })
      })
    }
  },

  request: {
    artist: {
      lastFm: (artist) => {
        lastfm.artistInfo({ name: artist }, (err, data) => {
          if (err) {
            log(`Lastfm: ${err}`, 2)
            if (err.code === "ENOENT" && err.hostname === "ws.audioscrobbler.com" && err.port === 443 && musics.services.lastFm === "up"){
              dialog.showMessageBox({
                type: 'info',
                title: 'Récupération de données',
                message: "ws.audioscrobbler.com:443 est inaccessible.",
                buttons: ['Continuer avec un autre service', 'Abandonner']
                }, (index) => {
                  if (index === 0){
                    console.log("autre service")
                  }
                  else {
                    musics.services.lastFm = "down"
                    musics.request.artist.default(artist)
                  }
                }
              )
            }
            else if (musics.services.lastFm === "down"){
              musics.request.artist.default(artist)
            }
          } 
          else {
            log(`Requête LastFm: ${artist}`)
            musics.index.list[artist].summary = data.summary
            musics.index.list[artist].similar = []
            for (similarArtist in data.similar){
              musics.index.list[artist].similar.push(data.similar[similarArtist].name)
            }
            musics.index.list[artist].tags = data.tags
            assets.download(data.images[data.images.length - 1], path.join(musics.coversTemp,`${artist}.jpg`), () =>{
              console.log("downloaded.")
            })
          }
        })
      },
      default: (artist) => {
        let rand = assets.getRandomInt(1, 3)
        assets.copy(path.resolve(__dirname,`../assets/images/default-artist${rand}.jpg`), path.join(musics.coversTemp,`${artist}.jpg`))
      }
    },
    album: {
      lastFm: (artist, album) => {
        lastfm.albumInfo({name: album, artistName: artist}, (err, data) => {
          if (err) {
            log(`Lastfm: ${err}`, 2)
            if (err.code === "ENOENT" && err.hostname === "ws.audioscrobbler.com" && err.port === 443 && musics.services.lastFm === "up"){
              dialog.showMessageBox({
                type: 'info',
                title: 'Récupération de données',
                message: "ws.audioscrobbler.com:443 est inaccessible.",
                buttons: ['Continuer avec un autre service', 'Abandonner']
                }, (index) => {
                  if (index === 0){
                    console.log("autre service")
                  }
                  else {
                    musics.services.lastFm = "down"
                    musics.request.album.default(artist, album)
                  }
                }
              )
            }
          }
          else if (musics.services.lastFm === "down"){
            musics.request.album.default(artist, album)
          }
          else {
            log(`Requête: ${album} / ${artist}`)
            assets.download(data.images[data.images.length - 1], path.join(musics.coversTemp,artist,`${album}.jpg`), () => {
              console.log("downloaded.")
            })
          }
        })
      },
      default: (artist, album) => {
        let rand = assets.getRandomInt(1, 5)
        console.log("default")
        assets.copy(path.resolve(__dirname,`../assets/images/default-album${rand}.jpg`), path.join(musics.coversTemp,artist,`${album}.jpg`))
      }
    }
  }
}

musics.ini()

ipc.on("select-upload", (event, dir) =>{
  if (fs.statSync(dir).isDirectory()){
    console.log(dir,"is a directory!")
    musics.analyze.directory(dir)
    event.sender.send("select-callback", dir, musics.received.list[dir].length)
  }
  else if (/\.mp3$/.test(dir)){
    console.log(dir,"is a music!")
    musics.received.list[dir] = dir
    event.sender.send("select-callback", dir, 1)
  }
  else{
    console.log(dir,"is not a music and a folder.")
  }
})

ipc.on("select-file-dialog", (event, args) => {
  if (args === "directory"){
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    }, function (files) {
      if (files) {
        let dir = files[0]
        console.log(dir)
        musics.analyze.directory(dir)
        event.sender.send('select-callback', dir, musics.received.list[dir].length)
      }
    })
  }
  else if (args === "file"){
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'Musiques', extensions: ['mp3']}
      ]
    }, function (files) {
      if (files) {
        let dir = files[0]
        console.log(dir)
        musics.received.list[dir] = dir
        event.sender.send('select-callback', dir, 1)
      }
    })
  }
})

ipc.on("select-remove", (event, id) => {
  console.log(id)
  delete musics.received.list[id]
  console.log(musics.received.list)
})

/*setTimeout(()=>{
  musics.analyze.musics(["D:\\Maël\\Documents\\GitHub\\Daft-Project\\music_samples\\By Your Side\\1 - Break Of Dawn.mp3"])
}, 5000)*/

function log (args, level) {
	logging.write(__filename, args, level)
}
