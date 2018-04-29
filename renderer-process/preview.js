const ipc = require('electron').ipcRenderer
const path = require('path')




function log (args, level){
  ipc.send('log', __filename, args, level)
}

log(`${path.basename(__filename)} importé avec succès.`)
