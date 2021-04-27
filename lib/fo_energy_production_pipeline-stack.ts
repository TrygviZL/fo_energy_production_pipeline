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

    // Lambda function recource
    const SevPullLambda = new lambda.Function(this, 'PullData', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'pull_data.handler',
      environment: {
        TABLE_NAME: SevTable.tableName
      }
    });

    // Event rule to trigger lambda on schedule 
    const eventRule = new events.Rule(this, 'scheduleRule', {
      schedule: events.Schedule.cron({ minute: '/3'}),
    });
    eventRule.addTarget(new targets.LambdaFunction(SevPullLambda))

    // Grant write to lambda
    SevTable.grantWriteData(SevPullLambda);
  }
}
