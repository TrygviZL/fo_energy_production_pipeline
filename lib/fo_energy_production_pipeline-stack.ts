import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { RemovalPolicy } from '@aws-cdk/core';
import * as targets from '@aws-cdk/aws-events-targets'
import * as events from '@aws-cdk/aws-events'

export class FoEnergyProductionPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB for storing the SEV data. Note Removal policy
    const SevTable = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'Date',
        type: dynamodb.AttributeType.STRING
      },
      sortKey:{
        name: 'Time',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: 'energyDataFO'
    });

    // DynamoDB for storing the Vorn data. Note Removal policy
    // TODO: Add partition and sort key names
    const VornTable = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: '<>',
        type: dynamodb.AttributeType.STRING
      },
      sortKey:{
        name: '<>',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: 'weatherDataFO'
    });

    // Lambda function for pulling SEV data
    const SevPullLambda = new lambda.Function(this, 'PullDataSEV', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'pull_data_SEV.handler',
      environment: {
        TABLE_NAME: SevTable.tableName
      }
    });

    // Lambda resource for Vorn data
    const VornPullLambda = new lambda.Function(this, 'PullDataVorn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'pull_data_Vorn.handler',
      environment: {
        TABLE_NAME: VornTable.tableName
      }
    });


    // Event rule to trigger lambda on schedule 
    // TODO: Add eventrule to Vorn data lambda
    const eventRule = new events.Rule(this, 'scheduleRule', {
      schedule: events.Schedule.cron({ minute: '/3'}),
    });
    eventRule.addTarget(new targets.LambdaFunction(SevPullLambda))

    // Grant write access for lambda function
    SevTable.grantWriteData(SevPullLambda);
    VornTable.grantWriteData(VornPullLambda);
  }
}
