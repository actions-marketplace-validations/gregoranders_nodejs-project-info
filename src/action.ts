import * as core from '@actions/core';

import { readFile, realpath } from 'fs';

import * as SemVer from 'semver/functions/valid';

const valid = SemVer as (value: string) => boolean;

import { PackageJSON } from './package-json';

const readfile = async (path: string) => {
  return new Promise<string>((resolve, reject) => {
    readFile(path, (error: NodeJS.ErrnoException | null, buffer: Buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer.toString());
      }
    });
  });
};

const resolvePath = (path: string) => {
  return new Promise<string>((resolve, reject) => {
    realpath(path, (error: NodeJS.ErrnoException | null, resolved: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(resolved);
      }
    });
  });
};

export const run = async () => {
  const path = core.getInput('path', { required: false }) || './package.json';

  try {
    const resolved = await resolvePath(path);
    const buffer = await readfile(resolved);
    const package_ = JSON.parse(buffer) as PackageJSON;

    if (!package_.version) {
      throw new Error(`Missing version`);
    }

    if (!valid(package_.version)) {
      throw new Error(`Invalid version ${package_.version}`);
    }

    core.setOutput('name', package_.name);
    core.setOutput('version', package_.version);
    core.setOutput('context', buffer);
  } catch (error) {
    core.setFailed(error);
  }
};
