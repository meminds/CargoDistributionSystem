const electron = require('electron');
const url = require('url');
const path = require('path');
const initialize = require('firebase/app');
const getFire = require('firebase/firestore');




//MAPS YOL BULMADA SIRA

const { app, BrowserWindow, Menu, ipcMain } = electron;

const { initializeApp } = initialize;
const { getFirestore, addDoc, getDocs, doc, collection, query, where, onSnapshot ,updateDoc} = getFire;


const firebaseApp = initializeApp({
  apiKey: '',
  authDomain: 'demomap-329008.firebaseapp.com',
  projectId: 'demomap-329008'
});

const db = getFirestore();

var markers=[];
var lat = [];
var lng = [];
var durum = [];


let mainWindow;
let addWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    })
  );



  getFirebaseLocation();
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);
  console.log("Hi");
  ipcMain.on("test", (err, data) => {
    console.log(data);
  })
  ipcMain.on("test:inputValue", (err, data) => {
    console.log(data);
  })

  ipcMain.on("key:latlng", (err, ...args) => {
    addFirebaseClickedLatLng(args[0], args[1]);
  })
  ipcMain.on("key:hareket",(err,data)=>{
    var bir;
    var iki;
    for(i=0;i<data.length;i++){
      if(data[i].durum==1){
           bir =i;
      }
    }
    console.log(data[bir]);
    updateKargoDurum(data[bir]);
    
})



});

const mainMenuTemplate = [
  {
    label: "Dosya",
    submenu: [
      {
        label: "Maps Sıfırla"
      },
      {
        label: "Çıkış",
        accelaretor: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        role: "quit"
      }
    ]
  }
]

if (process.env.NOD_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: " Geliştirici Menüsünü Aç ",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        label: "Yenile",
        role: "reload"
      }
    ]
  });
}
/*
function createWindow(){
  addWindow = new BrowserWindow({
    width=482,
    height=200,
    title = "Yeni Pencere"
  });
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname,"login.html"),
      protocol: "file",
      slashes:true
    })
  );
}*/

function addFirebaseClickedLatLng(lat, lng) {
  try {
    const docRef = addDoc(collection(db, "kargo_location"), {
      location: { lat: lat, long: lng },
      durum: 0,
      MusteriName: ""
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

const getFirebaseLocation =  function () {
  
    
    const q = query(collection(db, "kargo_location"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      markers = [];
      querySnapshot.forEach((doc) => {
        if(doc.data().durum!=1){
          markers.push({coords:doc.data().location , durum : doc.data().durum});
        }
        console.log("hi1");
        
      });
      //did-finis-load
      mainWindow.reload();
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send("key:markers", markers);
      console.log("hi2");
      })
      
 
    });

   
    /*var unsub = onSnapshot(doc(db, "kargo_location", "SF"),{includeMetadataChanges: true}, (doc) => {
      if(doc.data().durum != 1){
        markers.push({coords:doc.data().location , durum : doc.data().durum});
    
      }
  });*/
    /*
      const querySnapshot = await getDocs(collection(db, "kargo_location"));
      querySnapshot.forEach((doc) => {
        if(doc.data().durum != 1){
          markers.push({coords:doc.data().location , durum : doc.data().durum});
      
        }
      });*/

  
}


const updateKargoDurum= async function (data) {
  try {
  
    
    const querySnapshot = await getDocs(collection(db, "kargo_location"));
    querySnapshot.forEach((doc) => {
      if(doc.data().location.lat == String(data.coords.lat) && doc.data().location.long == String(data.coords.long)){
        console.log("here");
        updateKargoDurumCont(doc.id,data.durum);
       
    
      }
    });
            
         }
         catch(e){
           console.log(e);
         }

}

const updateKargoDurumCont = async function(id,newdurum){
  const adminRef = doc(db, "kargo_location", id);
         updateDoc(adminRef, {
          durum:newdurum
        });
}

