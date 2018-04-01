const {ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const ffmetadata = require ("ffmetadata");


ipcMain.on('submit', (event,folder)=> {
    console.log(folder);
    walkSync(folder+'/',directory);
    walkArtists(directory);
    setTimeout(myFunction, 6000);
    function myFunction(){
      console.log('artists:',index);
        console.log('artists2:',index["Justice"]);
        console.log('single',Object.keys(index));
        for (var id in index) { // On stocke l'identifiant dans « id » pour parcourir l'objet « family »
            console.log(id,'UNDERSINGLE',index[id]);
        }
    }
    } 
  )
  
  //var folder = "./folder";
  var cover = "./tmp"
  var directory = [];
  var index = {};
  var outputAudio = './Audio';
  var outputVisual = './Visual';
  var options = {
    coverPath: "cover.jpg",
  };
  
  var walkSync = function(dir, fileList) {
    var files = fs.readdirSync(dir);
    var ext = ['.mp3','.wav']
    files.forEach(function(file) {
      if (fs.statSync(dir + file).isDirectory()) {
        //folders
        fileList = walkSync(dir + file + '/', fileList);
      }
      else if (ext.includes(path.extname(file))){
        //files
        fileList.push(dir+file);
      }
    });
    return fileList;
  };
  
  const mkdirSync = function (dirPath) {
    try {
      fs.mkdirSync(dirPath)
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }
  //console.log(walkSync(folder+'/',directory));
  //walkSync(folder+'/',directory)
  
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
                //console.log('test:',index[data.album_artist][data.album][data.title]);
          }
        });
    });
  }