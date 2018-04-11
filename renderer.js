const ipc = require('electron').ipcRenderer

const submit = document.getElementById('submit')
const directory = document.getElementById('directory')
const directoryHolder = document.getElementById('directoryHolder')
const selectDirBtn = document.getElementById('select-directory')
const sendDirBtn = document.getElementById('send-directory')
const bar = document.getElementById('progressbar')

////////Détection des touches////////
document.addEventListener('keydown', function (e) {
  if (e.which === 123) { //F12
    require('electron').remote.getCurrentWindow().toggleDevTools()
  } else if (e.which === 116) { //F5
    location.reload()
  }
})

///////Détection des actions////////
selectDirBtn.addEventListener('click', function (event) {
  ipc.send('open-file-dialog', 'select')
})

sendDirBtn.addEventListener('click', function (event) {
  ipc.send('loading')
})

submit.addEventListener('click', function () {
  ipc.send('submit')
})

////////Réponse des canaux///////
ipc.on('selected-directory', function (event, path, nb) {
  document.getElementById('selected-file').innerHTML = 'You selected: ' + path + 'and there are ' + nb
})

ipc.on('loading', function (event, loading) {
  console.log(loading)
  bar.value = loading
})