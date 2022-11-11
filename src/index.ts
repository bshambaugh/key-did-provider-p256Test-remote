import { P256Provider } from 'key-did-provider-p256'
import KeyResolver from 'key-did-resolver'
import { DID } from 'dids'
import {fromString} from 'uint8arrays'
import { ES256Signer } from 'did-jwt'
import * as u8a from 'uint8arrays'

import pkg from 'elliptic';
const { ec: EC } = pkg;
import { compressedKeyInHexfromRaw, encodeDIDfromHexString } from 'did-key-creator'
import { createJWT } from 'did-jwt'

var p256 = new EC('p256');

/*
const seed = new Uint8Array(32) //  32 bytes with high entropy
console.log(seed)
*/
const privateKey = '040f1dbf0a2ca86875447a7c010b0fc6d39d76859c458fbe8f2bf775a40ad74a'
// seed should be a private key, not a bunch of zeros....
const provider = new P256Provider(fromString(privateKey,'hex'))
const did = new DID({ provider, resolver: KeyResolver.getResolver()  })
console.log(did)

const result = await did.authenticate()
//did.authenticate()   .. this won't allow the other functions below to run...
/*
let quth = async() => await did.authenticate()
*/
// log the DID
console.log(did.id)

// create JWS
const { jws, linkedBlock } = await did.createDagJWS({ hello: 'world' })
console.log(jws)

// verify JWS
await did.verifyJWS(jws)

/*
// create JWE
const jwe = await did.createDagJWE({ very: 'secret' }, [did.id])
console.log(jwe);

// decrypt JWE
const decrypted = await did.decryptDagJWE(jwe)
console.log(decrypted)i
*/

const u8aprivateKey = u8a.fromString(privateKey,'hex')
console.log(u8a.toString(u8aprivateKey,'base10'))
const signer = ES256Signer(u8aprivateKey);

const key2 = p256.keyFromPrivate(privateKey,'hex')

console.log(key2);
console.log('last')
console.log(String(key2.getPrivate()))

//key2.getPublic

var pubPoint = key2.getPublic();
var x = pubPoint.getX();
var y = pubPoint.getY();

var pub = x.toString('hex')+y.toString('hex');
console.log(pub);

const multicodecName = 'p256-pub';
const compressedKey = compressedKeyInHexfromRaw(pub);
const newDID = encodeDIDfromHexString(multicodecName,compressedKey); 
console.log(newDID);

const jwt = await createJWT({ requested: ['name', 'phone'] }, { issuer: newDID, signer },{alg: 'ES256'})
console.log(jwt)

// yes this jwt checks out...

/*
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjgxMjAyMzAsInJlcXVlc3RlZCI6WyJuYW1lIiwicGhvbmUiXSwiaXNzIjoiZGlkOmtleTp6RG5hZXlQb2ZSSzhjYnR1VzNINlFiRE45dWVrSmd6V0ROOEZFYmNad1c0OXFyV1ljIn0.EjfH_8NvYHMJMQQUnNEF8IAbLs87P12XYuP9XKuRj1LQBLHnWNazGYY92C76xwbJsSSlAJARJ7Md5bP8lEhdtA
*/