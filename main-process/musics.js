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
    error: [],
    missingData: []
  },

  received: {
    list: {},
    export: []
  },

  progress:{
    analyze: {
      value: 0,
      max: 1
    },
    download: {
      value: 0,
      max: 1
    }
  },

  services: {
    internet: "up",
    lastFm: "up"
  },

  ipcValue:{
    select: null,
    preview: null
  },

  coversTemp: path.join(assets.temp,"covers"),

  ini: () => {
    let ffmetadataPath = path.resolve(__dirname,"../node_modules/ffmetadata/index.js")
    log(`Initialisation: adresse ffmetadata: ${ffmetadataPath}`)
    fs.readFile(ffmetadataPath, 'utf-8', function(err, data){
      if (err) throw err;
      var newData = data.replace('ffmpeg = spawn.bind(null, process.env.FFMPEG_PATH || "ffmpeg"),', `ffmpeg = spawn.bind(null, "./resources/ffmpeg"),`);
      fs.writeFile(ffmetadataPath, newData, 'utf-8', function (err) {
        if (err) throw err;
        log("Ecriture ffmetadata complète.")
        ffmetadata = require('ffmetadata')
      })
    })
    assets.createFolder(musics.coversTemp)
    log("Fin de l'initialisation.")
  },

  analyze: {
    directory: (dir) => {
      musics.received.list[dir] = glob.sync(path.join(dir,'/**/@(*.mp3)'))
      log(`Analyse de ${dir}`)
      log(`Les musiques trouvées sont: ${musics.received.list[dir].join('\n')}`)

    },
    musics: (list) => {
      musics.progress.download.value = 0
      musics.progress.download.max = 0
      musics.progress.analyze.value = 0
      musics.progress.analyze.max = list.length
      log(`Analyse de ${list.length} musiques: ${list.join('\n')}`)
      musics.index.list = {}
      musics.index.error = []
      musics.index.missingData = []
      list.forEach((file)=>{
        ffmetadata.read(file, (err, data) => {
          if (err) {
            log(`Impossible de lire les données de ${file}: ${err}`, 2)
            musics.index.error.push(file)
            musics.progress.analyze.value++
          }
          else if(data.album_artist===undefined||data.album===undefined||data.track===undefined||data.title===undefined){
            log(`Manque de données pour ${file}`, 1)
            musics.index.missingData.push(file)
            musics.progress.analyze.value++
          }
          else {
            log(`Musique analysée: ${data.album_artist}/ ${data.album}/ ${data.title} // ${file}`)
  
            if (!Object.keys(musics.index.list).includes(data.album_artist)) {
              musics.index.list[data.album_artist] = {}
              musics.index.list[data.album_artist].albums = {}
              if (musics.services.internet === "up"){
                musics.request.artist.lastFm(data.album_artist)
              }
              else {
                musics.request.artist.default(data.album_artist)
              }
            }
            if (!Object.keys(musics.index.list[data.album_artist].albums).includes(data.album)) {
              musics.index.list[data.album_artist].albums[data.album] = {}
              let coverPath = path.join(musics.coversTemp, data.album_artist)
              assets.createFolder(coverPath)
              ffmetadata.read(file, {coverPath: [path.join(coverPath,`${data.album}.jpg`)]}, (err) => {
                if (err) {
                  console.error('Error writing cover art')
                  log(`Pochette (${data.album}): ${err}`, 1)
                  if (musics.services.internet === "up"){
                    musics.request.album.lastFm(data.album_artist, data.album)
                  }
                  else {
                    musics.request.album.default(data.album_artist, data.album)
                  }
                } else console.log('Cover art added')
                log(`Pochette ajoutée: ${data.album}`)
              })
              
            }
            musics.index.list[data.album_artist].albums[data.album][data.track] = {}
            musics.index.list[data.album_artist].albums[data.album][data.track].title = data.title
            musics.index.list[data.album_artist].albums[data.album][data.track].path = file
            musics.progress.analyze.value++
            log(`Avancée de l'analyse: ${musics.progress.analyze.value}/${list.length} : ${data.album_artist}/ ${data.album}/ ${data.title} // ${file}`)
            musics.ipcValue.select.sender.send("select-progress-analyze", musics.progress.analyze.value, musics.progress.analyze.max)
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
                    log("Erreur LastFm, requête par défaut.",3)
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
            musics.progress.download.max++
            assets.download(data.images[data.images.length - 1], path.join(musics.coversTemp,`${artist}.jpg`), () =>{
              musics.progress.download.value++
              log(`Téléchargement ${musics.progress.download.value}/${musics.progress.download.max}`)
              musics.ipcValue.select.sender.send("select-progress-download", musics.progress.download.value, musics.progress.download.max)
              if(musics.progress.download.value === musics.progress.download.max){
                musics.done()
              }
            })
          }
        })
      },
      default: (artist) => {
        let rand = assets.getRandomInt(1, 3)
        log(`Requête par défaut: ${artist}`)
        musics.index.list[artist].summary = "Pas de biographie disponible."
        musics.index.list[artist].similar = ["Pas d'artistes similaires disponibles."]
        musics.index.list[artist].tags = ["Pas de genres disponibles."]
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
                    log("Erreur LastFm, requête par défaut.",3)
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
            musics.progress.download.max++
            assets.download(data.images[data.images.length - 1], path.join(musics.coversTemp,artist,`${album}.jpg`), () => {
              musics.progress.download.value++
              log(`Téléchargement ${musics.progress.download.value}/${musics.progress.download.max}`)
              musics.ipcValue.select.sender.send("select-progress-download", musics.progress.download.value, musics.progress.download.max)
              if(musics.progress.download.value === musics.progress.download.max){
                musics.done()
              }
            })
          }
        })
      },
      default: (artist, album) => {
        let rand = assets.getRandomInt(1, 5)
        log(`Requête par défaut: ${artist}/${album}`)
        assets.copy(path.resolve(__dirname,`../assets/images/default-album${rand}.jpg`), path.join(musics.coversTemp,artist,`${album}.jpg`))
      }
    }
  },
  done: () => {
    musics.ipcValue.select.sender.send("select-done")
    musics.ipcValue.preview.sender.send("preview-display", musics.index, assets.temp)
  }
}

musics.ini()

ipc.on("select-upload", (event, dir) =>{
  if (fs.statSync(dir).isDirectory()){
    log(`Sélection du dossier: ${dir}`)
    musics.analyze.directory(dir)
    event.sender.send("select-callback", dir, musics.received.list[dir].length)
  }
  else if (/\.mp3$/.test(dir)){
    log(`Sélection de la musique: ${dir}`)
    musics.received.list[dir] = dir
    event.sender.send("select-callback", dir, 1)
  }
  else{
    log("La sélection n'est pas valide.")
  }
})

ipc.on("select-file-dialog", (event, args) => {
  if (args === "directory"){
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function (files) {
      if (files) {
        let dir = files[0]
        log(`Dialogue: Sélection de dossier: ${dir}`)
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
        log(`Dialogue: Sélection d'une musique': ${dir}`)
        musics.received.list[dir] = dir
        event.sender.send('select-callback', dir, 1)
      }
    })
  }
})

ipc.on("select-remove", (event, id) => {
  log(`Retrait de ${id}`)
  delete musics.received.list[id]
})

ipc.on("select-analyze", (event) => {
  log("Début de l'analyse totale.")
  musics.ipcValue.select = event
  musics.received.export = []
  for (var currentDir in musics.received.list){
    musics.received.list[currentDir].forEach((file) => {
      musics.received.export.push(file)
    })
  }
  assets.checkInternet((internet) => {
    if (internet) {
      log("Connexion internet.")
      musics.analyze.musics(musics.received.export)
    } else {
      musics.services.internet = "down"
      musics.analyze.musics(musics.received.export)
      event.sender.send('select-no-internet')
      log("Pas de connexion internet.")
    }
  });
})

ipc.on("select-continue", (event) => {
  musics.done()
})

ipc.on("preview-save", (event) =>{
  dialog.showOpenDialog({
    title: 'Exporter les musiques',
    properties: ['openDirectory']
  }, function (files) {
    let dir = files[0]
    event.sender.send('preview-save', dir)
    console.log(dir)
  })
})


ipc.on("ipc-preview", (event) => {
  musics.ipcValue.preview = event
})

function log (args, level) {
	logging.write(__filename, args, level)
}
