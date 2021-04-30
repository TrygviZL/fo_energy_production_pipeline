var https = require('https');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
AWS.config.update({region: 'eu-west-1'});

// Primary handler function for lambda to pull data
exports.handler = (event, context, callback) => {
    httprequest().then((data)=>{
        var read = JSON.stringify(data);
        console.log(read);

        var parsed = JSON.parse(read)

        // Build data object and update column names
        const params = {
            'TableName': 'energyDataFO',
            'Item': {
                'Date': {S: parsed.tiden.split(" ")[0]},
                'Time': {S: parsed.tiden.split(" ")[1]},
                'Oil_Sum': {N: parsed.OlieSev_E.replace(/,/g, '.')},
                'Water_Sum': {N: parsed.VandSev_E.replace(/,/g, '.')},
                'Wind_Sum': {N: parsed.VindSev_E.replace(/,/g, '.')},
                'Biogas_Sum': {N :parsed.BiogasSev_E.replace(/,/g, '.')},
                'Sun_Sum': {N: parsed.SolSev_E.replace(/,/g, '.')},
                'Wind_Neshagi': {N: parsed.NeVind_E.replace(/,/g, '.')},
                'Wind_Husahagi': {N: parsed.HhVind_E.replace(/,/g, '.')},
                'Wind_Porkeri': {N: parsed.PoVind_E.replace(/,/g, '.')},
                'Wind_Rokt': {N: parsed.RoVind_E.replace(/,/g, '.')},
                'Sun_Sumba': {N: parsed.SuSol_E.replace(/,/g, '.')}
            }
        }
        console.log('PARAMS: %j', params);

        // Insert dynamodb item
        return dynamodb.putItem(params).promise()
            .then(() => {
                console.log('Item inserted');
            })
            .catch((err) => {
                console.error(err);
            });
    })
        .then(v => callback(null, v), callback);
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

