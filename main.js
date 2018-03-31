const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const ffmetadata = require ("ffmetadata");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  // or: mainWindow.loadURL('file://' + __dirname + '/index.html');
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var folder = "./folder";
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
walkSync(folder+'/',directory)

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
              console.log('test:',index[data.album_artist][data.album][data.title]);
        }
      });
  });
}

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

const LastFM = require('last-fm')
const lastfm = new LastFM('e01234609d70b34055b389734707ac0a', { userAgent: 'MyApp/1.0.0 (http://example.com)' })

/*lastfm.trackSearch({ q: 'Safe and Sound' }, (err, data) => {
  if (err) console.error(err)
  else console.log(data)
})*/

lastfm.artistInfo({ name: 'Daft Punk' }, (err, data) => {
  if (err) console.error(err)
  else console.log(data)
})