
import { 
    PublicKey,
    Connection,
 } from "@solana/web3.js";
import {
  getAccount,
  
} from "@solana/spl-token";
import {envConfig} from "@/config/env"
import { 
  fetchUserBorrowData,
  fetchPoolStakingData,
  fetchUserStakingData,
  fetchSystemConfigData
} from "@/core/solanaData"
// @ts-ignore
import BN from 'bn.js';
const connection = new Connection(envConfig.rpc);

const programIdDefault = new PublicKey('Bn1a31GcgB7qquETPGHGjZ1TaRimjsLCkJZ5GYZuTBMG')
let userTokens : false | [] ;

let userBorrowTokens : false | [] ;



let systemConfig: PublicKey;
let poolStakingData: PublicKey;
let userStakingData: PublicKey;

poolStakingData = PublicKey.findProgramAddressSync(
  [
    Buffer.from("pool_staking_data")
  ],
  programIdDefault
)[0];

const userTokenInit = async ( publicKey:PublicKey) =>
{
  //Address init
  systemConfig = PublicKey.findProgramAddressSync(
    [
      Buffer.from("system_config")
    ],
    programIdDefault
  )[0];

  userStakingData = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user_staking_data"),
      publicKey.toBuffer()
    ],
    programIdDefault
  )[0];

    const tks = await getUserTokenList(publicKey.toBase58());
    if(tks)
    {
        userTokens = tks;
    }
    await checkTokenExsitOrNot(publicKey);
    return true;
}

const userSolStakeFetch = async() =>
{
  const pool = await fetchPoolStakingData(poolStakingData);
  const user = await fetchUserStakingData(userStakingData);
  let ret = {
    totalStaked:new BN(0),
    totalShares:new BN(0),
    totalBorrowed:new BN(0),
    pendingVaultProfit:new BN(0),
    userShares:new BN(0),
  }
  if(pool)
  {
   
    ret.totalStaked = new BN(pool.totalStaked.toString())
    ret.totalShares = new BN(pool.totalShares.toString());
    ret.totalBorrowed = new BN(pool.totalBorrowed.toString());
    ret.pendingVaultProfit = new BN(pool.pendingVaultProfit.toString());
  }

  if(user)
  {
    ret.userShares = new BN(user.shares.toString())
  }
  return ret;
}

const userTokenBorrowFetch = async(publicKey:PublicKey,tks:any[]) =>
  {
    let ret : any[];
    ret = [];
    let totalStake = 0;
    for(let i = 0 ; i < tks.length ; i++)
    {
      try{
        const bda = PublicKey.findProgramAddressSync(
          [
            Buffer.from("user_borrow_data"),
            new PublicKey(tks[i].address).toBuffer(),
            publicKey.toBuffer()
          ],
          programIdDefault
        )[0];
  
        const bd = await fetchUserBorrowData(
          bda
        )
        if(bd)
        {
          const retSeed = {
            token: tks[i].address,
            borrowedAmount : bd.borrowedAmount,
            collateralAmount : bd.collateralAmount,
            lastUpdated : bd.lastUpdated
          }
          ret.push(retSeed)
          totalStake+= Number(bd.borrowedAmount)
        }
      }catch(e)
      {
        console.error(e)
      }
      
    }
    return {
      tokenData :ret,
      totalStake
    };
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
      userBorrowTokens = JSON.parse(
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
const getAddressBalance = async (address : PublicKey) =>
{
  return await connection.getBalance(address);
}
    
export {
    userTokens,
    userTokenInit,
    getTokenBalance,
    userBorrowTokens,
    userSolStakeFetch,
    userTokenBorrowFetch,
    getAddressBalance
}