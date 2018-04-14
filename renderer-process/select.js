const ipc = require('electron').ipcRenderer

const submit = document.getElementById('submit')
const selectDir = document.getElementById('select-directory')
const addDir = document.getElementById('add-directory')
const deleteDir = document.getElementById('delete-directory')
const sendDir = document.getElementById('send-directory')
const closeDir = document.getElementsByClassName('close-dir')
const bar = document.getElementById('progressbar')
const dirList = document.getElementById('directory-list')


///////Détection des actions////////
selectDir.addEventListener('click', function (event) {
  ipc.send('open-file-dialog', 'select')
  while (dirList.firstChild) {
    dirList.removeChild(dirList.firstChild);
  }
})

addDir.addEventListener('click', function (event) {
  ipc.send('open-file-dialog')
})

deleteDir.addEventListener('click', function (event) {
  ipc.send('remove-dir')
  while (dirList.firstChild) {
    dirList.removeChild(dirList.firstChild);
  }
})

sendDir.addEventListener('click', function (event) {
  ipc.send('loading')
})

document.addEventListener('click', (event) => {
  if (event.target.parentNode.className=='uk-notification-close close-dir uk-close uk-icon') {
    var dir = event.target.parentNode.parentNode
    ipc.send('remove-dir', dir.id)
    dir.parentNode.removeChild(dir)
  }
})

submit.addEventListener('click', function () {
  ipc.send('submit')
})



////////Réponse des canaux///////
ipc.on('selected-directory', function (event, path, nb) {
  deleteDir.removeAttribute('disabled');
  addDir.removeAttribute('disabled');
  sendDir.removeAttribute('disabled');

  dirList.innerHTML += `<p class="uk-notification-message uk-notification-message-primary" id="${path}">
                            <a href="#" class="uk-notification-close close-dir" uk-close></a>
                            ${path}
                            <span class="uk-badge">${nb}</span>
                        </p>`
})

ipc.on('loading', function (event, loading) {
  console.log(loading)
  bar.value = loading
})
