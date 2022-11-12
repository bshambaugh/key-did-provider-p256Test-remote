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
import {hash} from '@stablelib/sha256'

const server = http.createServer();
//const websocketServer = new WebSocketStream({ server: server })
const websocketServer  = WebSocket.createServer({server: server})


DNS.lookup(OS.hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})


websocketServer.on('stream',function(stream,request) {


setInterval(function(){
  (async function() {
  
 // const toSign = '040f1dbf0a2ca86875447a7c010b0fc6d39d76859c458fbe8f2bf775a40ad74a';
  const toSign = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjgxMDU5NTMsInJlcXVlc3RlZCI6WyJuYW1lIiwicGhvbmUiXSwiaXNzIjoiZGlkOmtleTp6RG5hZXpVRm40em1Ob05lWnZCRWRWeUN2Nk1WTDY5WDhOUkQ4WWF2VENKV0d1WE03In0';
  // getSignature(stream,toSign)
  const signature = await getSignature(stream,toSign);
  // const signature = await getSignature(stream,u8a.fromString(toSign));
  console.log('ha');
  console.log(signature);
  // what are cryptographic signers supposed to return??
  /*
  console.log(signature.toString());
  const sig = "signature,eb9b40e7635cd930f06ccca634fde3da3c230b315788aae0f2c42cf9f02ae7649f72d960812a82efc0d0102069258ad2859ad371b5f41e2b151a0983d34083e6"
  const myArray = sig.split(",");
  console.log(myArray[1]);
  const hex = myArray[1];
  console.log(hex)
  */
  })();
},250);

})

server.listen(3000);
 
/*
async function getSignature(stream,data: Uint8Array) {
    // getSignature should take a sha256hash as a hex string....or convert a uint8array to a hexstring
    // I think that the string needs to be sha256ed before it gets signed....?
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

 async function getSignature(stream,data: string | Uint8Array) {
    // getSignature should take a sha256hash as a hex string....or convert a uint8array to a hexstring
    // I think that the string needs to be sha256ed before it gets signed....?
    if(data.constructor === Uint8Array) {
      console.log(data);
      const signature = await signatureLogic(stream,data);
      return signature;
    } else if (data.constructor === String) {
      const u8toSign = u8a.fromString(data,'ascii')
      console.log(u8toSign);
      const signature = await signatureLogic(stream,u8toSign);
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
    console.log(result);
    console.log(resultToUint8Array(result));
    let resultExit = bytesToBase64url(resultToUint8Array(result))
    return resultExit;
 }


export function resultToUint8Array(a: string): Uint8Array {
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

