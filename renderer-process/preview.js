const ipc = require('electron').ipcRenderer
const path = require('path')

const preview = {
  slideshow: document.getElementById('preview-slideshow'),
  slideshowItem: document.getElementById('preview-slideshow-item'),
  album: document.getElementById('preview-album'),
  artist: document.getElementById('preview-artist'),
  tracks: document.getElementById('preview-tracks'),
  tags: document.getElementById('preview-tags'),
  similar: document.getElementById('preview-similar'),
  summary: document.getElementById('preview-summary')
}
var temp
var index

ipc.on("preview-display", (event, indexArg, tempArg) => {
  temp = tempArg
  index = indexArg
  preview.slideshow.innerHTML = ""
  preview.slideshowItem.innerHTML = ""
  var albumNumber = -1
  for (artist in index.list){
    for (album in index.list[artist].albums){
      albumNumber++
      preview.slideshow.innerHTML += `<li>
                                        <img src="${temp}\\covers\\${artist}\\${album}.jpg" alt="" uk-cover>
                                        <div class="uk-position-center uk-position-small uk-text-center">
                                          <h2 uk-slideshow-parallax="x: 100,-100"><a class="preview-show-details" data-album="${album}" data-artist="${artist}">${album}</a></h2>
                                          <p uk-slideshow-parallax="x: 200,-200">${artist}</p>
                                        </div>
                                      </li>`
      preview.slideshowItem.innerHTML += `<li uk-slideshow-item="${albumNumber}"><a href="#">Item ${albumNumber}</a></li>`
    }
  }
})

preview.slideshow.addEventListener('click', function (event) {
  if (event.target.className === "preview-show-details"){
    let artist = event.target.dataset.artist
    let album = event.target.dataset.album
    console.log(album)
    console.log(artist)
    preview.album.innerHTML = `<div class="uk-card-media-top uk-text-center">
                                <img src="${temp}\\covers\\${artist}\\${album}.jpg" alt="">
                              </div>
                              <div class="uk-card-body">
                                <h3 class="uk-card-title">${album}</h3>
                                <p>${artist}</p>
                              </div>`
    preview.tracks.innerHTML = ""
    for (track in index.list[artist].albums[album]){
      preview.tracks.innerHTML += `<li>${track} - ${index.list[artist].albums[album][track].title}</li>`
    }
    preview.artist.innerHTML = `<div class="uk-card-media-top uk-text-center">
                                <img src="${temp}\\covers\\${artist}.jpg" alt="">
                              </div>
                              <div class="uk-card-body">
                                <h3 class="uk-card-title">${artist}</h3>
                              </div>`
    preview.tags.innerHTML = index.list[artist].tags.join(" - ")
    preview.similar.innerHTML = index.list[artist].similar.join(" - ")
    preview.summary.innerHTML = index.list[artist].summary.replace(/\n/g, '</br>')
  }
})



ipc.send("ipc-preview")

function log (args, level){
  ipc.send('log', __filename, args, level)
}

log(`${path.basename(__filename)} importé avec succès.`)
