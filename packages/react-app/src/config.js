const convict = require('convict');

const config = convict({
    http: {
        port: {
            doc: 'The port to listen on',
            default: 3500,
            env: 'PORT'
        },
        ip:{
            doc: 'The address to listen on',
            default: 'http://localhost:3500/api/',
            env:'IP'
        }
    },
    media:{
        location:'./uploads/',
        url:'www.df.com/'
    }
});

config.validate();

module.exports = config;