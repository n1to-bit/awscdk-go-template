#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as environment from "../lib/environment";
import { GotempStack } from '../lib/gotemp-stack';

const app = new cdk.App();

const env: environment.Environments = app.node.tryGetContext("env") as environment.Environments;
if (!env || !environment.variablesOf(env))
  throw new Error("Invalid target environment");

new GotempStack(app, `GotempStack-${env}`, env);
