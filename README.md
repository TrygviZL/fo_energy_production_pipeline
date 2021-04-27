# Faroe Islands Production data pipeline
Small project to pull data from public api https://www.sev.fo/api/realtimemap/now/ which returns the energy pruduction data of SEV, the Faroese energy company. The project is written in aws CDK and fully hosted on aws. 

## Useful commands
 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
