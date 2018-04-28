const test = document.getElementById("test")

var nb = 0

setInterval(function() {
  nb++
  test.innerHTML += nb +' '
}, 1000);
