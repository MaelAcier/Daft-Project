document.addEventListener('drop', function (e) {
  e.preventDefault();
  e.stopPropagation();
  
  for (let f of e.dataTransfer.files) {
    console.log('File(s) you dragged here: ', f.path)
  }
});
document.addEventListener('dragover', function (e) {
  e.preventDefault();
  e.stopPropagation();
});