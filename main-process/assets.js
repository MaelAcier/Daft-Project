const ipc = require('electron').ipcMain
const package = require('../package.json')

ipc.on('get-info', (event) => {
    console.log('get-info')
    event.sender.send('get-info', package.productName, package.version, package.description, package.author)
})
  