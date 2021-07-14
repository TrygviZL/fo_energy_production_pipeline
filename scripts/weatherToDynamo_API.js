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
const type = 'windSpeed';

// Default start end end times
const Start = '2021-04-30';
const End = '2021-05-01';

// url for downloading the file
const host = `http://vedrid.fo`
const apiPath = `http://vedrid.fo/Archive/WeatherStationMeasurements?type=${type}&locationId=${Location.torshavn}&from=${Start}&to=${End}`


// Function to call API and return data
function httprequest() {
    return new Promise((resolve, reject) => {
       const req = http.request(apiPath, (res) => {
           var body = [];
           res.on('data', function(chunk) {
               body.push(chunk);
           });
           res.on('end', function() {
               try {
                   body = JSON.parse(Buffer.concat(body).toString());
               } catch(e) {
                   reject(e);
               }
               resolve(body);
           });
       });
       // send the request
      req.end();
   });
}


// Todo test function and expand for other locations

// function to pull data, prepare into JSON object and put into DynamoDB
async function parseVornData(){
        httprequest().then((data)=>{
            var read = JSON.parse(read);
            console.log(read)
        })
    };


    parseVornData()
