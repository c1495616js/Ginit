const Octokit = require('@octokit/rest');
const Configstore = require('configstore');
const pkg = require('../package.json');
const _  = require('lodash');
const CLI = require('clui');

const inquirer = require('./inquirer');

const Spinner = CLI.Spinner;
const conf = new Configstore(pkg.name);

let octokit;

module.exports = {
  getInstance: () => {
    return octokit;
  },

  setGithubCredentials: async () => {
    const credentials = await inquirer.askGithubCredentials();
    
    octokit = new Octokit({
      auth: {
        username: credentials.username,
        password: credentials.password,
      }
    })
  },

  registerNewToken: async () => {
    const status = new Spinner('Authenticating you, please wait...');
    status.start();

    try {
      const response = await octokit.oauthAuthorizations.createAuthorization({
        scopes: ['user', 'public_repo', 'repo', 'repo:status'],
        note: 'ginits, the command-line tool for initializing Git repos',
      });
      const token = response.data.token;
      if (token) {
        conf.set('github.token', token);
        return token;
      } else {
        throw new Error('Missing Token', 'Github token was not found in the response');
      }
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  },

  githubAuth: (token) => {
    octokit = new Octokit({
      auth: token,
    })
  },

  getStoredGithubToken: () => {
    return conf.get('github.token');
  }
}
