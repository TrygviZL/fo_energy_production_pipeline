const http = require('http');
const fs = require('fs');
const csv=require('csvtojson')

// Location codes used in the api call
const Location = {
    torshavn: 'AWS310',
    bordan: 'AWS315',
    eidi: 'AWS314',
    fugloy: 'AWS312',
    mykines: 'AWS313',
    suduroy: 'AWS311'
}

// Default start end end times
const Start = '2021-04-30';
const End = '2021-05-01';

// url for downloading the file
const URL = `http://vedrid.fo/Archive/Download?locationId=${Location.torshavn}&from=${Start}&to=${End}`

// TODO: teplace with "/tmp" when moving into lambda function
const path = 'C:/Users/Trygvi/Downloads/test5.csv'

// Function to create write stream to file in path
async function downloadVorn(url, dest) {
  return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);

      const request = http.get(url, response => {
          if (response.statusCode === 200) {
              response.pipe(file);
          } else {
              file.close();
              fs.unlink(dest, () => {}); // Delete temp file
              reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
          }
      });
      request.on("error", err => {
          file.close();
          fs.unlink(dest, () => {}); // Delete temp file
          reject(err.message);
      });

      file.on("finish", () => {
          resolve(path);
      });
  });
}


async function parseVornData(){
  downloadVorn(URL,path)
  .then((filepath)=>{
    return csv({delimiter: ';'}).fromFile(filepath)
  })
  .then((weatherData)=>{
    var Items = []

    weatherData.map(function(obs){
      let Item = {
        date: obs.DateTime.split(" ")[0],
        time: obs.DateTime.split(" ")[1],
        WindSpeed: obs.WS,
        WindDirection: obs.WD,
        Temperature: obs.TAAVG1M
      }
      Items.push(Item)
    })
    console.log(Items)
  })
}

parseVornData()
