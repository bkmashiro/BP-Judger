import { NsJailConfig } from "src/jail/NsjailRush";

type JobType = 'run' | 'use';

export type Job = JobBase & ({
  use: string;
  with?: { [key: string]: string; };
} | {
  run: string;
});
export type JobBase = {
  name?: string;
  jail?: NsJailConfig;
  verbose?: boolean;
};

export type PipelineConfig = {
  jobs: Job[];
  constants?: { [key: string]: string; };
};
