var https = require('https');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
AWS.config.update({region: 'eu-west-1'});


exports.handler = (event) =>{
    console.log("request:", JSON.stringify(event, undefined, 2));

    var params = GetAndParseSEVdata()

    console.log('PARAMS: %j',params)

    // Insert dynamodb item
    return dynamodb.putItem(params).promise()
    .then(() => {
        console.log('Item inserted');
    })
    .catch((err) => {
        console.error(err);
    });
}

async function GetAndParseSEVdata() {
    const options = {
        hostname: 'www.sev.fo',
        path: '/api/realtimemap/now',
        method: 'GET'
    }
    const SEVdataraw = await getSEVdata(options)
    return parseSEVdataToDynamo(SEVdataraw)
}

async function getSEVdata(options){
    return new Promise((resolve) =>{
        https.request(options, res => {
            let data = []
            res.on("data", d => {
                data.push(d)
            })
            res.on("end", () => {
                data = Buffer.concat(data).toString()
                resolve(data)
            })
        }).end()
    })
}

function parseSEVdataToDynamo(data){
    var parsed = JSON.parse(data)
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
    return params
}