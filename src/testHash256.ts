import {hash} from '@stablelib/sha256'
import * as u8a from 'uint8arrays'
// try a local signature you see if you need to send a hex array or uint8array over the wire... (you need to have the same math locally and remote)

import elliptic from 'elliptic'
import { publicKeyToXY } from 'nist-weierstrauss/lib/nist-weierstrauss-common';

const secp256r1 = new elliptic.ec('p256')

const toHash = 'hello';
const u8atoHash = u8a.fromString(toHash);

const hashedData = hash(u8atoHash)
console.log(hashedData);


const stringTwo = '{"alg":"ES256"}';
const u8aStringTwo = u8a.fromString(stringTwo);
console.log(stringTwo);
console.log(u8aStringTwo);
const base64urlStringTwo = u8a.toString(u8aStringTwo,'base64url');
console.log(base64urlStringTwo);

const stringThree = '{"iss":"joe","exp":1300819380,"http://example.com/is_root":true}';
const u8aStringThree = u8a.fromString(stringThree);
console.log(stringThree);
console.log(u8aStringThree);
const base64urlStringThree = u8a.toString(u8aStringThree,'base64url');
console.log(base64urlStringThree);

const stringFour = base64urlStringTwo + '.' + base64urlStringThree;
const u8aStringFour = u8a.fromString(stringFour);
const hashStringFour = hash(u8aStringFour);
console.log(stringFour);
console.log(u8aStringFour);
console.log(hashStringFour);  /// I am not sure what this is supposed to look like, but I will try the signature on this and see what I get...

/*

 {"kty":"EC",
      "crv":"P-256",
      "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
      "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
      "d":"jpsQnnGQmL-YBIffH1136cspYG6-0iY7X1fCE9-E9LI"
     }
*/

// x,y,and d are base64url encoded value

const base64UrlprivateKey = 'jpsQnnGQmL-YBIffH1136cspYG6-0iY7X1fCE9-E9LI';
const base64urlpublicKeyX = 'f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU';
const base64urlpublicKeyY = 'x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0';

const u8aPrivateKey = u8a.fromString(base64UrlprivateKey,'base64url');
const privateKey = secp256r1.keyFromPrivate(u8aPrivateKey);

const publicKey = String(privateKey.getPublic('hex'))
console.log(publicKey)

const publikcKeyXHex = u8a.toString(u8a.fromString(base64urlpublicKeyX,'base64url'),'hex')
const publikcKeyYHex = u8a.toString(u8a.fromString(base64urlpublicKeyY,'base64url'),'hex')
console.log(publikcKeyXHex);
console.log(publikcKeyYHex);

const signature = (privateKey.sign(hashStringFour))

const xOctet = u8a.fromString(signature.r.toString(),'base10');
const yOctet = u8a.fromString(signature.s.toString(),'base10');
console.log(xOctet);
console.log(yOctet);


//const sigDER = signature.toDER();
//console.log(sigDER);
//console.log(signature.r);

//let hexSig = keypairTemp.sign(buffferMsg)
//console.log(signature.r.toString())

const toSign = '040f1dbf0a2ca86875447a7c010b0fc6d39d76859c458fbe8f2bf775a40ad74a';
const u8toSign = u8a.fromString(toSign,'ascii')
const hexToSign = u8a.toString(u8toSign,'hex')
const input = hash(u8toSign);
const hexInput = u8a.toString(input,'hex')
console.log(toSign);
console.log(hexToSign);
console.log(hexInput);

console.log(typeof u8toSign);

//if (typeof == object )  === do the below .... else.... convert it to the to the asciiObject
if(u8toSign.constructor === Uint8Array) {
  console.log('you have a unit8array')
}

if(toSign.constructor === String) {
   console.log('you have a string')
}

