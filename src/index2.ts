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

import { CeramicClient } from '@ceramicnetwork/http-client'
import {TileDocument} from '@ceramicnetwork/stream-tile'

const API_URL = "https://ceramic-clay.3boxlabs.com"
const ceramic = new CeramicClient(API_URL)

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

// this stuff may be a bit beyold the scope
ceramic.did = did
ceramic.did.setProvider(provider)

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Reward",
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "message": { "type": "string" }
    },
    "required": [
      "message",
      "title"
    ]
  }
  const metadata = {
    controllers: [ceramic.did.id] // this will set yourself as the controller of the schema
  }
  const rewardSchema = await TileDocument.create(ceramic, schema, metadata)
  
  const reward = await TileDocument.create(ceramic, {
      title: 'Hello',
      message: 'world!'
    }, {
      controllers: [ceramic.did.id],
      family: 'Rewards',
      schema: rewardSchema.commitId.toString(),
  })
  
  console.log('the reward.state is:')
  console.log(reward.state)
  
  console.log('the reward is')
  console.log(reward)
  

