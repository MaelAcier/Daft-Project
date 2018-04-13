const ipc = require('electron').ipcRenderer

/*const submit = document.getElementById('submit')
const directory = document.getElementById('directory')
const directoryHolder = document.getElementById('directoryHolder')
const selectDirBtn = document.getElementById('select-directory')
const sendDirBtn = document.getElementById('send-directory')
const bar = document.getElementById('progressbar')*/

var pages = {}
var sectionName
////////Détection des touches////////
document.addEventListener('keydown', function (e) {
  if (e.which === 123) { //F12
    require('electron').remote.getCurrentWindow().toggleDevTools()
  } else if (e.which === 116) { //F5
    location.reload()
  }
})

///////


const links = document.querySelectorAll('link[rel="import"]')

// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
  let template = link.import.querySelector('.task-template')
  let clone = document.importNode(template.content, true)
  pages[link.id]=clone
  //document.querySelector('.content').appendChild(clone)

})
console.log(pages)



document.addEventListener('click', (event) => {
  if (event.target.dataset.section) {
    showContent(event)
  } else console.log("hey, wrong code")
})

function showContent(event){
  const sections = document.querySelector('.content section');
  pages[sectionName] = sections
  try{
    sections.parentNode.removeChild(sections)
  }
  catch (err) {console.log("Aucune page")}
  sectionName = event.target.dataset.section
  document.querySelector('.content').appendChild(pages[sectionName])
  currentSection(event)
}


/*function showContent(event) {
  const sections = document.querySelector('.content section');
  try{
    pages[sectionName]=sections
    sections.parentNode.removeChild(sections)
  }
  catch (err) {console.log("Aucune page")}

  console.log(pages)
  console.log(pages['select'])

  const link = document.getElementById(event.target.dataset.section)
  sectionName = event.target.dataset.section
  console.log(event.target.dataset.section)
  let template = link.import.querySelector('.task-template')
  let clone = document.importNode(template.content, true)
  document.querySelector('.content').appendChild(clone)
  currentSection(event)
}*/


function currentSection (current) {
  const buttons = document.querySelectorAll('.uk-navbar-nav li')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('uk-active')
  })

  const selected = current.target.parentNode
  selected.className = 'uk-active'
}

document.querySelector('.content').appendChild(pages['select'])
sectionName = 'select'

/*const link = document.getElementById('select')
sectionName = 'select'
let template = link.import.querySelector('.task-template')
let clone = document.importNode(template.content, true)
document.querySelector('.content').appendChild(clone)*/

/*
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
})*/
