#!/usr/bin/env node

const cp = require('child_process')
const path = require('path')

const service = cp.exec('yarn start', {
    cwd: path.join(__dirname, '..')
})

service.stdout.on('data', function (data) {
    console.log(data)
})

service.on('close', function () {
    console.log('sprite-generator closed')
})