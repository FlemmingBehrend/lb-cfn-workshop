# Cloudformation

_AWS CloudFormation lets you model, provision, and manage AWS and third-party resources by treating infrastructure as code._

## Hvordan virker CloudFormation

![CloudFormation](/images/cloudformation-01.png)

## CloudFormation Template

En tempalte kan skrives i enten json eller yaml. Jeg fortrækker yaml.

En template er bygget op i sektioner hvor hver sektion har et specifikt formål

```yaml
# -- OPTIONAL --
# Denne del af en template fortæller hvilken engine som håndtere den
# Den ændre som i kan se ikke tit, men giver AWS mulighed for at introduksere breaking changes
AWSTemplateFormatVersion: "2010-09-09"

# -- OPTIONAL --
# En beskrivelse af templaten som vises i CloudFormation console UI
Description: String

# -- OPTIONAL --
# Specificere de inputs som CloudFormation templaten
Parameters: set of parameters

# -- OPTIONAL --
# Kan bruges til at lave key/value pairs som kan bruges i andre sektioner
Mappings: set of mappings

# -- OPTIONAL --
# Her kan du lave betingelser som kan definere om andre dele af templaten skal køre.
# Man bruger navnet på betingelsen i "Condition" attributen i en resource.
Conditions: set of conditions

# -- OPTIONAL --
# Man kan specificere regler for sin template i denne sektion
# som f.eks. at hvis parameter
#   A = Week så skal parameter B > 1 og < 53
#   A = Day så skal parameter B = MON|TUE|WED|THU|FRI|SAT|SUN
# Jeg har godt nok aldrig haft brug for det!!
Rules: set of rules

# -- OPTIONAL --
# Metadata for templaten. Benyttes typisk til værktøjer som genererer CloudFormation templates
# som f.eks. AWS CDK eller CloudFormation Designer UI
Metadata: template metadata

# -- OPTIONAL --
# Man kan skrive sine egne CloudFormation macro'er som kan behandle templaten.
# De specificeres her og køres i den rækkefølge som de er specificeret.
Transform: set of transforms

# -- REQUIRED --
# Her specificeres de resourcer som skal oprettes
# Dette er den eneste sektion som er required
Resources: set of resources

# -- OPTIONAL --
# CloudFormation stacks kan have outputs som kan bruges af andre stacks
# eller til at eksponere data fra stacken
Outputs: set of outputs
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html

### Pseudo parameters

CloudFormation tilbyder en række pseudo parameters som kan bruges i templaten.

Her er de mest almindelige:

```yaml
# Account ID for den AWS account som stacken er oprettet i
Outputs:
  MyStacksRegion:
    Value: !Ref "AWS::AccountId"
```

```yaml
# Region for den AWS region som stacken er oprettet i
Outputs:
  MyStacksRegion:
    Value: !Ref "AWS::Region"
```

```yaml
# Kan bruges som null værdi i en if Fn::If hvis der ikke skal oprettes en resource f.eks.
AWS::NoValue
```

Udover de ovenstående er der nogle flere pseudo parameters som kan bruges i templaten. Se dem her:

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html

### Parameters

Parameter er inputs til templaten. De kan bruges til at styre hvilke resourcer der skal oprettes og hvordan de skal konfigureres.

Eksempel:

```yaml
Parameters:
  EnvironmentType:
    Type: String
    Default: Staging
    AllowedValues:
      - Staging
      - Production
    Description: The type of the environment
  Version:
    Type: String
    Default: 1.0.0
    Description: The version of the application deployed with this stack
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html

### Mappings

Example:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Mappings:
  RegionMap:
    us-east-1:
      HVM64: ami-0ff8a91507f77f867
      HVMG2: ami-0a584ac55a7631c0c
    us-west-1:
      HVM64: ami-0bdb828fd58c52235
      HVMG2: ami-066ee5fd4a9ef77f1
    eu-west-1:
      HVM64: ami-047bb4163c506cd98
      HVMG2: ami-0a7c483d527806435
    ap-northeast-1:
      HVM64: ami-06cd52961ce9f0d85
      HVMG2: ami-053cdd503598e4a9d
    ap-southeast-1:
      HVM64: ami-08569b978cc4dfa10
      HVMG2: ami-0be9df32ae9f92309
Resources:
  myEC2Instance:
    Type: "AWS::EC2::Instance"
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", HVM64]
      InstanceType: m1.small
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/mappings-section-structure.html

### Conditions

```yaml
Conditions:
  CreateProdResources: !Equals
    - !Ref EnvironmentType
    - production
Resources:
  Bucket:
    Type: "AWS::S3::Bucket"
    Condition: CreateProdResources
    Properties:
      BucketName: "ProdBucket"
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html

### Rules

```yaml
Rules:
  stagingInstanceType:
    RuleCondition: !Equals
      - !Ref EnvironmentType
      - staging
    Assertions:
      - Assert:
          "Fn::Contains":
            - - a1.medium
            - !Ref InstanceType
        AssertDescription: "For a test environment, the instance type must be a1.medium"
  prodInstanceType:
    RuleCondition: !Equals
      - !Ref EnvironmentType
      - production
    Assertions:
      - Assert:
          "Fn::Contains":
            - - a1.large
            - !Ref InstanceType
        AssertDescription: "For a production environment, the instance type must be a1.large"
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html

### Metadata

Metadata er en beskrivelse af templaten og indgår ikke som en resource i stacken. Det vil derfor ikke være muligt at opdatere Metadata i en eksisterende stack uden også at opdatere en resource i stacken.

```yaml
Metadata:
  Instances:
    Description: "Information about the instances"
  Databases:
    Description: "Information about the databases"
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html

### Transform

Transform er en sektion som beskriver de transformationer som templaten går igennem. Man kan skrive macro'er som defineres her i transform sektionen.

En macro er en lambda funktion som behandler en del af templaten og returnere output som bruges i change settet.

![cloudformation_macro](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/images/template-macro-use.png)

```yaml
Transform:
  - MyMacro (Køres først)
  - 'AWS::Serverless' (Køres sidst)
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html

### Resources

Resources er den vigtigste sektion i templaten. Her defineres alle de resourcer som skal oprettes i stacken.

Der er mange forskellige resourcer som kan oprettes i CloudFormation. Se dem her:

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html

Eksempel på en bucket, en dynamodb table og en lambda function:

```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: MyBucket
  MyTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: MyTable
      AttributeDefinitions:
        - AttributeName: "Id"
          AttributeType: "S"
  MyFunction:
    Type: AWS::Lambda::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs12.x
      Code:
        ZipFile: |
          exports.handler = function(event, context) {
              console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));
              consle.log(");
              return {
                  statusCode: 200,
                  body: `The table name is: ${process.env.TABLE_NAME}`
              };
          }
      Environment:
        Variables:
          TABLE_NAME: !Ref MyTable
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html

### Outputs

Outputs er en sektion som definerer output fra stacken. Output kan bruges til at referere til resourcer i andre stacks eller til at eksponere værdier fra stacken.

```yaml
Outputs:
  BucketName:
    Description: "Name of the S3 bucket"
    Value: !Ref MyBucket
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html
