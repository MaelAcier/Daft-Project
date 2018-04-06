const ipc = require('electron').ipcRenderer

document.addEventListener("keydown", function (e) {
		if (e.which === 123) {
			require('electron').remote.getCurrentWindow().toggleDevTools();
		} else if (e.which === 116) {
			location.reload();
		}
});



const submit = document.getElementById('submit');
const directory = document.getElementById('directory');
const directoryHolder = document.getElementById('directoryHolder');
const selectDirBtn = document.getElementById('select-directory')
const sendDirBtn = document.getElementById('send-directory')
const bar = document.getElementById('progressbar')

submit.addEventListener('click', function() {
	//if(directory.files[0]){
		//alert(directory.files[0].path);
		//ipcRenderer.send('submit', directory.files[0].path)
		ipc.send('submit');
	/*}
	else{
		directoryHolder.removeAttribute('disabled');
		directoryHolder.className += ' uk-form-danger';
		}*/
});

selectDirBtn.addEventListener('click', function (event) {
	ipc.send('open-file-dialog', 'select');
  })
  
  ipc.on('selected-directory', function (event, path, nb) {
	document.getElementById('selected-file').innerHTML = 'You selected: '+path+'and there are '+nb;
})

sendDirBtn.addEventListener('click', function (event) {
	ipc.send('loading');
  })
  
  ipc.on('loading', function (event, loading) {
	console.log(loading);
	bar.value=loading;
	//document.getElementById('selected-file').innerHTML = 'You selected: '+path+'and there are '+nb;
})

// Tell main process to show the menu when demo button is clicked
/*const contextMenuBtn = document.getElementById('context-menu')
contextMenuBtn.addEventListener('click', function () {
  ipc.send('show-context-menu')
})*/