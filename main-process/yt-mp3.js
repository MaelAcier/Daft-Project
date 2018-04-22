const youtubeMp3Downloader = require("youtube-mp3-downloader");
const ipc = require('electron').ipcMain
const path = require('path')
var ipcYoutube
//Configure YoutubeMp3Downloader with your settings
const yt = new youtubeMp3Downloader({
    "ffmpegPath": path.resolve(__dirname,"../node_modules/ffmetadata/bin/ffmpeg"),        // Where is the FFmpeg binary located?
    "outputPath": path.resolve(__dirname,"../folder"),    // Where should the downloaded and encoded files be stored?
    "youtubeVideoQuality": "highest",       // What video quality should be used?
    "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
    "progressTimeout": 100                 // How long should be the interval of the progress reports
});


ipc.on('youtube', (event, args) => {
    yt.download(args)
    ipcYoutube = event
})

//Download video and save as MP3 file
//yt.download("Vhd6Kc4TZls")
 
yt.on("finished", function(err, data) {
    console.log(JSON.stringify(data))
});
 
yt.on("error", function(error) {
    console.log(error)
});
 
yt.on("progress", function(advancement) {
    ipcYoutube.sender.send('youtube', advancement.progress.percentage)
    console.log(advancement.progress.percentage)
});