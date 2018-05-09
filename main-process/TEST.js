const ffmetadata = require('ffmetadata')


// Set the artist for song.mp3
var data = {
  artist: "Me",
};
var options = {
  attachments: ["test-cover.jpg","test-cover2.jpg"],
};
ffmetadata.write("sample.mp3", data, options, function(err) {
    if (err) console.error("Error writing cover art");
    else console.log("Cover art added");
});

ffmetadata.read("sample.mp3", function(err, data) {
  if (err) console.error("Error reading metadata", err);
  else console.log(data);
});
