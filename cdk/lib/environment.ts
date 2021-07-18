export enum Environments {
  PROD = 'production',
  STAGING = 'staging'
};

interface EnvironmentParameter {
  variables: { [key: string]: any };
  cpu: number;
  memory: number;
  desiredCount: number;
}

const EnvironmentSettings: { [key: string]: EnvironmentParameter } = {
  [Environments.STAGING]: {
    variables: {
      ADDR: ":8080",
      DATABASE_URL:
        "postgres://postgres:password@gotemp-staging.hoge.ap-northeast-1.rds.amazonaws.com:5432/gotemp?sslmode=disable",
    },
    cpu: 256,
    memory: 512,
    desiredCount: 1,
  },
  [Environments.PROD]: {
    variables: {
      ADDR: ":8080",
      DATABASE_URL:
      "postgres://postgres:password@gotemp-production.hoge.ap-northeast-1.rds.amazonaws.com:5432/gotemp?sslmode=disable",
    },
    cpu: 256,
    memory: 512,
    desiredCount: 2,
  },
};

export function variablesOf(env: Environments): EnvironmentParameter {
  return EnvironmentSettings[env];
}
