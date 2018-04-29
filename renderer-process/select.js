const ipc = require('electron').ipcRenderer
const path = require('path')

const select = {
  upload: document.getElementById('select-upload'),
  uploadBar: document.getElementById('select-uploadbar'),
  directory: document.getElementById('select-directory'),
  file: document.getElementById('select-file'),
  list: document.getElementById('select-list'),
  analyze: document.getElementById('select-analyze'),
  progressbar: document.getElementById('select-progressbar')
}


select.upload.addEventListener('drop', function (e) {
  e.preventDefault();
  e.stopPropagation();
  
  for (let f of e.dataTransfer.files) {
    console.log('File(s) you dragged here: ', f.path)
    ipc.send("select-upload", f.path)
  }
})

select.directory.addEventListener('click', (event) => {
  ipc.send("select-file-dialog","directory")
})

select.file.addEventListener('click', (event) => {
  ipc.send("select-file-dialog","file")
})

select.analyze.addEventListener('click', (event) => {
  ipc.send("select-analyze")
  select.analyze.parentNode.innerHTML += '<div uk-spinner id="select-spinner"></div>'
})

document.addEventListener('click', (event) => {
  console.log(event.target.parentNode)
  if (event.target.parentNode.className === 'uk-notification-close close-dir uk-close uk-icon') {
    var dir = event.target.parentNode.parentNode
    ipc.send('select-remove', dir.id)
    dir.parentNode.removeChild(dir)
    if (!select.list.firstChild) {
      select.analyze.setAttribute("disabled", "");
      select.analyze.classList.add('uk-animation-shake');
    }
  }
})

document.addEventListener('dragover', function (e) {
  e.preventDefault();
  e.stopPropagation();
})
document.addEventListener('drop', function (e) {
  e.preventDefault();
  e.stopPropagation();
})

ipc.on("select-callback", (event, dir, length) => {
  console.log(dir,length)
  select.analyze.removeAttribute('disabled');
  select.analyze.classList.remove('uk-animation-shake');
  if (length === 1){
    select.list.innerHTML += `<p class="uk-notification-message uk-notification-message-default uk-animation-slide-left" id="${dir}">
                                <a href="#" class="uk-notification-close close-dir" uk-close></a>
                                <span class="uk-margin-small-right" uk-icon="icon: copy"></span>
                                ${dir}
                              </p>`
  }
  else {
    select.list.innerHTML += `<p class="uk-notification-message uk-notification-message-primary uk-animation-slide-left" id="${dir}">
                                <a href="#" class="uk-notification-close close-dir" uk-close></a>
                                <span class="uk-margin-small-right" uk-icon="icon: folder"></span>
                                ${dir}
                                <span class="uk-badge">${length}</span>
                              </p>`
  }
})

ipc.on("select-progress", (event, value, max) =>{
  select.progressbar.value = value
  select.progressbar.max = max
})

ipc.on('select-no-internet', (event) => {
  document.getElementById('select-no-internet-trigger').click()
  console.log('no internet')
})

ipc.on("select-done", (event) => {
  let selectSpinner = document.getElementById('select-spinner')
  selectSpinner.parentNode.removeChild(selectSpinner)
})

function log (args, level){
  ipc.send('log', __filename, args, level)
}

log(`${path.basename(__filename)} importé avec succès.`)
