const path = require('path')

const links = document.querySelectorAll('link[rel="import"]')

Array.prototype.forEach.call(links, (link) => {
  let sectionName = path.basename(link.href, '.html')
  let template = link.import.querySelector('section')
  let clone = document.importNode(template, true)
  clone.id = sectionName
  document.querySelector('#content').appendChild(clone)
  try{
    require(`./${sectionName}`)
  } catch (err) {console.log("Aucun script")}
})

function showContent(sectionName){
  const embeded = document.querySelector('main section')
  try{
    document.getElementById("content").appendChild(embeded)
  }
  catch (err) {console.log("Aucune page")}

  const main = document.querySelector('main')
  const section = document.getElementById(sectionName)
  main.appendChild(section)
}

setTimeout(function() {
  showContent("select")
}, 2000);

setTimeout(function() {
  showContent("preview")
}, 4000);

setTimeout(function() {
  showContent("select")
}, 6000);