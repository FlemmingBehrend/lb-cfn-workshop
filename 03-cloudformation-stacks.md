# CloudFormation Stacks

Når en template er blevet parsed af CloudFormation engine så er output et Change Set.

Et Change Set er en liste af ændringer som skal foretages i AWS.

Outputtet af et Change Set er en CloudFormation Stack.

## Forskellige måder at oprette en CloudFormation Stack

### AWS Management Console oprettelse (Manuel)

Når man opretter en stack igennem konsollen starter man en wizard.

![Stack01](./images/stacks.01.png)

Lad os prøve at oprette en simpel stack vi laver et Change Set, reviewer det og kører Change Set på kontoen.

Demo: https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/

### AWS CLI (Scripted)

AWS CLI er et kommandolinje værktøj til at interagere med AWS.

AWS CLI er et open source projekt og kan downloades fra https://aws.amazon.com/cli/

Example på hvordan vi kan oprette den samme stack som vi lavede igennem konsollen.

```bash
aws cloudformation create-stack \
  --stack-name simple-stack-cli \
  --template-body file://./examples/simple-stack.yaml
```

Tjek status på stacken og de resourcer vi har installeret.

```bash
aws cloudformation list-stack-resources --stack-name simple-stack-cli
```

### AWS SDK

TODO

### AWS CDK

TODO

noget omkring stack låsning ved brug af import / export
drift detection?
