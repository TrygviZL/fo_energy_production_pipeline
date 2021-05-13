# Faroe Islands Production data pipeline
This project was aimed at processing weather and energy production data from the Faroe Islands. The project originated from a discussion with a friend about how wind relates to energy production on the Faroes; after finding public API's for both the weather and energy data, the project was born.

## Weather data
The company which maintains the weather stations on the faroe islands is called Vorn. They have a webpage https://www.vedrid.fo where one can see historic and current weather data from each of the weather stations. Checking the API calls that the webpage does revealed the following endpoint:

http://vedrid.fo/Archive/WeatherStationMeasurements

| Field      | Type   | Description                                                                                                                                                   |
|------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| locationid | string | Location id for each of the weather stations which include: Torshavn: AWS310, Bordan: AWS315, Eidid: AWS314, Fugloy: AWS312, Mykines: AWS313, Suduroy: AWS311 |
| type       | string | Weather parameter such as 'windSpeed', 'windDirection and  'solarRadiation'                                                                                   |
| from       | string | Start date of call in format 'YYYY-MM-DD'                                                                                                                     |
| to         | string | End date of call in format 'YYYY-MM-DD'

Small project to pull data from public api https://www.sev.fo/api/realtimemap/now/ which returns the energy pruduction data of SEV, the Faroese energy company. The project is written in aws CDK and fully hosted on aws. 

## Useful commands
 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
