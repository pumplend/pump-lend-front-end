
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

let userStakeTokens : false | [] ;
const userTokenInit = async ( publicKey:PublicKey) =>
{
    const tks = await getUserTokenList(publicKey.toBase58());
    if(tks)
    {
        userTokens = tks;
    }
    await checkTokenExsitOrNot();
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

async function checkTokenExsitOrNot() {
  let ret :any[];
  ret = [];
  if(!userTokens)
  {
    return false;
  }
  for(let i = 0 ; i<userTokens.length ; i ++)
  {
    try{
      const accountInfo = await connection.getAccountInfo(

        new PublicKey(
          JSON.parse(
            JSON.stringify(
              userTokens[i]
            )
          ).address
        )
      );

      if (!accountInfo) {
        throw new Error("Account not found");
      }else{
        ret.push(
          userTokens[i]
        )
      }
  
      if(ret.length>0)
      {
        userStakeTokens = JSON.parse(
          JSON.stringify(ret)
        );
      }
    }catch(e)
    {
      console.error(e)
    }

  }

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
    getTokenBalance,
    userStakeTokens
}