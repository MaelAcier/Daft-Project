
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
var pages = {}
var sectionName

///// Import and add each page to the DOM
Array.prototype.forEach.call(links, (link) => {
  let template = link.import.querySelector('.task-template')
  let clone = document.importNode(template.content, true)
  pages[link.id]=clone
  //document.querySelector('.content').appendChild(clone)

})
console.log(pages)


//////Nav
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