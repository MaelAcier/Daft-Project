const os = require('os');
const fs = require('fs');
const glob = require('glob');
const https = require('https');
const LastFM = require('last-fm')
const ffmetadata = require ("ffmetadata");
const electron = require('electron')
const ipc = require('electron').ipcMain;
const {dialog, app} = require('electron');

const lastfm = new LastFM('e01234609d70b34055b389734707ac0a')
const temp = `${os.tmpdir()}\\${electron.app.getName()}-${electron.app.getVersion()}`;
var directory = [], error = [], index = {}, summary = {}, folder, loading;


createDir(temp);
console.log('tmp',temp);

ipc.on('open-file-dialog', (event,args)=> {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, function (files) {
    if (files) {
      folder=files[0];
      if (args='select'){
        directory = [];
        index = {};
      }
      console.log(folder);
      listFiles(folder)
      //console.log(directory);
      event.sender.send('selected-directory', folder, directory.length)
      listMusics(directory);
    }
  })
});

ipc.on('submit', (event)=> {
        //console.log(summary);
        newFolder = folder.split('\\');
        console.log(newFolder);
        newFolder.pop();
        folder = newFolder.join('\\');
        writeMusics(folder);
});

function artistRequest (artist) {   
  lastfm.artistInfo({ name: artist }, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('data');
      summary[artist] = data.summary;
      download(data.images[data.images.length-1],`${temp}\\${artist}.png`);
    }
  });
}

//artistRequest('Daft Punk');
//albumRequest('Random Access Memories', 'Daft Punk');


function albumRequest (album, artist) {
  lastfm.albumInfo({ name: album , artistName: artist}, (err, data) => {
    if (err) console.error(err)
    else {
      //console.log(data);
      download(data.images[data.images.length-1],`${temp}\\${artist}\\${album}.png`);
    }
  })
}



function download (url, dest) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
    });
  });
}

function listFiles(dir){
  //directory = glob.sync(path.join(dir, '**/@(*.mp3|*.wav)'))
  directory = glob.sync(`${dir}/**/@(*.mp3|*.wav)`);
}

function listMusics (list){
  var advancement = 0;
  list.forEach((file)=>{
      ffmetadata.read(file, (err,data)=>{
        if (err) {
          console.error("Error reading metadata", err);
          error.push(file);
        }
        else {
          if (!Object.keys(index).includes(data.album_artist)){
            index[data.album_artist]={};
            artistRequest(data.album_artist);
          }
          if (!Object.keys(index[data.album_artist]).includes(data.album)){
            index[data.album_artist][data.album]={}; 

            let coverpath = `${temp}\\${data.album_artist}`
            createDir(coverpath);
            ffmetadata.read(file, {coverPath: [`${coverpath}\\${data.album}.jpg`]}, (err)=>{
              if (err) {
                console.error("Error writing cover art");
                albumRequest(data.album, data.album_artist);
              }
              else console.log("Cover art added");
            });
          }
          index[data.album_artist][data.album][data.track]={};
          index[data.album_artist][data.album][data.track].title=data.title;
          index[data.album_artist][data.album][data.track].path=file;
          advancement++;
          //console.log(advancement);
          loading = advancement*100/directory.length;
          console.log(`${loading}%`);
        }
      });
  });
}

function writeMusics (dir){
  var newDir = `${dir}\\output-`;
  var artistNumber = 0, trackNumber = 0, artistDir, trackDir;
  newDir = fs.mkdtempSync(newDir);
  var indexStream = fs.createWriteStream(`${newDir}\\index.txt`, {flags: 'a', autoClose: true});// 'a' means appending (old data will be preserved
  for (var artist in index) {
    artistNumber++;
    trackNumber = 0;
    artistDir = digits(artistNumber);
    createDir(`${newDir}\\${artistDir}`)
    indexStream.write(`${artist}\n`);
    indexStream.write(`\\${artistDir}\n`);
    for (var album in index[artist]) {
      indexStream.write(`\t${album}\n`);
      for (var track in index[artist][album]) {
        trackNumber++;
        trackDir = digits100(trackNumber);
        fs.createReadStream(index[artist][album][track].path, {autoClose: true}).pipe(fs.createWriteStream(`${newDir}\\${artistDir}\\${trackDir}.mp3`));
        indexStream.write(`\t\t${index[artist][album][track].title}\n`);
        indexStream.write(`\t\t\\${trackDir}\n`);
      }
    }
  }
}

function digits(n) {
  return (n < 10 ? '0' : '') + n;
}
function digits100(n) {
  return (n < 10 ? '00' : n < 100 ? '0' : '' ) + n;
}

function createDir (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}