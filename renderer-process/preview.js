const ipc = require('electron').ipcRenderer
const path = require('path')

const preview = {
  slideshow: document.getElementById('preview-slideshow'),
  slideshowItem: document.getElementById('preview-slideshow-item'),
}

ipc.on("preview-display", (event, index, temp) => {
  console.log("received", index)
  preview.slideshow.innerHTML = ""
  preview.slideshowItem.innerHTML = ""
  var albumNumber = -1
  for (artist in index.list){
    console.log(artist)
    for (album in index.list[artist].albums){
      albumNumber++
      console.log(album)
      preview.slideshow.innerHTML += `<li>
                                        <img src="${temp}\\covers\\${artist}\\${album}.jpg" alt="" uk-cover>
                                        <div class="uk-position-center uk-position-small uk-text-center">
                                          <h2 uk-slideshow-parallax="x: 100,-100"><a id="preview-show-details" data-album="${album}" data-artist="${artist}">${album}</a></h2>
                                          <p uk-slideshow-parallax="x: 200,-200">${artist}</p>
                                        </div>
                                      </li>`
      preview.slideshowItem.innerHTML += `<li uk-slideshow-item="${albumNumber}"><a href="#">Item ${albumNumber}</a></li>`
    }
  }
})





ipc.send("ipc-preview")

function log (args, level){
  ipc.send('log', __filename, args, level)
}

log(`${path.basename(__filename)} importé avec succès.`)
