const electron = require('electron');
const url = require('url');
const path = require('path');
const  initialize =require('firebase/app');
const getFire  = require('firebase/firestore');







const {app ,BrowserWindow,Menu ,ipcMain}=electron;

const {  initializeApp} = initialize;
const { getFirestore , collection, addDoc ,doc,getDocs,onSnapshot,updateDoc,deleteDoc,query}  = getFire;


const firebaseApp = initializeApp({
  apiKey: 'AIzaSyChMr-fShkun_nK9K-ZMRtnrBIRy273EqI',
  authDomain: 'demomap-329008.firebaseapp.com',
  projectId: 'demomap-329008'
});

const db = getFirestore();

var markers = [];
let mainWindow;
var username;
var password;
var register; 

app.on('ready',() => {
        mainWindow= new BrowserWindow({
          height:1300,
          width:1000,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false 
        }
        });

        mainWindow.loadURL(
          url.format({
            pathname: path.join(__dirname,"login.html"),
            protocol: "file",
            slashes:true
          })
        );

        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

        Menu.setApplicationMenu(mainMenu);
          console.log("Hi");
     
        ipcMain.on("key:usernamepass" ,(err,...args)=>{
         checkFirebaseData(args[0],args[1]);
        
      });
       
          ipcMain.on("key:regUsernamePass" ,(err,...args)=>{
           addFireBaseUser(args[0],args[1]);
             });
        
       ipcMain.on("key:kargolocation",(err,...args)=>{
            addFireBaseLocation(args[0],args[1]);
       })
       
       ipcMain.on("newpass",(err,...args)=>{
          writeUserData(args[0],args[1],args[2]);
       })

       getKargoDurum();
       ipcMain.on("key:kargodelete",(err,...args)=>{
          deleteKargoData(args[0],args[1]);
       })
        
    
      

      
});

const mainMenuTemplate = [
  {
    label: "Dosya",
    submenu : [
      {
        label : "Maps Sıfırla"
      },
      {
        label : "Çıkış",
        accelaretor:process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        role:"quit"
      }
    ]
  }
]

if(process.env.NOD_ENV !=="production"){
  mainMenuTemplate.push(  {
    label : "Dev Tools",
    submenu: [
      {
        label : " Geliştirici Menüsünü Aç ",
        click(item,focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        label : "Yenile",
        role : "reload"
      }
    ]
  });
}


const addFireBaseUser = function (username,password){

  try {
    const docRef =addDoc(collection(db, "users"), {
      name : username,
      password: password
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

 const checkFirebaseData =  async function(username,password){
     try {
    
const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  if(doc.data().name == username && doc.data().password == password){
    console.log("basarili");
    newWindow();

  }
});
        
     }
     catch(e){
       console.log(e);
     }

   
 
}


function newWindow(){
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname,"main.html"),
      protocol: "file",
      slashes:true
    })
  );

}

const addFireBaseLocation = function (lt,lg){

  try {
    const docRef =addDoc(collection(db, "kargo_location"), {
      location: {lat: lt,long: lg},
      durum :0
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
const writeUserData= async function (name,oldpass,newpass) {
  try {
    
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      if(doc.data().name == name && doc.data().password == oldpass){
        writeUserCont(doc.id,newpass);
     
    
      }
    });
            
         }
         catch(e){
           console.log(e);
         }

}

const writeUserCont = async function(id,newpass){
  const adminRef = doc(db, "users", id);
         updateDoc(adminRef, {
          password:newpass
        });
}

const getKargoDurum =async function (){

  const q = query(collection(db, "kargo_location"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    markers = [];
    querySnapshot.forEach((doc) => {
      if(doc.data().durum==0){
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
  /*
  try {
    
    const querySnapshot = await getDocs(collection(db, "kargo_location"));
    querySnapshot.forEach((doc) => {
      if(doc.data().durum == 0){
        markers.push({coords:doc.data().location , durum : doc.data().durum});
    
      }
    });
            
         }
         catch(e){
           console.log(e);
         }
         finally{
           mainWindow.webContents.on('did-finish-load',()=>{
            mainWindow.webContents.send("key:markers",markers);
           })
         }*/
}
const deleteKargoData= async function (kargolat,kargolong) {
  try {
    console.log("123");
    const querySnapshot = await getDocs(collection(db, "kargo_location"));
    querySnapshot.forEach((doc) => {
      if(doc.data().location.lat == kargolat && doc.data().location.long == kargolong){
       deleteKargoDataCont(doc.id);
    
      }
    });
            
         }
         catch(e){
           console.log(e);
         }

}

const deleteKargoDataCont = async function(id){
  const adminRef = doc(db, "kargo_location", id);
  deleteDoc(adminRef);
}