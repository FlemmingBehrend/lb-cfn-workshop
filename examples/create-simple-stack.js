const AWS = require('aws-sdk');
const fs = require('fs');
const yaml = require('js-yaml');
const uuid = require('uuid').v4;
const { CLOUDFORMATION_SCHEMA } = require('js-yaml-cloudformation-schema');

const templateBucket = 'cf-templates-1gepawdf6haws-eu-west-1';

async function uploadTemplateToS3() {
  const file = fs.readFileSync(__dirname + '/simple-stack.yaml', 'utf8');
  const yamlDoc = yaml.load(file, { schema: CLOUDFORMATION_SCHEMA });
  const s3 = new AWS.S3();
  const fileName = `simple-stack-${uuid()}.yaml`;
  const params = {
    Bucket: templateBucket,
    Key: fileName,
    Body: JSON.stringify(yamlDoc)
  };
  await s3.putObject(params).promise();
  return fileName;
}

async function createStack(fileName) {
  const cfn = new AWS.CloudFormation({ region: 'eu-west-1' });
  const params = {
    StackName: 'simple-stack-sdk',
    TemplateURL: `https://s3-eu-west-1.amazonaws.com/${templateBucket}/${fileName}`,
    Parameters: [
      {
        ParameterKey: 'BucketName',
        ParameterValue: `simple-stack-sdk-${uuid()}`
      }
    ]
  };
  await cfn.createStack(params).promise();
}

async function main() {
  const fileName = await uploadTemplateToS3();
  await createStack(fileName);
}

main();
