const http = require('http');
const fs = require('fs');
const csv=require('csvtojson')
const AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();
AWS.config.update({region: 'eu-west-1'});


// Primary handler function for lambda to pull data
exports.handler = async function(event){
    console.log("request:", JSON.stringify(event, undefined, 2));

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
    


}