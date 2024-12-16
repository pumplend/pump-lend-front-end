
import { 
    PublicKey,
    Connection,
 } from "@solana/web3.js";
import {
  getAccount,
  
} from "@solana/spl-token";
import {envConfig} from "@/config/env"

const connection = new Connection(envConfig.rpc);

const programIdDefault = new PublicKey('Bn1a31GcgB7qquETPGHGjZ1TaRimjsLCkJZ5GYZuTBMG')
let userTokens : false | [] ;

let userStakeTokens : false | [] ;
const userTokenInit = async ( publicKey:PublicKey) =>
{
    const tks = await getUserTokenList(publicKey.toBase58());
    if(tks)
    {
        userTokens = tks;
    }
    await checkTokenExsitOrNot(publicKey);
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

async function checkTokenExsitOrNot(publicKey:PublicKey) {
  let ret :any[];
  ret = [];
  if(!userTokens)
  {
    return false;
  }
  for(let i = 0 ; i<userTokens.length ; i ++)
  {
    try{
      const borrowAddress = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_borrow_data"),
          new PublicKey(
            JSON.parse(
              JSON.stringify(
                userTokens[i]
              )
            ).address
          ).toBuffer(),
          publicKey.toBuffer()
        ],
        programIdDefault
      )[0];

      const accountInfo = await connection.getAccountInfo(
        borrowAddress

      );

      if (!accountInfo) {
        console.log("✈Token not found",JSON.parse(
          JSON.stringify(
            userTokens[i]
          )
        ).address)
        throw new Error("Account not found");
      }else{
        console.log("✈Token found",accountInfo,JSON.parse(
          JSON.stringify(
            userTokens[i]
          )
        ).address)
        ret.push(
          userTokens[i]
        )
      }
  

    }catch(e)
    {
      console.error(e)
    }

  }


  if(ret.length>0)
    {
      console.log("✈ Final stake tokens :: ",ret)
      userStakeTokens = JSON.parse(
        JSON.stringify(ret)
      );
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