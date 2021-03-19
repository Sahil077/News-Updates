const electron = require('electron');
const url = require("url");
const path = require("path");
var unirest = require("unirest");
var moment = require('moment');
const { app, BrowserWindow , Menu , ipcMain} = electron;

let mainWindow;




app.on('ready' , () =>{
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false,
        }
    })
    
    

    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname , 'mainWindow.html'),
        slashes:true,
        protocol:'file',
        }));
        
        
     mainWindow.on('closed',function(){
        app.quit();
     })

     // Rapid API is used here to fetch the latest breaking news.....
     var req = unirest("GET", "https://breaking-news2.p.rapidapi.com/wp-json/wp/v2/posts");

        req.headers({
            "x-rapidapi-key": "f10e81f17emshc8c87da631b918bp1269dajsn221b32a17104",
            "x-rapidapi-host": "breaking-news2.p.rapidapi.com",
            "useQueryString": true
        });

      
        mainWindow.webContents.on('did-finish-load', () => {       
            console.log("now sendding a message to term window");    
            req.end(function (res) {
                if (res.error) throw new Error(res.error);
                const data = res.body;
                const toSend = [];
             //   console.log(data[0])
                for(i=0;i < data.length;i++){
                    const ff = (data[i].date)
                    var date = moment(ff).format('YYYY-MM-DD h:mm:ss'); 
                    toSend.push({
                        title:data[i].title.rendered,
                        content:data[i].content.rendered,
                         time:date
                    })
                }
              //  console.log(toSend)
              // toSend will be the data which is going to be send to client side and all the data is in sorted order as per the 
              // requirements
                mainWindow.webContents.send('start-session', toSend)     
             });
        })

     /// creating the menu for our Application.
    const mainMenu = Menu.buildFromTemplate(mainMenuWindow);   

    Menu.setApplicationMenu(mainMenu);
});







const mainMenuWindow = [
    {
        label:"file",
        submenu : [
            {
                label:'Open',
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform == 'darwin'){
    mainMenuWindow.unshift({});
}

if(process.env.NODE_ENV !== 'production'){
    mainMenuWindow.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle Developer Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item , focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload'   
            }
        ]
    })
}