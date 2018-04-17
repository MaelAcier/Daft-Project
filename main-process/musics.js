const os = require('os')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const https = require('https')
const LastFM = require('last-fm')
const ffmetadata = require('ffmetadata')
const electron = require('electron')
const ipc = require('electron').ipcMain
const {dialog} = require('electron')
const logging = require('./logging.js')

const lastfm = new LastFM('e01234609d70b34055b389734707ac0a')
const temp = path.join(os.tmpdir(),`${electron.app.getName()}-${electron.app.getVersion()}`)

var directory = {},
  musicsList = []
  index = {},
  error = [],
  summary = {},
  loading = 0,
  downloadAdvancement = 0,
  downloadProgress = 0,
  ipcLoading = null,
  ipcPreview = null,
  exportFolder = path.resolve(__dirname,"../")

Log(`Répertoire temporaire: ${temp}`)
createFolder(temp)
const coverPATH = path.join(temp,'covers')
createFolder(coverPATH)

console.log('tmp', temp)


ipc.on('open-file-dialog', (event, args) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) {
      let selectedFolder = files[0]
      Log(`Répertoire musical: ${selectedFolder}`)
      if (args === 'select') {
        Log(`Sélection unique.`)
        directory = {}
      }
      analyzeDirectory(selectedFolder)
      let number = directory[selectedFolder].length
      Log(`Il y a ${number} musiques`)
      event.sender.send('selected-directory', selectedFolder, number)
    }
  })
})

ipc.on('remove-dir', (event, args) => {
  if (args!==undefined) directory[args] = []
  else directory = {}
})

ipc.on('loading', (event) => {
  ipcLoading = event
  musicsList = []
  for (var currentDir in directory){
    directory[currentDir].forEach((file) => {
      musicsList.push(file)
    })
  }
  analyzeMusics(musicsList)
  Log(`Analyse des musiques`)
})

ipc.on('submit', (event) => {
  exportMusics(exportFolder)
  Log(`Export des musiques vers ${exportFolder}`)
})

ipc.on('show-data', (event) => {
  ipcPreview.sender.send('show-data', index, temp, summary, exportFolder)
})

ipc.on('preview-ready', (event) => {
  ipcPreview = event
})

ipc.on('export-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) {
      let selectedFolder = files[0]
      exportFolder = selectedFolder
      event.sender.send('export-dialog', selectedFolder)
    }
  })
})

function analyzeDirectory (dir) {
  directory[dir] = glob.sync(path.join(dir,'/**/@(*.mp3|*.wav)'))
  Log(`Liste des fichiers: ${directory/*.join('\n')*/}`)
}

function artistRequest (artist) {
  lastfm.artistInfo({ name: artist }, (err, data) => {
    if (err) Log(`Lastfm: ${err}`, 2)
    else {
      console.log('data')
      Log(`Requête: ${artist}`)
      summary[artist]={}
      summary[artist].summary = data.summary
      summary[artist].similar = []
      for (similarArtist in data.similar){
        summary[artist].similar.push(data.similar[similarArtist].name)
      }
      summary[artist].tags = data.tags
      download(data.images[data.images.length - 1], path.join(temp,'covers',`${artist}.jpg`))
    }
  })
}

function albumRequest (album, artist) {
  lastfm.albumInfo({name: album, artistName: artist}, (err, data) => {
    if (err) Log(`Lastfm: ${err}`, 2)
    else {
      Log(`Requête: ${album} / ${artist}`)
      download(data.images[data.images.length - 1], path.join(temp,'covers',artist,`${album}.jpg`))
    }
  })
}

function analyzeMusics (list) {
  index = {}
  var advancement = 0
  downloadAdvancement = 0
  downloadProgress = 0
  list.forEach((file) => {
    ffmetadata.read(file, (err, data) => {
      if (err) {
        console.error('Error reading metadata', err)
        Log(`Lecture des metadata: ${err} pour ${file}`, 2)
        error.push(file)
      } else {
        if (!Object.keys(index).includes(data.album_artist)) {
          index[data.album_artist] = {}
          downloadAdvancement++
          artistRequest(data.album_artist)
        }
        if (!Object.keys(index[data.album_artist]).includes(data.album)) {
          index[data.album_artist][data.album] = {}

          let coverpath = path.join(temp,'covers', data.album_artist)
          createFolder(coverpath)
          ffmetadata.read(file, {coverPath: [path.join(coverpath,`${data.album}.jpg`)]}, (err) => {
            if (err) {
              console.error('Error writing cover art')
              Log(`Pochette (${data.album}): ${err}`, 1)
              downloadAdvancement++
              albumRequest(data.album, data.album_artist)
            } else console.log('Cover art added')
            Log(`Pochette ajoutée: ${data.album}`)
          })
        }
        index[data.album_artist][data.album][data.track] = {}
        index[data.album_artist][data.album][data.track].title = data.title
        index[data.album_artist][data.album][data.track].path = file
        advancement++
        loading = Math.round(advancement * 100 / musicsList.length)
        console.log(`${loading}%`)
        Log(`Avancement de l'analyse: ${loading}%`)
        ipcLoading.sender.send('loading', loading, Math.round(downloadProgress * 100 / downloadAdvancement))
      }
    })
  })
}

function exportMusics (dir) {
  console.log(summary)
  var newDir = path.join(dir,'output-')
  var artistNumber = 0,
    trackNumber = 0,
    artistDir,
    trackDir
  newDir = fs.mkdtempSync(newDir)
  Log(`Dossier de sortie: ${newDir}`)
  var indexStream = fs.createWriteStream(path.join(newDir,`index.txt`), {flags: 'a', autoClose: true})// 'a' means appending (old data will be preserved
  for (var artist in index) {
    artistNumber++
    trackNumber = 0
    artistDir = digits(artistNumber)
    createFolder(path.join(newDir,artistDir))
    indexStream.write(`${artist}\n`)
    indexStream.write(`\\${artistDir}\n`)
    for (var album in index[artist]) {
      indexStream.write(`\t${album}\n`)
      for (var track in index[artist][album]) {
        trackNumber++
        trackDir = digits100(trackNumber)
        copy(index[artist][album][track].path, path.join(newDir, artistDir, `${trackDir}.mp3`))
        indexStream.write(`\t\t${index[artist][album][track].title}\n`)
        indexStream.write(`\t\t\\${trackDir}\n`)
      }
    }
  }

  var listCovers = glob.sync(path.join(temp,'covers','/**'))
  listCovers.forEach(function(file) {
    var stat = fs.statSync(file);
    if (stat.isDirectory()) {
      Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
      };
      let folderToCreate = file.split('/')
      folderToCreate = folderToCreate.diff(temp.split('\\'))
      folderToCreate = folderToCreate.join('\\')
      createFolder(path.join(newDir,folderToCreate))
    }
    else{
      let fileToCreate = file.split('/')
      fileToCreate = fileToCreate.diff(temp.split('\\'))
      fileToCreate = fileToCreate.join('\\')
      copy(file,path.join(newDir,fileToCreate))
    }
});
}

function digits (n) {
  return (n < 10 ? '0' : '') + n
}
function digits100 (n) {
  return (n < 10 ? '00' : n < 100 ? '0' : '') + n
}

function createFolder (dirPath) {
  try {
    fs.mkdirSync(dirPath)
    Log(`Dossier créé: ${dirPath}`)
  } catch (err) {
    if (err.code === 'EEXIST') Log(`Le dossier existe déja: ${dirPath}`, 1)
    else throw err
  }
}

function download (url, dest) {
  var file = fs.createWriteStream(dest)
  Log(`Téléchargement: ${url} vers ${dest}`)
  https.get(url, function (response) {
    response.pipe(file)
    file.on('finish', function () {
      Log(`Fin de téléchargement: ${url}`)
      file.close()
      downloadProgress++
      ipcLoading.sender.send('loading', loading, Math.round(downloadProgress * 100 / downloadAdvancement))
    })
  })
}
function copy (source, destination) {
  fs.createReadStream(source, {autoClose: true}).pipe(fs.createWriteStream(destination))
}

function Log (args, level) {
  logging.write(__filename, args, level)
}
