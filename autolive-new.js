require('console-error');
require('console-success');
const program = require('commander');
const App = require('./app');
const taskList = require('./tasks.json');
const ConfigManager = require('./configManager');
const configManager = new ConfigManager();

if(!configManager.status()) {
    return;
}

const app = new App(taskList, configManager.get());

const options = program.parse(process.argv);

const watchTask = options.args[0];
const liveTask = options.args[1];

if(!watchTask || !liveTask) {
    console.error('Takip edilecek ve live\'a çekilecek taskları belirtmelisiniz!');
    return;
}

if(app.newTask(watchTask, liveTask)) {
    console.success('Task sıraya alındı.');
} else {
    console.error('Task oluşturulmadı.');
}
