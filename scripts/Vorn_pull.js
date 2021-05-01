const http = require('http');
const fs = require('fs');
const csv = require('csv-parser');

const Location = {
    torshavn: 'AWS310',
    bordan: 'AWS315',
    eidi: 'AWS314',
    fugloy: 'AWS312',
    mykines: 'AWS313',
    suduroy: 'AWS311'
}

const Start = '2021-04-30';
const End = '2021-05-01';

const URL = `http://vedrid.fo/Archive/Download?locationId=${Location.torshavn}&from=${Start}&to=${End}`

// TODO: teplace with "/tmp" when moving into lambda function
const path = 'C:/Users/Trygvi/Downloads/test3.csv'

function downloadVorn(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
      });
    }).on('error', function(err) { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
  };


downloadVorn(URL, path, function(err, cb){
    fs.createReadStream(path)
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
        console.log(row);
    })
    .on('end', () => {
         console.log('CSV file successfully processed');
  });
})


