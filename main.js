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

const sdk = new boxSDK({
    clientID: appConfig.oauthClientId,
    clientSecret: appConfig.oauthClientSecret
})

http.createServer(exapp).listen(3000, function() {
    console.log('Server now listening on port 3000')
})

const filePath = './testfile.md'
const fileId = '352138361444'

let mainWindow;

// Listen for the app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({})
    // Load html into window
    mainWindow.loadURL('https://www.box.com')

    exapp.get('/start', function(req, res){
        const authUri = 'https://account.box.com/api/oauth2/authorize'
        const redirectUri = 'http://localhost:3000/return'
    
        const payload = {
            'response_type' : 'code',
            'client_id' : appConfig.oauthClientId,
            'redirect_uri' : redirectUri
        }
    
        const qs = querystring.stringify(payload)
        const authEndpoint = `${authUri}?${qs}`
    
        res.redirect(authEndpoint)
    })
    
    exapp.get('/return', function(req, res){
        const code = req.query.code
    
        sdk.getTokensAuthorizationCodeGrant(code, null, function(err, tokenInfo) {
            const client = sdk.getBasicClient(tokenInfo.accessToken)

            client.files.getReadStream(fileId)
                .then(readStream => {
                    let writeStream = fs.createWriteStream(filePath)
                    readStream.pipe(writeStream)
                    writeStream.on('finish', () => {
                        fs.appendFile(filePath, '\n\n ## New Version', function(error){
                            if (error) {
                                console.log(error)
                            }
                            console.log(filePath)
                            let inStream = fs.createReadStream(filePath)
                            client.files.uploadNewFileVersion(fileId, inStream)
                            .then(file => {
                                console.log(file)
                            })
                        })
                    })
                })
        })
    })

    function callback(err, res) {
        if(err) {
            console.log(err)
        }
        console.log(res)
    }
    
})
