const ipc = require('electron').ipcRenderer

const ytLink = document.getElementById('youtube-link')
const ytTrigger = document.getElementById('youtube-trigger')
const ytEmbeded = document.getElementById('youtube-embeded')
const ytDownload = document.getElementById('youtube-download')
const ytProgressbar = document.getElementById('youtube-progressbar')

var ytValue

ytTrigger.addEventListener('click', (event) => {
  console.log(ytLink.value)
  if (/(?:https\:\/\/youtu\.be\/)|(?:https\:\/\/www.youtube\.com\/watch\?v=)/.test(ytLink.value)){
    ytLink.className = ('uk-input uk-form-success uk-form-width-large');
    if (/(?:https\:\/\/youtu\.be\/)/.test(ytLink.value)){
      ytValue = ytLink.value.replace(/(?:https\:\/\/youtu\.be\/)/, "");
    }
    else if (/(?:https\:\/\/www.youtube\.com\/watch\?v=)/.test(ytLink.value)){
      ytValue = ytLink.value.replace(/(?:https\:\/\/www.youtube\.com\/watch\?v=)/, "");
    }
    ytEmbeded.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${ytValue}?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    ytDownload.removeAttribute('disabled')
    ytDownload.classList.remove('uk-animation-shake');
  } else {
    ytLink.className = ('uk-input uk-form-danger uk-form-width-large');
  }
})

ytDownload.addEventListener('click', (event) => {
  ipc.send('youtube',ytValue)
})

ipc.on('youtube', (event, progress) => {
  console.log(progress)
  ytProgressbar.value = progress
})