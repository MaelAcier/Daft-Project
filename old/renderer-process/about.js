const ipc = require('electron').ipcRenderer

const nodejs = document.getElementById('nodejs')
const electron = document.getElementById('electron')
const chromium = document.getElementById('chromium')
const appName = document.getElementById('app-name')
const appDescription = document.getElementById('app-description')
const authorName= document.getElementById('author-name')
const authorEmail= document.getElementById('author-email')
const repoType= document.getElementById('repository-type')
const repoUrl= document.getElementById('repository-url')

console.log('about')

ipc.send('get-info')

console.log('about2')

ipc.on('get-info', (event, name, version, description, author, repository)=> {
    appName.innerHTML = `${name} - ${version}`
    appDescription.innerHTML = description
    authorName.innerHTML = author.name
    authorEmail.innerHTML = `Contact: ${author.email}`
    repoType.innerHTML = `Dépôt: ${repository.type}`
    repoUrl.innerHTML = repository.url

    nodejs.innerHTML += process.versions.node
    electron.innerHTML += process.versions.electron
    chromium.innerHTML += process.versions.chrome
})
