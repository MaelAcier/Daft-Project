const ipc = require('electron').ipcMain
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const dialog = require('electron').dialog
const ffmetadata = require ("ffmetadata");

ipc.on('open-file-dialog', (event,args)=> {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) {
      const folder=files[0];
      if (args='select'){
        directory = [];
        index = {};
      }
      console.log(folder);
      listFiles(folder)
      console.log(directory);
      event.sender.send('selected-directory', folder, directory.length)
      walkArtists(directory);
    }
  })
});

ipc.on('submit', (event)=> {
      console.log('artists:',index);
        console.log('artists2:',index["Justice"]);
        console.log('single',Object.keys(index));
        for (var id in index) { // On stocke l'identifiant dans « id » pour parcourir l'objet « family »
            console.log(id,'UNDERSINGLE',index[id]);
        }
});
  
var directory = [], index = {}, options = {};

var cover = "./tmp";
var outputAudio = './Audio';
var outputVisual = './Visual';

function listFiles(dir){
  directory = glob.sync(path.join(dir, '**/@(*.mp3|*.wav)'))
}

  
  const mkdirSync = function (dirPath) {
    try {
      fs.mkdirSync(dirPath)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }
  
  function walkArtists (musicList){
    mkdirSync(path.resolve(cover));
    musicList.forEach(function(file){
        ffmetadata.read(file,function(err,data){
          if (err) console.error("Error reading metadata", err);
          else {
              if (!Object.keys(index).includes(data.album_artist)){
                  index[data.album_artist]={};
              }
              if (!Object.keys(index[data.album_artist]).includes(data.album)){
                  index[data.album_artist][data.album]={};
                  
                  options.coverPath = "./tmp/"+data.album_artist+"/"+data.album+".jpg";
                  mkdirSync(path.resolve('./tmp/'+data.album_artist));
                  ffmetadata.read(file, options, function(err) {
                      if (err) console.error("Error writing cover art");
                      else console.log("Cover art added");
                  });
              }
                index[data.album_artist][data.album][data.title]={};
                index[data.album_artist][data.album][data.title]["Path"]=file;
                index[data.album_artist][data.album][data.title]["Track"]=data.track;
          }
        });
    });
  }