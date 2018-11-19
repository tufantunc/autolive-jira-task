require('console-success');
const program = require('commander');
const ConfigManager = require('./configManager');

const configManager = new ConfigManager();

program.option('-l, --login <username:password>', 'username:password formatında Jira kullanıcı adı ve parola')
    .option('-j, --jiraurl <jiraurl>', 'Jira url');

const options = program.parse(process.argv);
const newOption = {};

if(options.hasOwnProperty('login')) newOption.login = options.login;
console.log(newOption.login);
if(options.hasOwnProperty('jiraurl')) newOption.jiraUrl = options.jiraurl;

configManager.set(newOption);