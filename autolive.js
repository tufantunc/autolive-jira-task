'use strict';
require('console-error');
const program = require('commander');
const version = require('./package.json').version;

program
    .version(version)
    .command('new <watchTask> <liveTask>', 'Live\'a taşımak için yeni bir task ekler')
    .command('list', 'Live\'a taşınmayı bekleyen task\'ları listeler')
    .command('current', 'Takip edilen taskı görüntüler')
    .command('remove <liveTask>', 'Taskı listeden çıkarır')
    .command('config', 'Ayarları günceller')
    .command('start', 'Listeye eklenen taskları izlemeye başlar.')
    .command('test', 'test')
    .parse(process.argv);

// if program was called with no arguments, show help.
if (program.args.length === 0) program.help();