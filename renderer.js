// Renderer process code
console.log('Renderer process started');
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>My Electron App</title>
  </head>
  <body>
    <h1>Hello, Electron!</h1>
    <p>Your project is now running.</p>
  </body>
</html>

webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js'),
},