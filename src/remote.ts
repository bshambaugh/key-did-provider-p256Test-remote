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
//var WebSocketServer = require('ws').Server
//import { Server as WebSocketStream } from 'websocket-stream'
import * as nist_weierstrauss from 'nist-weierstrauss'
import {octetPoint} from 'nist-weierstrauss'

//import { P256Provider } from 'key-did-provider-p256'
import KeyResolver from 'key-did-resolver'
import { DID } from 'dids'
import {fromString} from 'uint8arrays'

import * as DNS from 'dns'
import * as OS from 'os'
import * as u8a from 'uint8arrays'

const server = http.createServer();
//const websocketServer = new WebSocketStream({ server: server })
const websocketServer  = WebSocket.createServer({server: server})


DNS.lookup(OS.hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})

/*
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})
*/


websocketServer.on('stream',function(stream,request) {
    //stream.read();
    stream.setEncoding('utf8');
const did = 'did:key:zDnaerx9CtbPJ1q36T5Ln5wYt3MQYeGRG5ehnPAmxcf5mDZpv';
// const did = 'did:key:zDnaezUFn4zmNoNeZvBEdVyCv6MVL69X8NRD8YavTCJWGuXM7';
/*
const provider = P256Provider.build(stream,did);
console.log(provider);
*/

setInterval(function(){
  (async function() {
    
    const provider = await P256Provider.build(stream,did);
    console.log(provider);
   // Creating the DID class doesn't work well with a promise, commenting out for now...
    
    // const resolvedProvider = (await provider).send
    //console.log(resolvedProvider) // I tried putting resolvedProvider in the place of provider, but I don't know how to fix the send requirement.
   // const didObject = new DID({ provider , resolver: getResolver() })
   // I am not sure why this is not working, fidget around with other people's code and see if you can get something to work...
  const didObject = new DID({ provider , resolver: KeyResolver.getResolver() })
  console.log(didObject);

    // something funny happens around here....there is not a correct format for JWS
    // also run your code that gets the signature and public key alone to make sure the hardware is working....
    const auth = await didObject.authenticate()
    console.log('auth is');
    console.log(auth);


    // use the didObject in your standard ceramic things
    
  })();
},250);

})

server.listen(3000);

/*
async function getSignature(stream,string) {
    stream.write('2'+'1200'+string);
    let result = await waitForEvent(stream,'data');
    console.log(result);
    return result;
  }
*/

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

  async function getSignature(stream,string) {
    stream.write('2'+'1200'+string);
    let result = (await waitForEvent(stream,'data')).toString();
    let resultExit = bytesToBase64url(resultToUint8Array(result))
    return resultExit;
  }
  
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
  
  const sign = async (
    payload: Record<string, any> | string,
    stream,
    did: string,
    protectedHeader: Record<string, any> = {}
  ) => {
   const kid = `${did}#${did.split(':')[2]}`
   //  const kid = `${did}`
    const signer = remoteP256Signer(stream) // see remoteP256Signer.ts // const signer = EdDSASigner(secretKey)
    const header = toStableObject(Object.assign(protectedHeader, { kid, alg: 'ES256' }))  /// see https://datatracker.ietf.org/doc/html/rfc7518
    return createJWS(typeof payload === 'string' ? payload : toStableObject(payload), signer, header)
  }
  
  function toStableObject(obj: Record<string, any>): Record<string, any> {
    return JSON.parse(stringify(obj)) as Record<string, any>
  }
  
  function toGeneralJWS(jws: string): GeneralJWS {
    const [protectedHeader, payload, signature] = jws.split('.')
    return {
      payload,
      signatures: [{ protected: protectedHeader, signature }],
    }
  }
  
  interface Context {
    did: string,
    stream: any
  }
  
  const didMethods: HandlerMethods<Context, DIDProviderMethods> = {
    did_authenticate: async ({ did, stream }, params: AuthParams) => {
      const response = await sign(
        {
          did,
          aud: params.aud,
          nonce: params.nonce,
          paths: params.paths,
          exp: Math.floor(Date.now() / 1000) + 600, // expires 10 min from now
        },
        stream,
        did
      )
      return toGeneralJWS(response)
    },
    did_createJWS: async ({ did, stream}, params: CreateJWSParams & { did: string }) => {
      const requestDid = params.did.split('#')[0]
      if (requestDid !== did) throw new RPCError(4100, `Unknown DID: ${did}`)
      const jws = await sign(params.payload, stream, did,  params.protected)
      // const jws = await sign(params.payload, did, secretKey, params.protected)
      return { jws: toGeneralJWS(jws) }
    },
    did_decryptJWE: async () => {
      throw new RPCError(4100, 'Decryption not supported')
    },
  }

export class P256Provider implements DIDProvider {
    _handle: SendRequestFunc<DIDProviderMethods>
  
    private constructor(stream,did) {

      const handler = createHandler<Context, DIDProviderMethods>(didMethods)
      // this code has to check whether the did is valid for the remote ... but does the logic have to be here??
      this._handle = async (msg) => await handler({ did, stream }, msg)
    }
  
    
    public static async build(stream,did): Promise<P256Provider> {
   
      const newDID = await matchDIDKeyWithRemote(did,stream);
      did = newDID;
   
      return new P256Provider(stream,did);
  
    }
  
    get isDidProvider(): boolean {
      return true
    }
  
    async send<Name extends DIDMethodName>(
      msg: RPCRequest<DIDProviderMethods, Name>
    ): Promise<RPCResponse<DIDProviderMethods, Name> | null> {
      return await this._handle(msg)
    }
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

export async function getPublicKey(stream) : Promise<string> {
    /// look at the RPC call to get the public key
    let rpcPayload = '1'+'1200';
    stream.write(rpcPayload);
    let preResult = await waitForEvent(stream,'data');
    console.log(preResult);
    let result = preResult.split(',');
    return result[1];
  }

/*
const seed = new Uint8Array(32) //  32 bytes with high entropy
console.log(seed)
*/
/*
const privateKey = '040f1dbf0a2ca86875447a7c010b0fc6d39d76859c458fbe8f2bf775a40ad74a'
// seed should be a private key, not a bunch of zeros....
const provider = new P256Provider(fromString(privateKey,'hex'))
const did = new DID({ provider, resolver: KeyResolver.getResolver()  })
console.log(did)
*/

/*
const result = await did.authenticate()
*/
//did.authenticate()   .. this won't allow the other functions below to run...
/*
let quth = async() => await did.authenticate()
*/
// log the DID
/*
console.log(did.id)
*/

// create JWS
/*
const { jws, linkedBlock } = await did.createDagJWS({ hello: 'world' })
console.log(jws)
*/

// verify JWS
/*
await did.verifyJWS(jws)
*/

/*
// create JWE
const jwe = await did.createDagJWE({ very: 'secret' }, [did.id])
console.log(jwe);

// decrypt JWE
const decrypted = await did.decryptDagJWE(jwe)
console.log(decrypted)i
*/
