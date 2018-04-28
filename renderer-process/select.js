const ipc = require('electron').ipcRenderer
const path = require('path')

log(`${path.basename(__filename)} importé avec succès.`)
var nb = 0

const test= document.getElementById("test")

setInterval(function() {
  nb++
  test.innerHTML += nb +' '
}, 1000)


//log("test")

function log (args, level){
  ipc.send('log', __filename, args, level)
}
