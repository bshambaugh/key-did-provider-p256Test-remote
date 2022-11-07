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
import * as u8a from 'uint8arrays'

const server = http.createServer();
const websocketServer  = WebSocket.createServer({server: server})
server.listen(3000);

DNS.lookup(OS.hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})

websocketServer.on('stream',function(stream,request) {

    stream.setEncoding('utf8');

setInterval(function(){
  (async function() {
    
          // what are cryptographic signers supposed to return??
          
          const signer = await remoteP256Signer(stream);
          console.log(signer);
          
         // const toSign = 'hello';
         // getSignature(stream,toSign)
         /*
         const signature = await getSignature(stream,toSign);
        console.log('ha');
        console.log(signature);
        */
    
  })();
},250);

})

//server.listen(3000);

   // I think that I have to close some listeners here....because I get to the maxListner limit
   async function waitForEvent(emitter, event): Promise<string> {
    return new Promise((resolve, reject) => {
        emitter.once(event, resolve);
        emitter.once("error", reject);
        emitter.removeAllListeners("error");  /// I hope this is correct, it seems to stop the code from complaining about the maxListenerLimit being exceeded
    });
  }  

  function remoteP256Signer(stream): Signer {
    return async (payload: string | Uint8Array): Promise<string> => {
      return await getSignature(stream,payload);
     }
  }

  async function getSignature(stream,string) {
    stream.write('2'+'1200'+string);
    let result = (await waitForEvent(stream,'data')).toString();
    //console.log(result);
    let resultExit = bytesToBase64url(resultToUint8Array(result))
    //console.log(resultExit);
    return resultExit;
  }

export function resultToUint8Array(a: string): Uint8Array {
   // splot a string, and get the second half
   const myArray = a.split(",");
   const hex = myArray[1];
   const result = u8a.fromString(hex,'hex')
   return result;
}

export function bytesToBase64url(b: Uint8Array): string {
  return u8a.toString(b, 'base64url')
}
