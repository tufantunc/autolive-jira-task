require('console-error');
require('console-success');
const App = require('./app');
const taskList = require('./tasks.json');
const ConfigManager = require('./configManager');
const configManager = new ConfigManager();

if(!configManager.status()) {
    return;
}

const app = new App(taskList, configManager.get());

app.setCurrentTask();

app.startWatch();