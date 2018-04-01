const {ipcRenderer} = require('electron')

document.addEventListener("keydown", function (e) {
		if (e.which === 123) {
			require('electron').remote.getCurrentWindow().toggleDevTools();
		} else if (e.which === 116) {
			location.reload();
		}
  });



	var submit = document.getElementById('submit');
	var directory = document.getElementById('directory');
	var directoryHolder = document.getElementById('directoryHolder');

	submit.addEventListener('click', function() {
		if(directory.files[0]){
			//alert(directory.files[0].path);
			ipcRenderer.send('submit', directory.files[0].path)
		}
		else{
			directoryHolder.removeAttribute('disabled');
			directoryHolder.className += ' uk-form-danger';
			}
	});