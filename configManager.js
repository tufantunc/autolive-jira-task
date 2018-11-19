require('console-error');
require('console-success');
const fs = require('fs');
const isUrl = require('is-url');

class ConfigManager {
    constructor() {
        let config;
        try {
            config = require('./config.json');
        } catch(err) {
            config = null;
        }
        this.config = config || null;
    }

    status() {
        const errorList = [];
        if(!this.config.hasOwnProperty('login') || this.config.login.trim() === "") {
            errorList.push('Login bilgisi bulunamadı');
        }
        if(!this.config.hasOwnProperty('jiraUrl') || this.config.jiraUrl.trim() === "") {
            errorList.push('Jira url bulunamadı');
        } else if(!isUrl(this.config.jiraUrl)) {
            errorList.push('Jira url hatalı formatta kayıt edilmiş!');
        }

        if(errorList.length > 0) {
            errorList.forEach(errText => {
                console.error(errText);
            });
            return false;
        }
        return true;
    }

    get() {
        return this.config;
    }

    set(options) {
        const config = this.config ? this.config : {};

        config.login = Buffer.from(options.login || config.login).toString('base64');
        config.jiraUrl = options.jiraUrl || config.jiraUrl;

        fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8', (err) => {
            if(err) {
                console.error('Ayar dosyası kayıt edilemedi!', err);
                return;
            }
            console.success('Ayarlar başarıyla kayıt edildi.');
        });
        this.config = config;
    }
}

module.exports = ConfigManager;