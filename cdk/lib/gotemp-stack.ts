import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";
import * as environment from "./environment";
import { FargatePlatformVersion } from "@aws-cdk/aws-ecs";

export class GotempStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    env: environment.Environments,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const environmentSettings = environment.variablesOf(env);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
    });

    const executionRole = new iam.Role(this, "EcsTaskExecutionRole", {
      roleName: `ecs-task-execution-role-${env}`,
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy"
        ),
      ],
    });

    const taskRole = new iam.Role(this, "EcsServiceTaskRole", {
      roleName: `ecs-service-task-role-${env}`,
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    const logGroup = new logs.LogGroup(this, "ServiceLogGroup", {
      logGroupName: `gotemp/${env}`,
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
      clusterName: `gotemp-${env}-cluster`,
    });

    const repository = ecr.Repository.fromRepositoryName(
      this,
      "gotemp",
      "gotemp"
    );

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        executionRole: executionRole,
        taskRole: taskRole,
      }
    );

    taskDefinition
      .addContainer("api", {
        image: ecs.ContainerImage.fromEcrRepository(repository),
        environment: environmentSettings.variables,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: "gotemp",
          logGroup,
        }),
      })
      .addPortMappings({
        containerPort: 8080,
        hostPort: 8080,
        protocol: ecs.Protocol.TCP,
      });

    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "Service",
      {
        cluster,
        cpu: environmentSettings.cpu,
        memoryLimitMiB: environmentSettings.memory,
        desiredCount: environmentSettings.desiredCount,
        taskDefinition: taskDefinition,
        platformVersion: FargatePlatformVersion.VERSION1_4,
        maxHealthyPercent: 200,
        minHealthyPercent: 50,
      }
    );

    loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/health_check",
    });
  }
}
