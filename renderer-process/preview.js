const ipc = require('electron').ipcRenderer

const albums = document.getElementById('albums')
const artists = document.getElementById('artists')
const list = document.getElementById('list')
const outFolder = document.getElementById('output-folder')
const submit = document.getElementById('submit')
const exportDefault = document.getElementById('export-default')

ipc.send('preview-ready')

ipc.on('show-data', (event, index, temp, summary, exportFolder)=>{
    console.log('reçu')
    for (artist in index){
        var artistId = artist.replace(/ /g, '');
        for (album in index[artist]){
            console.log(album)
            albums.innerHTML += `<li>
                                    <div class="uk-inline-clip uk-transition-toggle" tabindex="0">
                                        <img src="${temp}\\covers\\${artist}\\${album}.jpg" alt="">
                                        <div class="uk-transition-fade uk-position-cover uk-overlay uk-overlay-primary uk-flex uk-flex-center uk-flex-middle"></div>
                                        <div class="uk-position-center uk-panel"><h3 class="uk-transition-slide-bottom-small">${album}</h3>
                                            <a class="uk-link-text" href="#${artistId}" uk-toggle>
                                            <p class="uk-transition-slide-bottom-small">${artist}</p>
                                            </a>
                                        </div>
                                    </div>
                                </li>`
        }
        artists.innerHTML += `<div id="${artistId}" uk-offcanvas="flip: true; overlay: true">
                                <div class="uk-offcanvas-bar">
                                    <button class="uk-offcanvas-close uk-close-large" type="button" uk-close></button>
                                    <div class="uk-card uk-card-default">
                                        <div class="uk-card-media-top">
                                            <img src="${temp}\\covers\\${artist}.jpg" alt="">
                                        </div>
                                        <div class="uk-card-body">
                                            <h3 class="uk-card-title">${artist}</h3>
                                        </div>
                                    </div>
                                    <ul uk-accordion>
                                        <li class="uk-open">
                                            <a class="uk-accordion-title" href="#">Biographie</a>
                                            <div class="uk-accordion-content">
                                                <p>${summary[artist].summary.replace(/\n/g, '</br>')}</p>
                                            </div>
                                        </li>
                                        <li>
                                            <a class="uk-accordion-title" href="#">Styles</a>
                                            <div class="uk-accordion-content">
                                                <ul class="uk-list uk-list-bullet">
                                                    <li>${summary[artist].tags.join("</li><li>")}</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li>
                                            <a class="uk-accordion-title" href="#">Artistes similaires</a>
                                            <div class="uk-accordion-content">
                                                <ul class="uk-list uk-list-bullet">
                                                <li>${summary[artist].similar.join("</li><li>")}</li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>`
    }
    for (artist in index){
        var artistImage = `${temp}\\covers\\${artist}.jpg`.replace(/\\/g, '\/')
        list.innerHTML +=`<li>
                            <span class="uk-icon uk-icon-image uk-margin-small-right" style="background-image: url('${artistImage}');"></span>
                            ${artist}</li>`
        for (album in index[artist]){
            var albumImage = `${temp}\\covers\\${artist}\\${album}.jpg`.replace(/\\/g, '\/')
            list.innerHTML +=`<ul><li>
                                    <span class="uk-icon uk-icon-image uk-margin-small-right" style="background-image: url('${albumImage}');"></span>
                                    ${album}</li></ul>`
            for (track in index[artist][album]){
                list.innerHTML +=`<ul><li><ul><li>${index[artist][album][track].title}</li></ul></li></ul>`
            }
        }
    }
    outFolder.removeAttribute('disabled');
    submit.removeAttribute('disabled');
    exportDefault.innerHTML += `<code>${exportFolder}</code>`
})

outFolder.addEventListener('click', function (event) {
    ipc.send('export-dialog')
})

submit.addEventListener('click', function () {
    ipc.send('submit')
  })