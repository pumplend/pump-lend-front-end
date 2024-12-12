
import { 
    PublicKey,
    Connection,
 } from "@solana/web3.js";
import {
  getAccount,
  
} from "@solana/spl-token";
import {envConfig} from "@/config/env"

const connection = new Connection(envConfig.rpc);

let userTokens : false | [] ;
const userTokenInit = async ( publicKey:PublicKey) =>
{
    const tks = await getUserTokenList(publicKey.toBase58());
    if(tks)
    {
        userTokens = tks;
    }
    return true;
}


async function getUserTokenList(address:string) {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", envConfig.apiKey.shyft);

    const tokenResponse = await fetch(
      envConfig.api.shyft +
      address,
      { method: "GET", headers: myHeaders, redirect: "follow" }
    );
    return (await tokenResponse.json()).result;
}

const getTokenBalance = async (tokenAddress:PublicKey, walletAddress: PublicKey) =>
    {
      try {
        const accountInfo = await getAccount(connection, tokenAddress);
        return accountInfo.amount.toString();
      } catch (error) {
        console.error('Failed to get token balance:', error);
        return null;
      }
    }
    
export {
    userTokens,
    userTokenInit,
    getTokenBalance
}