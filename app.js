
const express = require('express');
const app = express();
const appPath = require('path');
const fs = require('fs');
const axios = require('axios');
const args = process.argv.slice(2)

const port = process.env.PORT || args[0] || 3000
const imagePath = `downloads/`
var newJSON = ''
const appDir = process.argv.slice(3) || sappPath.dirname(require.main.filename);

const check_image = ((messages) => {
  messages.forEach((message) => {
    var id = message.id + '.png'
    try {
      if (fs.existsSync(imagePath + id)) {
          console.log('file exists')
          message.photourl = `${appDir}/${imagePath}${id}`
          console.log('File saved under new URL: ', message.photourl)
        } else if (message.mediatype == 'photo') {
          download_image(message.photourl, imagePath + id);
          message.photourl = `${appDir}/${imagePath}${id}`
          console.log('File saved under new URL: ', message.photourl)
        }
    } catch(err) {
      console.error(err)
    } 
  })
  //json = "W"
  return messages
});

  

const download_image = (url, filename) => {
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(filename))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
)};

app.get('/:onScreenPath1/:onScreenPath2', async (req, res) => {
  try {
    onScreenPath = req.params.onScreenPath1 + '/' + req.params.onScreenPath2
    // console.log(onScreenPath)
    var newJson = await axios.get(`https://send.on-screen.info/api/${onScreenPath}`).then( resp => {
      var json = resp.data
      //onsole.log('OLD_DATA', json)
      var oldMessages = json.project.messages
      //console.log('OLD_MESSAGES', oldMessages)
      newMessages = check_image(oldMessages)
      json.project.messages = newMessages
      return json
    });

    //data = JSON.stringify(newJson)

    res.status(200).send(newJson)
  } catch (e) {
    res.status(404).send()
  }
    
//     
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`You find the "downloads"-folder at ${appDir}, may you have to create this folder first `);
    console.log(`In VENTUZ replace "https://send.on-screen.info/api/" with "localhost:${port}/"`);
}) 
