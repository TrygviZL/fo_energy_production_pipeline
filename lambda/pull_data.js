var https = require('https');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
AWS.config.update({region: 'eu-west-1'});



// Primary handler function for lambda to pull data
exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    httprequest().then((data)=>{
    
        const response = {
            statusCode: 200,
            body: JSON.stringify(data),
        };
        var parsed = JSON.parse(response.body)
    
        const params = {
            TableName: 'energyDataFO',
            Item: {
                'Date': {S: parsed.tiden.split(" ")[0]},
                'Time': {S: parsed.tiden.split(" ")[1]},
                'Oil': {N: parsed.OlieSev_E.replace(/,/g, '.')},
                'Water': {N: parsed.VandSev_E.replace(/,/g, '.')},
                'Wind': {N: parsed.VindSev_E.replace(/,/g, '.')},
                'Biogas': {N :parsed.BiogasSev_E.replace(/,/g, '.')},
                'Sun': {N: parsed.SolSev_E.replace(/,/g, '.')}
            }
        }

        dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
        })
    
    })
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


