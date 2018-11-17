const electron = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')

const boxSDK = require('box-node-sdk')
const appConfig = require('./config.js')
const exapp = require('express')();
const http = require('http')
const querystring = require('querystring')

const {app, BrowserWindow, Menu, Tray} = electron

let mainWindow;

// Listen for the app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({})
    // Load html into window
    mainWindow.loadURL('https://www.box.com')
})

exapp.get('/auth', function(req, res))