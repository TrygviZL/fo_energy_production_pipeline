var https = require('https');

// Primary handler function for lambda to pull data
exports.handler = async function(event) {
    return httprequest().then((data) => {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    return response;
    });
};

// Function to call API and return data
function httprequest() {
     return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.sev.fo',
            path: '/api/realtimemap/now',
            method: 'GET'
        };
        const req = https.request(options, (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
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
        req.on('error', (e) => {
          reject(e.message);
        });
        // send the request
       req.end();
    });
}