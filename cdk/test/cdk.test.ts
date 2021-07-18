import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Cdk from '../lib/gotemp-stack';
import * as environment from "../lib/environment";

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Cdk.GotempStack(
      app,
      'MyTestStack',
      environment.Environments.STAGING
    );
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
