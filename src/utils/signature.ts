import {Sha256} from "@aws-crypto/sha256-browser";
import {u8aToHex} from "./u8aToHex";

export async function signPayload(payload: any, key?: string) {
  const hash =  new Sha256(key);
  hash.update(JSON.stringify(payload));
  
  const hashU8a = await hash.digest();
  
  return u8aToHex(hashU8a);
}