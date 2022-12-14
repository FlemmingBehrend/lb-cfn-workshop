# Cloudformation

_AWS CloudFormation lets you model, provision, and manage AWS and third-party resources by treating infrastructure as code._

## Hvordan virker CloudFormation

![CloudFormation](/images/cloudformation-01.png)

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html

## CloudFormation Template

En template kan skrives i enten JSON eller YAML. Eksempler i denne workshop bliver skrevet i YAML.

En template er bygget op i sektioner hvor hver sektion har et specifikt formål

```yaml
# -- OPTIONAL --
# Denne del af en template fortæller, hvilken engine som håndterer den
# Den ændres, som I kan se, ikke tit, men giver AWS mulighed for at introducere breaking changes
AWSTemplateFormatVersion: '2010-09-09'

# -- OPTIONAL --
# En beskrivelse af templaten, som vises i CloudFormation console UI
Description: String

# -- OPTIONAL --
# Specificerer de inputs, som CloudFormation templaten benytter
Parameters: set of parameters

# -- OPTIONAL --
# Kan bruges til at lave key/value pairs, som kan bruges i andre sektioner
Mappings: set of mappings

# -- OPTIONAL --
# Her kan du lave betingelser, som kan definere om andre dele af templaten skal køre.
# Man bruger navnet på betingelsen i "Condition" attributten i en resource.
Conditions: set of conditions

# -- OPTIONAL --
# Man kan specificere regler for sin template i denne sektion
# som f.eks. at hvis parameter
#   A = Week så skal parameter B > 1 og < 53
#   A = Day så skal parameter B = MON|TUE|WED|THU|FRI|SAT|SUN
# Jeg har godt nok aldrig haft brug for det!!
Rules: set of rules

# -- OPTIONAL --
# Metadata for templaten. Benyttes typisk til værktøjer, som genererer CloudFormation templates
# som f.eks. AWS CDK eller CloudFormation Designer UI
Metadata: template metadata

# -- OPTIONAL --
# Man kan skrive sine egne CloudFormation macro'er, som kan behandle templaten.
# De specificeres her og køres i den rækkefølge, som de er specificeret.
Transform: set of transforms

# -- REQUIRED --
# Her specificeres de resourcer, som skal oprettes
# Dette er den eneste sektion, som er required
Resources: set of resources

# -- OPTIONAL --
# CloudFormation stacks kan have outputs, som kan bruges af andre stacks
# eller til at eksponere data fra stacken
Outputs: set of outputs
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html

### Pseudo parameters

CloudFormation tilbyder en række pseudo parameters, som kan bruges i templaten.

Her er de mest almindelige:

```yaml
# Account ID for den AWS account som stacken er oprettet i
Outputs:
  MyStacksRegion:
    Value: !Ref 'AWS::AccountId'
```

```yaml
# Region for den AWS region som stacken er oprettet i
Outputs:
  MyStacksRegion:
    Value: !Ref 'AWS::Region'
```

```yaml
# Kan bruges som null værdi i en if Fn::If hvis der ikke skal oprettes en resource f.eks.
AWS::NoValue
```

Udover de ovenstående er der nogle flere pseudo parameters, som kan bruges i templaten. Se dem her:

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html

### Resources

Resources er den eneste sektion i en template, som er `Required`. Her defineres alle de resourcer, som skal oprettes i stacken.

En AWS resource har altid en type med format `AWS::ProductIdentifier::ResourceType`. F.eks. `AWS::EC2::Instance` eller `AWS::S3::Bucket`.

Til hver resource type er der en række attributer, som kan sættes. Disse attributter er specifikke for hver resource type.

Se dem her:

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
        - AttributeName: 'Id'
          AttributeType: 'S'
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

#### Afhængigheder mellem resourcer

En resource kan have en `DependsOn` attribut, som specificerer hvilke andre resourcer, den afhænger af.

I eksemplet herunder vil `MyFunction` ikke blive oprettet, før `MyTable` er oprettet.

```yaml
Resources:
  MyTable:
    Type: AWS::DynamoDB::Table
    Properties: ...

  MyFunction:
    Type: AWS::Lambda::Function
    DependsOn: MyTable
    Properties: ...
```

> Hvis en resource har en reference til en anden resource, som ikke er oprettet endnu, så vil CloudFormation vente med at oprette den resource, til den anden er oprettet. Det er derfor ikke nødvendigt at specificere `DependsOn` attributen.

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html

### Parameters

Parameters er inputs til templaten. De kan bruges til at styre hvilke resourcer, der skal oprettes, og hvordan de skal konfigureres.

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

Input parameterne kan valideres med regulære udtryk.

```yaml
Parameters:
  EnvironmentType:
    Type: String
    Default: Staging
    AllowedPattern: "^(Staging|Production)$"
    Description: The type of the environment
  Version:
    Type: String
    Default: 1.0.0
    AllowedPattern: "^\d+\.\d+\.\d+$"
    Description: The version of the application deployed with this stack
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html

### Mappings

Mappings er key/value pairs, som kan bruges i templaten.

De kan f.eks. benyttes til at styre hvilke værdier, der skal bruges i forskellige regioner.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
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
    Type: 'AWS::EC2::Instance'
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref 'AWS::Region', HVM64]
      InstanceType: m1.small
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/mappings-section-structure.html

### Conditions

Man kan styre, om resourcer skal oprettes eller ej, vha. conditions.

Her vises et simpelt eksempel på en bucket, som kun oprettes, hvis input parameteren EnvironmentType er sat til `production`

```yaml
Conditions:
  CreateProdResources: !Equals
    - !Ref EnvironmentType
    - production
Resources:
  Bucket:
    Type: 'AWS::S3::Bucket'
    Condition: CreateProdResources
    Properties:
      BucketName: 'ProdBucket'
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html

### Rules

Regler kan oprettes, så der er afhængigheder på tværs af ens input parametre.

Dette eksempel definerer en regel på tværs af input parametrene EnvironmentType og InstanceType.

```yaml
Rules:
  stagingInstanceType:
    RuleCondition: !Equals
      - !Ref EnvironmentType
      - staging
    Assertions:
      - Assert:
          'Fn::Contains':
            - - a1.medium
            - !Ref InstanceType
        AssertDescription: 'For a test environment, the instance type must be a1.medium'
  prodInstanceType:
    RuleCondition: !Equals
      - !Ref EnvironmentType
      - production
    Assertions:
      - Assert:
          'Fn::Contains':
            - - a1.large
            - !Ref InstanceType
        AssertDescription: 'For a production environment, the instance type must be a1.large'
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html

### Metadata

Metadata er en beskrivelse af templaten og indgår ikke som en resource i stacken.

Vær opmærksom på, at det ikke er muligt at opdatere Metadata uden også at opdatere noget i stacken, som aktiverer en stack update.

```yaml
Metadata:
  Instances:
    Description: 'Information about the instances'
  Databases:
    Description: 'Information about the databases'
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html

### Transform

Transform er en sektion, som beskriver de transformationer, som templaten går igennem. Man kan skrive macro'er, som defineres her i transform sektionen.

En macro er en lambda funktion, som behandler en del af templaten og returnerer output, som bruges i change settet.

![cloudformation_macro](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/images/template-macro-use.png)

```yaml
Transform:
  - MyMacro (Køres først)
  - 'AWS::Serverless' (Køres sidst)
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html

### Outputs

Outputs er en sektion, som definerer output fra stacken. Output kan bruges til at referere til resourcer i andre stacks eller til at eksponere værdier fra stacken.

```yaml
Outputs:
  BucketName:
    Description: 'Name of the S3 bucket'
    Value: !Ref MyBucket
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html

## Intrinsic functions

AWS har udviklet en række funktioner, som kan bruges i templaten.

De kan bruges til at hente værdier, som først er tilgængelige, når stacken kører, eller til at hente værdier fra andre resourcer i stacken, f.eks. værdier fra [Mappings sektionen](#mappings).

Eksempler på intrinsic functions:

Hent arn på lambda function:  
`!GetAtt MyFunction.Arn`

Hent værdi fra en parameter:  
`!Ref MyParameter`

I dokumentationen for de forskillge resourcer kan man se, hvad `!Ref` refererer til som default.
For en S3 bucket er det f.eks. Bucket name.

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html

Join værdier sammen:  
`!Join [",", ["a", "b", "c"]]` > Output: a,b,c

Hent værdi fra en anden stack:  
`!ImportValue MyStackOutput`

```yaml
# Stack A
Outputs:
  LambdaArn:
    Description: 'Arn of lambda function used in stack B'
    Value: !Ref MyFunction.Arn
    Export:
      Name: 'MyFunctionArn'
```

I en anden stack vil I så kunne hente værdien fra stack A med følgende:

`!ImportValue MyFunctionArn`
Vær opmærksom på

- Du kan ikke slette en stak, hvis en anden stak refererer til en af ​​dens output.
- Du kan ikke ændre eller fjerne en outputværdi, der refereres til af en anden stak.
- Exported outputværdier kan kun bruges inden for samme region.

I kan læse mere om de forskellige intrinsic functions her:

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html

## Links

Forskellige snippets:

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/CHAP_TemplateQuickRef.html
