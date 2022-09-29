# Cloudformation

*AWS CloudFormation lets you model, provision, and manage AWS and third-party resources by treating infrastructure as code.*

## Hvordan virker CloudFormation

![CloudFormation](/images/cloudformation-01.png)

### CloudFormation Template

En tempalte kan skrives i enten json eller yaml. Jeg fortrækker selv yaml da syntaks er noget nemmere at læse.

En template er bygget op i sektioner hvor hver sektion har et specifikt formål

```yaml
# Denne del af en template fortæller hvilken engine som håndtere den
# Den ændre som i kan se ikke tit, men giver AWS mulighed for at introduksere breaking changes
AWSTemplateFormatVersion: "2010-09-09"

# En beskrivelse af templaten som vises i CloudFormation console UI
Description:
  String

# Metadata for templaten. Benyttes typisk til værktøjer som genererer CloudFormation templates
# som f.eks. AWS CDK eller CloudFormation Designer UI
Metadata:
  template metadata

# Specificere de inputs som CloudFormation templaten
Parameters:
  set of parameters

Rules:
  set of rules

Mappings:
  set of mappings

Conditions:
  set of conditions

Transform:
  set of transforms

Resources:
  set of resources

Outputs:
  set of outputs
```

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html


