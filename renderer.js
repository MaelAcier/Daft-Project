document.addEventListener("keydown", function (e) {
		if (e.which === 123) {
			require('electron').remote.getCurrentWindow().toggleDevTools();
		} else if (e.which === 116) {
			location.reload();
		}
  });