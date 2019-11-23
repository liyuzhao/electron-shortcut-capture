module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(1),i=n(2),o=n(3),a=function(){function e(e){this.captureWins=[],this.multiScreen=!1,this.bindClose(),this.bindClipboard(),this.bindDownload(),this.listenCapturingDisplayId(),this.multiScreen=!!e&&!!e.multiScreen}return e.prototype.initWin=function(){var t=[];if(this.multiScreen)t=r.screen.getAllDisplays();else{var n=r.screen.getCursorScreenPoint();t=[r.screen.getDisplayNearestPoint(n)]}this.captureWins=t.map((function(e){return new r.BrowserWindow(i.default(e))})),this.captureWins.map((function(t,n){t.loadURL(e.URL),t.setVisibleOnAllWorkspaces(!0),t.setAlwaysOnTop(!0,"screen-saver")}))},e.prototype.show=function(){this.initWin()},e.prototype.bindClose=function(){var e=this;r.ipcMain.on(o.events.close,(function(){e.close()}))},e.prototype.close=function(){this.captureWins.map((function(e,t){e.setVisibleOnAllWorkspaces(!1),e.close(),e=null})),this.captureWins=[]},e.prototype.hide=function(){this.captureWins.map((function(e,t){e.hide()}))},e.prototype.bindDownload=function(){var e=this;r.ipcMain.on(o.events.download,(function(t,i){i.currWin;var o=i.dataURL;e.hide();var a=o.replace(/^data:image\/\w+;base64,/,""),s=Buffer.from(a,"base64"),u=(new Date).getTime()+".png",c=r.dialog.showSaveDialogSync({defaultPath:u});try{n(4).writeFileSync(c,s)}catch(e){console.log("下载失败："+e)}e.close()}))},e.prototype.bindClipboard=function(){var e=this;r.ipcMain.on(o.events.clipboard,(function(t,n){r.clipboard.writeImage(r.nativeImage.createFromDataURL(n)),e.close()}))},e.prototype.listenCapturingDisplayId=function(){var e=this;r.ipcMain.on(o.events.setCapturingDisplayId,(function(t,n){e.captureWins.map((function(e){e.webContents.send(o.events.receiveCapturingDisplayId,n)}))}))},e.URL="file://"+n(5).join(__dirname,"../renderer/index.html"),e}();t.default=a},function(e,t){e.exports=require("electron")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=function(e){return{title:"shortcut-capture",width:e.bounds.width,height:e.bounds.height,x:e.bounds.x,y:e.bounds.y,type:"desktop",useContentSize:!0,frame:!1,show:!0,transparent:"darwin"===process.platform||"win32"===process.platform,resizable:!1,movable:!1,fullscreen:!1,simpleFullscreen:!0,backgroundColor:"#30000000",titleBarStyle:"default",focusable:!0,enableLargerThanScreen:!0,skipTaskbar:!1,minimizable:!1,maximizable:!1,hasShadow:!1,webPreferences:{nodeIntegration:!0}}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.events={close:"ElectronShortcutCapture::CLOSE",download:"ElectronShortcutCapture::DOWNLOAD",clipboard:"ElectronShortcutCapture::CLIPBOARD",setCapturingDisplayId:"ElectronShortcutCapture::SETCAPTURINGDISPLAYID",receiveCapturingDisplayId:"ElectronShortcutCapture::RECEIVECAPTURINGDISPLAYID"}},function(e,t){e.exports=require("fs")},function(e,t){e.exports=require("path")}]).default;