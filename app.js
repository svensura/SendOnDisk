
const express = require('express');
const app = express();
const appPath = require('path');
const ip = require('ip');
const fs = require('fs');
const axios = require('axios');
const args = process.argv.slice(2)

const ipAddress = ip.address()
const port = process.env.PORT || args[0] || 3000

const dir = appPath.sep + 'downloads' +  appPath.sep;

const fullPath = process.execPath
const lastIndex = fullPath.lastIndexOf(appPath.sep);

outPath = fullPath.substring(0, lastIndex);


const appDir = args[1] || outPath; 
//const appDir = args[1] || appPath.dirname(require.main.filename);
const dnlDir = appDir + dir

if (!fs.existsSync(dnlDir)){
  fs.mkdirSync(dnlDir);
}

const check_image = ((messages) => {
  messages.forEach((message) => {
    var id = message.id + '.png'
    try {
      if (fs.existsSync(dnlDir + id)) {
          message.photourl = `${dnlDir}${id}`
          console.log('File already exists under URL: ', message.photourl)
        } else if (message.mediatype == 'photo') {
          download_image(message.photourl, dnlDir + id);
          message.photourl = `${dnlDir}${id}`
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
    console.log(`In VENTUZ replace "https://send.on-screen.info/api/" with "${ipAddress}:${port}/".`);
    console.log(`You find the "downloads"-folder at "${dnlDir}".`);
}) 
