import {getPublicKey} from '../remote.js'
import * as http from 'http'
import * as WebSocket from 'websocket-stream'
import * as DNS from 'dns'
import * as OS from 'os'

describe("Socket Testing", () => {
    // let server: http.Server
     //const websocketServer: WebSocket.Server
     const server = http.createServer();
     const websocketServer  = WebSocket.createServer({server: server})
     DNS.lookup(OS.hostname(), function (err, add, fam) {
        console.log('addr: '+add);
    })

     /*
     beforeEach(
        const server = http.createServer();
     )
     */

   /*  afterEach(server.closeAllConnections()) */

   it("should return a public key",() => {
    websocketServer.on('stream',function(stream,request) {

        stream.setEncoding('utf8');
    
    setInterval(function(){
      (async function() {
        
              const publicKey = await getPublicKey(stream);
         
              console.log('public Key is:');
              console.log(publicKey);  /// this is great, but I just need to stuff after the comma
        
        
      })();
    },250);
    
    })

   // server.closeAllConnections();
       
   })

   /*
   function webSocketCall() {
    websocketServer.on('stream',function(stream,request) {

        stream.setEncoding('utf8');
    
    setInterval(function(){
      (async function() {
        
          // execute arbitary stuff here...
        
      })();
    },250);
    
    })
   }
   */
})