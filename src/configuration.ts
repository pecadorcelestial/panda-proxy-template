let configuration: any = {};
let environment: string = process.env.NODE_ENV || 'development';

switch(environment.toLowerCase().trim()) {
    case 'development':
        configuration = require('./configuration/configuration.dev.json');
        break;
    case 'qa':
        configuration = require('./configuration/configuration.qa.json');
        break;
    case 'staging':
        configuration = require('./configuration/configuration.staging.json');
        break;
    case 'production':
        configuration = require('./configuration/configuration.prod.json');
        break;
    case 'local':
    default:
        configuration = require('./configuration/configuration.local.json');
        break;
}

export default configuration;