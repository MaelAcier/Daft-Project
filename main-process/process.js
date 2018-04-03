const ipc = require('electron').ipcMain;
const os = require('os');
//const path = require('path');
const fs = require('fs');
const glob = require('glob');
const electron = require('electron')
const {dialog, app} = require('electron');
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
      listMusics(directory);
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
  
var directory = [], index = {};

const temp = `${os.tmpdir()}\\${electron.app.getName()}-${electron.app.getVersion()}`;
createDir(temp);
console.log('tmp',temp);

function createDir (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

function listFiles(dir){
  //directory = glob.sync(path.join(dir, '**/@(*.mp3|*.wav)'))
  directory = glob.sync(`${dir}/**/@(*.mp3|*.wav)`);
}

function listMusics (list){
  list.forEach((file)=>{
      ffmetadata.read(file, (err,data)=>{
        if (err) console.error("Error reading metadata", err);
        else {
          if (!Object.keys(index).includes(data.album_artist)){
            index[data.album_artist]={};
          }
          if (!Object.keys(index[data.album_artist]).includes(data.album)){
            index[data.album_artist][data.album]={}; 

            let coverpath = `${temp}\\${data.album_artist}`
            createDir(coverpath);
            ffmetadata.read(file, {coverPath: [`${coverpath}\\${data.album}.jpg`]}, (err)=>{
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

var output = './output';

function writeMusics (dir){
  for (var id in index) { // On stocke l'identifiant dans « id » pour parcourir l'objet « family »
    createDir()
  }
}