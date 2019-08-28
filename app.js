
const express = require('express');
const app = express();
const appPath = require('path');
const querystring = require('querystring');
const ip = require('ip');
const fs = require('fs');
const axios = require('axios');
const args = process.argv.slice(2)

const ipAddress = ip.address()
const port = process.env.PORT || args[0] || 3000

const dir = appPath.sep + 'downloads' +  appPath.sep;

const fullPath = process.execPath
const lastIndex = fullPath.lastIndexOf(appPath.sep);

const outPath = fullPath.substring(0, lastIndex);


const appDir = args[1] || outPath; 
const dnlDir = appDir + dir

if (!fs.existsSync(dnlDir)){
  fs.mkdirSync(dnlDir);
}

const checkImages = (messages) => {
  messages.forEach((message) => {
    var filename =dnlDir + message.id + '.png'
    try {
      if (message.mediatype == 'photo' && fs.existsSync(filename)) {
          console.log('File already exists under URL: ', filename)
          message.photourl = filename
        } else if (message.mediatype == 'photo') {
          message.photourl = downloadImage(message.photourl, filename);
        }
    } catch(err) {
      console.error(err)
    } 
  })
  //json = "W"
  return messages
};

  

const downloadImage = (adr, filename) => {
  axios({ adr, responseType: 'stream',})
  .then(
    response => new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(filename))
        .on('finish', () => {
          resolve()
          console.log('File saved under new URL: ', filename)
          return filename
        })
        .on('error', e => reject(e));

    }),
  ).catch((e) => {
    console.error(`Cannot write file ${filename} from ${adr}!`);
    return adr
  });
};



app.get('/:onScreenPath1/:onScreenPath2/', async (req, res) => {
  
  onScreenPath = `https://send.on-screen.info/api/${req.params.onScreenPath1 + '/' + req.params.onScreenPath2}`
  const qString = querystring.stringify(req);
  const orgUrl = querystring.parse(qString).originalUrl
  var page = orgUrl.split("=").pop();
  if (page == '' || isNaN(page)) {
    page = 1
  }
  var notFound = false
  do {
    try {
      var newJson = await axios.get(`${onScreenPath}?page=${page}`).then( resp => {
      var json = resp.data
      var oldMessages = json.project.messages
      console.log('on ', `${onScreenPath}?page=${page}`)
      newMessages = checkImages(oldMessages)
      json.project.messages = newMessages
      page++
      return json
      });
      res.status(200).send(newJson)
    } catch (e) {
      notFound = true
      res.status(404).send()
    } 
  } while (notFound != true)
});

app.get('/', async (req, res) => {
  console.log('RUNNING')
});

app.listen(port, () => {
    console.log(`In VENTUZ replace "https://send.on-screen.info/api/" with "${ipAddress}:${port}/".`);
    console.log(`You find the "downloads"-folder at "${dnlDir}".`);
}) 
