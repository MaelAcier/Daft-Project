const ipc = require('electron').ipcRenderer

const nodejs = document.getElementById('nodejs')
const electron = document.getElementById('electron')
const chromium = document.getElementById('chromium')
const appName = document.getElementById('appName')

console.log('about')

ipc.send('get-info')

console.log('about2')

ipc.on('get-info', (event, name, version, description, author)=> {
    appName.innerHTML += `${name} ${version} ${description} ${author.name}`

    nodejs.innerHTML += process.versions.node
    electron.innerHTML += process.versions.electron
    chromium.innerHTML += process.versions.chrome
})
