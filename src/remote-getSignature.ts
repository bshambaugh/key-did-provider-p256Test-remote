import { Signer } from 'did-jwt'
import { createJWS } from 'did-jwt'
import stringify from 'fast-json-stable-stringify'
import type {
  AuthParams,
  CreateJWSParams,
  DIDMethodName,
  DIDProviderMethods,
  DIDProvider,
  GeneralJWS,
} from 'dids'
import { RPCError, createHandler } from 'rpc-utils'
import type { HandlerMethods, RPCRequest, RPCResponse, SendRequestFunc } from 'rpc-utils'
import { encodeDIDfromHexString, compressedKeyInHexfromRaw, didKeyURLtoPubKeyHex } from 'did-key-creator'
import { toString } from 'uint8arrays/to-string'
import * as http from 'http'
import * as WebSocket from 'websocket-stream'
import * as nist_weierstrauss from 'nist-weierstrauss'
import {octetPoint} from 'nist-weierstrauss'

import KeyResolver from 'key-did-resolver'
import { DID } from 'dids'
import {fromString} from 'uint8arrays'

import * as DNS from 'dns'
import * as OS from 'os'

const server = http.createServer();
//const websocketServer = new WebSocketStream({ server: server })
const websocketServer  = WebSocket.createServer({server: server})


DNS.lookup(OS.hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})


websocketServer.on('stream',function(stream,request) {


setInterval(function(){
  (async function() {
  
  const toSign = 'hello';
  getSignature(stream,toSign)
    
  })();
},250);

})

server.listen(3000);

async function getSignature(stream,string) {
    stream.write('2'+'1200'+string);
    let result = await waitForEvent(stream,'data');
    console.log(result);
    return result;
  }
  
  // I think that I have to close some listeners here....because I get to the maxListner limit
  async function waitForEvent(emitter, event): Promise<string> {
    return new Promise((resolve, reject) => {
        emitter.once(event, resolve);
        emitter.once("error", reject);
        emitter.removeAllListeners("error");  /// I hope this is correct, it seems to stop the code from complaining about the maxListenerLimit being exceeded
    });
  }

