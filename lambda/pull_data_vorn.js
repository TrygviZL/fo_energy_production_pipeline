const http = require('http');
const fs = require('fs');
const csv=require('csvtojson')
const AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();
AWS.config.update({region: 'eu-west-1'});


// Primary handler function for lambda to pull data
exports.handler = async function(event){
    console.log("request:", JSON.stringify(event, undefined, 2));

    


    

}