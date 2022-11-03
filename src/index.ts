import { P256Provider } from 'key-did-provider-p256'
import KeyResolver from 'key-did-resolver'
import { DID } from 'dids'
import {fromString} from 'uint8arrays'


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
