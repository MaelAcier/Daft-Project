const LastFM = require('last-fm')

ffmetadata.read("song.mp3", function(err, data) {
  if (err) console.error("Error reading metadata", err);
  else console.log(data);
});