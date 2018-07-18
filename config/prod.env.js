'use strict'
module.exports = {
    NODE_ENV: '"production"',
    API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
    API_TOKEN: JSON.stringify(process.env.API_TOKEN),
    THUNDERFOREST_API_KEY: JSON.stringify(process.env.THUNDERFOREST_API_KEY),
}
