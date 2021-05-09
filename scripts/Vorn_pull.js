// Script to call weather data from specific location and time interval
// and push the data to DynamoDB. The current implementation will create
// a new table for each location.


const http = require('http');
const fs = require('fs');
const csv=require('csvtojson')
const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
var dynamodb = new AWS.DynamoDB();


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

// path for temporary file. Paths is ignored by Git
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

// Todo test function and expand for other locations

// function to pull data, prepare into JSON object and put into DynamoDB
async function parseVornData(){
  downloadVorn(URL,path)
  .then((filepath)=>{
    return csv({delimiter: ';'}).fromFile(filepath)
  })
  .then((weatherData)=>{
    weatherData.map(function(obs){

      // Build data object and update column names
      const params = {
        'TableName': table+'_'+Location.torshavn,
        'Item': {
            'date': {S: obs.DateTime.split(" ")[0]},
            'time': {S: obs.DateTime.split(" ")[1]},
            'WindSpeed': {N: obs.WS.replace(/,/g, '.')},
            'WindDirection': {N: obs.WD.replace(/,/g, '.')},
            'Temperature': {N: obs.TAAVG1M.replace(/,/g, '.')}
        }
    }
    console.log('PARAMS: %j', params);

    // Push data to dynamo
    return dynamodb.putItem(params).promise()
            .then(() => {
                console.log('Item inserted');
            })
            .catch((err) => {
                console.error(err);
            });
    })
  })
}


parseVornData()
