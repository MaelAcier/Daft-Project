const fs = require('fs')
const https = require('https')
const ipc = require('electron').ipcMain
const logging = require('./logging.js')

module.exports = {
	checkInternet: (result) => {
		require('dns').lookup('google.com',function(err) {
			if (err && err.code == "ENOTFOUND") {
				console.log(err)
				result(false);
			} else {
				result(true);
			}
		})
	},
	download: (url, dest, callback) => {
		var file = fs.createWriteStream(dest)
		log(`Téléchargement: ${url} vers ${dest}`)
		https.get(url, (response) => {
			response.pipe(file)
			file.on('finish', () => {
			file.close()
			callback()
			})
		})
	},
	createFolder: (dir) => {
		try {
			fs.mkdirSync(dir)
			log(`Dossier créé: ${dir}`)
		} catch (err) {
			if (err.code === 'EEXIST') log(`Le dossier existe déja: ${dir}`, 1)
			else throw err
		}
	},
	copy: (source, destination) => {
		fs.createReadStream(source, {autoClose: true}).pipe(fs.createWriteStream(destination))
	}
};

function log (args, level) {
	logging.write(__filename, args, level)
}