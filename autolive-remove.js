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

const liveTask = options.args[0];

if(!liveTask) {
    console.error('Silinecek taskı belirtmeniz gerekiyor!');
    return;
}

if(app.removeTask(liveTask)) {
    console.success('Task silindi.');
} else {
    console.error('Task silinemedi!');
}
