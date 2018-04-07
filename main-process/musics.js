const os = NodeRequire('os')
const fs = require('fs')
const glob = require('glob')
const https = require('https')
const LastFM = require('last-fm')
const ffmetadata = require('ffmetadata')
const electron = require('electron')
const ipc = require('electron').ipcMain
const {dialog, app} = require('electron')

const lastfm = new LastFM('e01234609d70b34055b389734707ac0a')
const temp = `${os.tmpdir()}\\${electron.app.getName()}-${electron.app.getVersion()}`
const LogStream = fs.createWriteStream(`.\\logs\\${Date.now()}.log`, {flags: 'a'})
var directory = [], error = [], index = {}, summary = {}, folder, loading

Log(`Répertoire temporaire: ${temp}`)
createDir(temp)
console.log('tmp', temp)

ipc.on('open-file-dialog', (event, args) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) {
      folder = files[0]
      Log(`Répertoire musical: ${folder}`)
      if (args = 'select') {
        Log(`Sélection unique.`)
        directory = []
        index = {}
      }
      listFiles(folder)
      Log(`Il y a ${directory.length} musiques`)
      event.sender.send('selected-directory', folder, directory.length)
    }
  })
})

ipc.on('loading', (event) => {
  listMusics(directory, event)
  Log(`Analyse des musiques`)
})

ipc.on('submit', (event) => {
  // console.log(summary);
  newFolder = folder.split('\\')
  console.log(newFolder)
  newFolder.pop()
  output = newFolder.join('\\')
  writeMusics(output)
  Log(`Export des musiques vers ${output}`)
})

function artistRequest (artist) {
  lastfm.artistInfo({ name: artist }, (err, data) => {
    if (err) Log(`Lastfm: ${err}`, 2)
    else {
      console.log('data')
      Log(`Requête: ${artist}`)
      summary[artist] = data.summary
      download(data.images[data.images.length - 1], `${temp}\\${artist}.png`)
    }
  })
}

function albumRequest (album, artist) {
  lastfm.albumInfo({ name: album, artistName: artist}, (err, data) => {
    if (err) Log(`Lastfm: ${err}`, 2)
    else {
      Log(`Requête: ${album} \\ ${artist}`)
      download(data.images[data.images.length - 1], `${temp}\\${artist}\\${album}.png`)
    }
  })
}

function listFiles (dir) {
  directory = glob.sync(`${dir}/**/@(*.mp3|*.wav)`)
  Log(`Liste des fichiers: ${directory.join('\n')}`)
}

function listMusics (list, event) {
  var advancement = 0
  list.forEach((file) => {
    ffmetadata.read(file, (err, data) => {
      if (err) {
        console.error('Error reading metadata', err)
        Log(`Lecture des metadata: ${err} pour ${file}`, 2)
        error.push(file)
      } else {
        if (!Object.keys(index).includes(data.album_artist)) {
          index[data.album_artist] = {}
          artistRequest(data.album_artist)
        }
        if (!Object.keys(index[data.album_artist]).includes(data.album)) {
          index[data.album_artist][data.album] = {}

          let coverpath = `${temp}\\${data.album_artist}`
          createDir(coverpath)
          ffmetadata.read(file, {coverPath: [`${coverpath}\\${data.album}.jpg`]}, (err) => {
            if (err) {
              console.error('Error writing cover art')
              Log(`Pochette (${data.album}): ${err}`, 1)
              albumRequest(data.album, data.album_artist)
            } else console.log('Cover art added')
            Log(`Pochette ajoutée: ${data.album}`)
          })
        }
        index[data.album_artist][data.album][data.track] = {}
        index[data.album_artist][data.album][data.track].title = data.title
        index[data.album_artist][data.album][data.track].path = file
        advancement++
        // console.log(advancement);
        loading = Math.round(advancement * 100 / directory.length)
        console.log(`${loading}%`)
        Log(`Avancement de l'analyse: ${loading}%`)
        event.sender.send('loading', loading)
      }
    })
  })
}

function writeMusics (dir) {
  var newDir = `${dir}\\output-`
  var artistNumber = 0, trackNumber = 0, artistDir, trackDir
  newDir = fs.mkdtempSync(newDir)
  Log(`Dossier de sortie: ${newDir}`)
  var indexStream = fs.createWriteStream(`${newDir}\\index.txt`, {flags: 'a', autoClose: true})// 'a' means appending (old data will be preserved
  for (var artist in index) {
    artistNumber++
    trackNumber = 0
    artistDir = digits(artistNumber)
    createDir(`${newDir}\\${artistDir}`)
    indexStream.write(`${artist}\n`)
    indexStream.write(`\\${artistDir}\n`)
    for (var album in index[artist]) {
      indexStream.write(`\t${album}\n`)
      for (var track in index[artist][album]) {
        trackNumber++
        trackDir = digits100(trackNumber)
        fs.createReadStream(index[artist][album][track].path, {autoClose: true}).pipe(fs.createWriteStream(`${newDir}\\${artistDir}\\${trackDir}.mp3`))
        indexStream.write(`\t\t${index[artist][album][track].title}\n`)
        indexStream.write(`\t\t\\${trackDir}\n`)
      }
    }
  }
}

function digits (n) {
  return (n < 10 ? '0' : '') + n
}
function digits100 (n) {
  return (n < 10 ? '00' : n < 100 ? '0' : '') + n
}

function createDir (dirPath) {
  try {
    fs.mkdirSync(dirPath)
    Log(`Dossier créé: ${dirPath}`)
  } catch (err) {
    if (err.code == 'EEXIST') Log(`Le dossier existe déja: ${dirPath}`, 1)
    else throw err
  }
}

function download (url, dest) {
  var file = fs.createWriteStream(dest)
  Log(`Téléchargement: ${url} vers ${dest}`)
  var request = https.get(url, function (response) {
    response.pipe(file)
    file.on('finish', function () {
      Log(`Fin de téléchargement: ${url}`)
      file.close()
    })
  })
}

function Log (args, level) {
  var logLevel
  var utc = new Date().toJSON().slice(0, 23).replace(/T/, ' ')
  if (level === undefined) logLevel = '[INFO]'
  else if (level === 1) logLevel = '[WARN]'
  else if (level === 2) logLevel = '[ERROR]'
  else logLevel = '[DEBUG]'
  LogStream.write(`${utc} ${logLevel} ${args}\n`)
}
