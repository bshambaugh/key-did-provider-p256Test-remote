import { Signer } from 'did-jwt'
import { createJWS } from 'did-jwt'
import { createJWT } from 'did-jwt'
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
import {hash} from '@stablelib/sha256'

const server = http.createServer();
const websocketServer  = WebSocket.createServer({server: server})
//server.listen(3000);

DNS.lookup(OS.hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})

/*
websocketServer.on('stream',function(stream,request) {

 //   stream.setEncoding('utf8');

setInterval(function(){
  (async function() {
    
    
          let did = 'did:key:zDnaezUFn4zmNoNeZvBEdVyCv6MVL69X8NRD8YavTCJWGuXM7';
          const signer = await remoteP256Signer(stream);
          const jwt = await createJWT({ requested: ['name', 'phone'] }, { issuer: did, signer },{alg: 'ES256'})
          console.log(jwt)
    
  })();

},250);

})
*/

let x = 0;
websocketServer.on('stream',function(stream,request) {
  (async function() {
     while (true) { 
      let did = 'did:key:zDnaezUFn4zmNoNeZvBEdVyCv6MVL69X8NRD8YavTCJWGuXM7';
      const signer = await remoteP256Signer(stream);
      const jwt = await createJWT({ requested: ['name', 'phone'] }, { issuer: did, signer },{alg: 'ES256'})
      console.log(jwt)
      
      } 
   })(); 
});

server.listen(3000);

// if this does not work, try converting the ascii to a byte array in the getSignature function
function remoteP256Signer(stream): Signer {
  return async (payload: string | Uint8Array): Promise<string> => {
//  return async (payload: Uint8Array): Promise<string> => {
    return await getSignature(stream,payload);
   }
}
  
/*
  async function getSignature(stream,string) {
    stream.write('2'+'1200'+string);
    let result = (await waitForEvent(stream,'data')).toString();
    //console.log(result);
    let resultExit = bytesToBase64url(resultToUint8Array(result))
    //console.log(resultExit);
    return resultExit;
  }

  */
/*
  async function getSignature(stream,data: Uint8Array) {
    // getSignature should take a sha256hash as a hex string....or convert a uint8array to a hexstring
    // I think that the string needs to be sha256ed before it gets signed....?
    // data may be a string, if so ascii to Uint8Array .... have a function that checks for Unit8Array or ascii string
    const input = hash(data);
    const inputHex = u8a.toString(input,'hex');
    console.log(inputHex);
    stream.write('2'+'1200'+inputHex);
    let result = (await waitForEvent(stream,'data')).toString();
    console.log(result);
    console.log(resultToUint8Array(result));
    let resultExit = bytesToBase64url(resultToUint8Array(result))
    //console.log(resultExit);
    return resultExit;
  }
  */

  /*
  async function getSignature(stream,data: string | Uint8Array) {
    // getSignature should take a sha256hash as a hex string....or convert a uint8array to a hexstring
    // I think that the string needs to be sha256ed before it gets signed....?
    if(data.constructor === Uint8Array) {
      const signature = await signatureLogic(stream,data);
      return signature;
    } else if (data.constructor === String) {
      const u8toSign = u8a.fromString(data,'ascii')
      const signature = await signatureLogic(stream,u8toSign);
      return signature;
    } 
 }

 async function signatureLogic(stream,data: Uint8Array) {
    const input = hash(data);
    const inputHex = u8a.toString(input,'hex');
    console.log(inputHex);
    stream.write('2'+'1200'+inputHex);
    let result = (await waitForEvent(stream,'data')).toString();
    console.log(result);
    console.log(resultToUint8Array(result));
    let resultExit = bytesToBase64url(resultToUint8Array(result))
    return resultExit;
 }
 */

 async function getSignature(stream,data: string | Uint8Array) {
  // getSignature should take a sha256hash as a hex string....or convert a uint8array to a hexstring
  // I think that the string needs to be sha256ed before it gets signed....?
  if(data.constructor === Uint8Array) {
    console.log(data);
    console.log('fed and uint8array');
    const signature = await signatureLogic(stream,data);
    console.log('the signature is: '+signature)
    return signature;
  } else if (data.constructor === String) {
    console.log('here is the signature')
    console.log(data);
    const u8toSign = u8a.fromString(data,'ascii')
    console.log(u8toSign);
    console.log('fed a string');
    const signature = await signatureLogic(stream,u8toSign);
    console.log('the signature is: '+signature)
    return signature;
  }
}

async function signatureLogic(stream,data: Uint8Array) {
  const input = hash(data);
  console.log(input);
  const inputHex = u8a.toString(input,'hex');
  console.log(inputHex);
  stream.write('2'+'1200'+inputHex);
  let result = (await waitForEvent(stream,'data')).toString();
  console.log('signatureresult');
  console.log(result);
  console.log(signatureResultToUint8Array(result));
  let resultExit = bytesToBase64url(signatureResultToUint8Array(result))
  return resultExit;
}


 export function signatureResultToUint8Array(a: string): Uint8Array {
  // splot a string, and get the second half
  const myArray = a.split(",");
  if(myArray[0] == 'signature') {
    const hex = myArray[1];
    const result = u8a.fromString(hex,'hex')
    return result;
  } else {
    return undefined;
  }
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
    let result = (await matchPublicKeyWithRemote(publicRawKey,stream)).toString();
    /*
    console.log('start of result')
    console.log(result);
    console.log('end of result')
    */
   // return didkeyURL;
    
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
