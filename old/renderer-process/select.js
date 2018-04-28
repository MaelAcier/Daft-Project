const ipc = require('electron').ipcRenderer
require('../assets/uikit.min.js')

const submit = document.getElementById('submit')
const selectDir = document.getElementById('select-directory')
const addDir = document.getElementById('add-directory')
const deleteDir = document.getElementById('delete-directory')
const sendDir = document.getElementById('send-directory')
const closeDir = document.getElementsByClassName('close-dir')
const dirList = document.getElementById('directory-list')
const load = document.getElementById('loading')
const retry = document.getElementById('retry')
const continuer = document.getElementById('continuer')
var bar, barDownload


///////Détection des actions////////
selectDir.addEventListener('click', (event) => {
  ipc.send('log','Requête de sélection de dossier.')
  ipc.send('open-file-dialog', 'select')
  while (dirList.firstChild) {
    dirList.removeChild(dirList.firstChild)
  }
})

addDir.addEventListener('click', (event) => {
  ipc.send('open-file-dialog')
})

deleteDir.addEventListener('click', (event) => {
  ipc.send('remove-dir')
  while (dirList.firstChild) {
    dirList.removeChild(dirList.firstChild)
  }
  disable()
})

sendDir.addEventListener('click', (event) => {
  load.innerHTML = `<p>Analyse des musiques</p>
                      <progress id="progressbar" class="uk-progress uk-animation-scale-up" value="0" max="100"></progress>
                    <p>Récupération de données</p>
                      <progress id="progressbarDownload" class="uk-progress uk-animation-scale-up" value="0" max="100"></progress>`
  sendDir.setAttribute("disabled", "");
  ipc.send('loading')
})

document.addEventListener('click', (event) => {
  if (event.target.parentNode.className=='uk-notification-close close-dir uk-close uk-icon') {
    var dir = event.target.parentNode.parentNode
    ipc.send('remove-dir', dir.id)
    dir.parentNode.removeChild(dir)
    if (!dirList.firstChild) {
      disable()
    }
  }
})

function disable (){
  deleteDir.setAttribute("disabled", "");
  addDir.setAttribute("disabled", "");
  sendDir.setAttribute("disabled", "");
  sendDir.classList.add('uk-animation-shake');
}

retry.addEventListener('click', (event) => {
  ipc.send('loading')
})

continuer.addEventListener('click', function (event) {
  document.querySelector(`a[data-section=preview]`).click()
  ipc.send('show-data')
})


////////Réponse des canaux///////
ipc.on('selected-directory', function (event, path, nb) {
  deleteDir.removeAttribute('disabled');
  addDir.removeAttribute('disabled');
  sendDir.removeAttribute('disabled');
  sendDir.classList.remove('uk-animation-shake');

  dirList.innerHTML += `<p class="uk-notification-message uk-notification-message-primary uk-animation-slide-left" id="${path}">
                            <a href="#" class="uk-notification-close close-dir" uk-close></a>
                            ${path}
                            <span class="uk-badge">${nb}</span>
                        </p>`
})

ipc.on('loading', function (event, loading, download) {
  bar = document.getElementById('progressbar')
  barDownload = document.getElementById('progressbarDownload')
  console.log("loading:",loading)
  console.log("download:",download)
  bar.value = loading
  barDownload.value = download
  if (loading===100&&download===100){
    document.querySelector(`a[data-section=preview]`).click()
    ipc.send('show-data')
  }
})

ipc.on('no-internet', (event) => {
  document.getElementById('no-internet-trigger').click()
  console.log('no internet')
})