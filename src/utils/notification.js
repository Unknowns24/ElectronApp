const Alert = require("electron-alert");

function showNotification(title, message, error) {
    let alert = new Alert(['<link rel="preconnect" href="https://fonts.googleapis.com">', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>', '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300&display=swap" rel="stylesheet">', '<style> html, body { font-family: "Roboto", sans-serif; width: 100%; height: 100%; overflow: hidden;} .swal2-container{display: flex; width: 400px; height: auto; box-sizing: content-box;} .swal2-popup{box-sizing: content-box; height: auto; margin: 10px; border-radius: 0px;}</style>']);
  
    let swalOptions = {  
      toast: true,
      singletonId: "notification-alert",
      position: "bottom-end",
      title: title,
      text: message,
      icon: (error ? "error" : "success"),
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 3000
    }
  
    alert.fireFrameless(swalOptions, null, true, false)
}

exports.showNotification = (title, message, error) => showNotification(title, message, error);