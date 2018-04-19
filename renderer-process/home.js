const welcome = document.getElementById('welcome')


welcome.addEventListener('click', function (event) {
    welcome.innerHTML += `test`
    document.getElementById('trigger-modal-full-split').click()
  })