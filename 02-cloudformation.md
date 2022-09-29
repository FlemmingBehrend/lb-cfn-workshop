# Cloudformation

_AWS CloudFormation lets you model, provision, and manage AWS and third-party resources by treating infrastructure as code._

## Hvordan virker CloudFormation

![CloudFormation](/images/cloudformation-01.png)

### CloudFormation Template

En tempalte kan skrives i enten json eller yaml. Jeg fortrækker selv yaml da syntaks er noget nemmere at læse.

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
# Metadata for templaten. Benyttes typisk til værktøjer som genererer CloudFormation templates
# som f.eks. AWS CDK eller CloudFormation Designer UI
Metadata: template metadata

# -- OPTIONAL --
# Specificere de inputs som CloudFormation templaten
Parameters: set of parameters

# -- OPTIONAL --
# Man kan specificere regler for sin template i denne sektion
# som f.eks. at hvis parameter
#   A = Week så skal parameter B > 1 og < 53
#   A = Day så skal parameter B = MON|TUE|WED|THU|FRI|SAT|SUN
# Jeg har godt nok aldrig haft brug for det!!
Rules: set of rules

# -- OPTIONAL --
# Kan bruges til at lave key/value pairs som kan bruges i andre sektioner
Mappings: set of mappings

# -- OPTIONAL --
# Her kan du lave betingelser som kan definere om andre dele af templaten skal køre.
# Man bruger navnet på betingelsen i "Condition" attributen i en resource.
Conditions: set of conditions

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
