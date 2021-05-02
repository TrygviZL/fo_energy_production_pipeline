const http = require('http');
const fs = require('fs');
const csv=require('csvtojson')
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
AWS.config.update({region: 'eu-west-1'});

// Location codes used in the api call
const Location = {
    torshavn: 'AWS310',
    bordan: 'AWS315',
    eidi: 'AWS314',
    fugloy: 'AWS312',
    mykines: 'AWS313',
    suduroy: 'AWS311'
}

// Target DynamoDB table
const table = 'weatherDataFO';

// Default start end end times
const Start = '2021-04-30';
const End = '2021-05-01';

// url for downloading the file
const URL = `http://vedrid.fo/Archive/Download?locationId=${Location.torshavn}&from=${Start}&to=${End}`

// path for temporary file. Pats is ignored by Git
const path = './tmp/vorn_data.csv'

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

// function to pull data, prepare into JSON object and put into DynamoDB
async function parseVornData(){
  downloadVorn(URL,path)
  .then((filepath)=>{
    return csv({delimiter: ';'}).fromFile(filepath)
  })
  .then((weatherData)=>{
    var Items = []

    weatherData.map(function(obs){

      // Build data object and update column names
      const params = {
        'TableName': table,
        'Item': {
            'Date': {S: obs.DateTime.split(" ")[0]},
            'Time': {S: obs.DateTime.split(" ")[1]},
            'WindSpeed': {N: obs.WS},
            'WindDirection': {N: obs.WD},
            'Temperature': {N: obs.TAAVG1M}
        }
    }
    console.log('PARAMS: %j', params);
    addData(params)
    })
  })
}

function addData(params) {
  // Insert dynamodb item
  return dynamodb.putItem(params).promise()
  .then(() => {
      console.log('Item inserted');
  })
  .catch((err) => {
      console.error(err);
  });
}

parseVornData()
