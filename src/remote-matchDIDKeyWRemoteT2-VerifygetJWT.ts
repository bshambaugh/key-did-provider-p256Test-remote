import { Signer } from 'did-jwt'
import { createJWS } from 'did-jwt'
import { createJWT } from 'did-jwt'
import { verifyJWT } from 'did-jwt'
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
import { Resolver } from 'did-resolver'

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
    
          let did = 'did:key:zDnaerx9CtbPJ1q36T5Ln5wYt3MQYeGRG5ehnPAmxcf5mDZpv';
          const newDID = await matchDIDKeyWithRemote(did,stream);
          did = newDID;
     
          console.log('public Key is:');
          console.log(newDID);  /// this is great, but I just need to stuff after the comma
          console.log(did)

          const signer = await remoteP256Signer(stream);
          const jwt = await createJWT({ requested: ['name', 'phone'] }, { issuer: did, signer },{alg: 'ES256'})
          console.log(jwt)
          const KeyDidResolver = KeyResolver.getResolver();
          const didResolver = new Resolver(KeyDidResolver);
          // this verifyJWT does not work, perhaps once I know why this doesn't work then I will know why remote.ts does not work
         // verifyJWT(jwt,{resolver: didResolver,audience: did}).then(({payload,signer,jwt}) => { console.log(payload) })

          const resolve = await resolveDID();
          console.log(resolve);

          async function resolveDID() {
            const did = new DID({ resolver: KeyResolver.getResolver() })
            return await did.resolve(newDID)
          }
          
    
  })();
},250);

})

//server.listen(3000);

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

   // I think that I have to close some listeners here....because I get to the maxListner limit
   async function waitForEvent(emitter, event): Promise<string> {
    return new Promise((resolve, reject) => {
        emitter.once(event, resolve);
        emitter.once("error", reject);
        emitter.removeAllListeners("error");  /// I hope this is correct, it seems to stop the code from complaining about the maxListenerLimit being exceeded
    });
  }  

  async function matchDIDKeyWithRemote(didkeyURL: string,stream: any) : Promise<string> {
    const compressedPublicKey = didKeyURLtoPubKeyHex(didkeyURL);
   // console.log(compressedPublicKey);
   //nist_weierstrauss.secp256r1.ECPointDecompress
   const publicKey = nist_weierstrauss.nist_weierstrauss_common.publicKeyIntToUint8ArrayPointPair(nist_weierstrauss.secp256r1.ECPointDecompress(fromString(compressedPublicKey,'hex')))
  //const publicKey = publicKeyIntToUint8ArrayPointPair(ECPointDecompress(fromString(compressedPublicKey,'hex'))); // actually I need to create a function called compressed to raw
   // console.log(publicKey);
    const publicRawKey = octetToRaw(publicKey)
   // console.log(publicRawKey);
    let result = await matchPublicKeyWithRemote(publicRawKey,stream)
    if(result.length > 1) {
      return rpcToDID(result);
     } else {
       return didkeyURL;
     }
  }
  
  async function matchPublicKeyWithRemote(publicKey: string,stream: any) : Promise<string> {
    let rpcPayload = '0'+'1200'+publicKey;
    stream.write(rpcPayload);
   // console.log('rpcpaylod'+rpcPayload);
    let result = await waitForEvent(stream,'data');  
   // console.log('result is:'+result);
    return result; 
  }
  
  function octetToRaw(publicKey: octetPoint) {
     return toString(publicKey.xOctet,'hex')+toString(publicKey.yOctet,'hex')
  }
  
  function rpcToDID(response) : string {
    let result = response.split(',');
    //compressedKeyInHexfromRaw(result[1])
    // return result[1];
    const multicodecName = 'p256-pub';
    return encodeDIDfromHexString(multicodecName,compressedKeyInHexfromRaw(result[1]))
}