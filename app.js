require('console-error');
require('console-success');
const fs = require('fs');
const shortid = require('shortid');
const request = require('request');

class App {
    constructor(tasklist, appConfig) {
        this.config = appConfig;
        this.tasks = tasklist;
        this.current = null;
        this.watcher;
        this.jira = "";
    }

    syncJobs() {
        const taskFile = require('./tasks.json');
        taskFile.forEach(task => {
            const localTask = this.tasks.find(item => item.id === task.id);
            if (!localTask) {
                this.tasks.push(task);
            }
        });
        this.tasks = this.tasks.filter(item => item.hasRemoved !== true);
        const tasklist = JSON.stringify(this.tasks, null, 2);
        fs.writeFileSync('./tasks.json', tasklist);
    }

    newTask(watchTask, liveTask) {
        const taskListHasLiveTask = element => element.liveTask === liveTask;
        if(this.tasks.some(taskListHasLiveTask)) {
            console.error('Bu task zaten Live\'a çekilmek üzere listede bekliyor.');
            return false;
        }
        this.tasks.push({
            id: shortid.generate(),
            watchTask,
            liveTask
        });
        this.syncJobs();
        console.success(`Yeni task başarıyla eklendi. İzleniyor: ${watchTask} - Live Yapılacak: ${liveTask}`);
        return true;
    }

    removeTask(taskId) {
        const taskItem = this.tasks.find(element => element.id === taskId);
        if(!taskItem) {
            console.error('Task bulunamadı!');
            return false;
        }

        taskItem.hasRemoved = true;
        this.syncJobs();
        return true;
    }

    getTaskStatus(task) {
        return new Promise((resolve,reject)=>{
            request({
                url: `${this.config.jiraUrl}/rest/api/latest/issue/${task}`,
                headers: {
                    "Authorization": `Basic ${this.config.login}`,
                    'Content-Type': 'application/json'
                },
                method: 'GET',
            }, function (error, response, body) {
                if(error) reject(error);
                resolve(JSON.parse(body).fields.status.name);
            });
        });
    }

    makeTaskStatusLive(task) {
        request({
            url: `${this.config.jiraUrl}/rest/api/latest/issue/${task}/transitions`,
            headers: {
                "Authorization": `Basic ${this.config.login}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: `{
                "transition": { 
                    "id": "171"
                }
            }`
        }, function (error, response, body) {
            if(error) console.error(error);
            if(response.statusCode == 204) console.success(`${task} başarıyla live yapıldı.`);
        });
    }

    setCurrentTask() {
        if(this.tasks.length > 0) {
            this.current = this.tasks[0];
            console.log(`Sıradaki task yenilendi. İzleniyor: ${this.current.watchTask} - Live Yapılacak: ${this.current.liveTask}`);
        } else {
            this.stopWatch();
        }
    }

    stopWatch() {
        this.current = null;
        clearTimeout(this.watcher);
        this.watcher = null;
    }

    startWatch() {
        if(this.current !== null && this.watcher !== null) {
            this.watcher = setInterval(()=> {
                getTaskStatus(this.current.liveTask).then(liveTaskStatus => {
                    if(liveTaskStatus !== 'Done') {
                        if(liveTaskStatus === 'LIVE') {
                            console.log(`${this.current.liveTask} statüsü zaten Live!`);
                        }
                    } else {
                        getTaskStatus(this.current.watchTask).then(watchTaskStatus => {
                            if(watchTaskStatus === 'Completed') {
                                this.makeTaskStatusLive(this.current.liveTask);
                                this.removeTask(this.current.id);
                                this.setCurrentTask();
                            }
                        });
                    }
                });
            }, 600000); //10 dakika
        }
    }
}

module.exports = App;