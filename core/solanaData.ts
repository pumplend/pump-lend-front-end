import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair,LAMPORTS_PER_SOL, PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    Connection,
    clusterApiUrl,
    TransactionInstruction,
    Struct,
    SendTransactionError
 } from "@solana/web3.js";
import {
  mintTo,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  getMintLen,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  
} from "@solana/spl-token";
import BigNumber from 'bignumber.js';
// @ts-ignore
import BN from 'bn.js';
import * as abi from '@/core/pump_lend.json';
import { serialize , Schema,deserialize, deserializeUnchecked } from "borsh";
import { createHash } from 'crypto';
import {envConfig} from "@/config/env"
import { api_price_oracle } from "./request";
const programIdDefault = new PublicKey('Bn1a31GcgB7qquETPGHGjZ1TaRimjsLCkJZ5GYZuTBMG')

  // PDA Accounts
  let systemConfig: PublicKey;
  let poolTokenAuthority: PublicKey;
  let poolStakingData: PublicKey;
  let userStakingData: PublicKey;
  let userBorrowData: PublicKey;

  let tokenMint: PublicKey = new PublicKey('CpuCvQiAuat8TEQ9iCBEQN3ryEzMTSHryinGEkkXZnp6');
  let userTokenAccount: PublicKey;
  let poolTokenAccount: PublicKey;

  let userBorrowDataDetails : false | any = false;


  const connection = new Connection(envConfig.rpc);

const solanaDataInit = ( publicKey:PublicKey, token:string) =>
{
    tokenMint = new PublicKey(token)
    if(!publicKey)
    {
        return false;
    }
    systemConfig = PublicKey.findProgramAddressSync(
        [
          Buffer.from("system_config")
        ],
        programIdDefault
      )[0];

    poolStakingData = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool_staking_data")
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

    userBorrowData = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_borrow_data"),
          tokenMint.toBuffer(),
          publicKey.toBuffer()
        ],
        programIdDefault
      )[0];
    userTokenAccount = getAssociatedTokenAddressSync(
        tokenMint,
        publicKey,
        true
    )

    poolTokenAuthority = PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool_token_authority")
        ],
        programIdDefault
      )[0];
    poolTokenAccount = getAssociatedTokenAddressSync(
        tokenMint,
        poolTokenAuthority,
        true
      );

      console.log("💊 Account List :: ",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58()
    )
    return{
        systemConfig,
        poolStakingData,
        userStakingData,
        userBorrowData,
        userTokenAccount,
        poolTokenAuthority,
        poolTokenAccount
    }
}

/**
 * Data fetching
 */
const testSoalanData = async ( 
    publicKey:PublicKey
)=>
{
    console.log(
        "🎦 User borrow sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )
    const tokens = await getUserTokenList(publicKey.toBase58())
    console.log("tokens :: ",tokens)

    console.log(
        await fetchUserBorrowData(userBorrowData)
    )

    console.log(
        await fetchPoolStakingData(poolStakingData)
    )

    console.log(
        await fetchSystemConfigData(systemConfig)
    )

    console.log(
        await fetchUserStakingData(userStakingData)
    )

}

const initFetchData = async()=>{
  try{

    userBorrowDataDetails =  await fetchUserBorrowData(userBorrowData);
  }catch(e){}
}



/**
 * Tools function
 */

class PoolStakingData {
    constructor(props:any) {
      Object.assign(this, props);
    }
  }


const PoolStakingDataSchema = new Map([
    [
      PoolStakingData,
      {
        kind: 'struct',
        fields: [
          ['totalStaked', 'u64'], 
          ['totalShares', 'u64'], 
          ['totalBorrowed', 'u64'], 
          ['pendingVaultProfit', 'u64'], 
        ],
      },
    ],
  ]);
  



function sighash(namespace: string, name: string): Buffer {
    const preimage = `${namespace}:${name}`;
    const hash = createHash('sha256'); 
    hash.update(preimage);
    const fullHash = hash.digest(); 
    return fullHash.slice(0, 8);  
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

const getTokenBalance = async ( walletAddress: PublicKey) =>
    {
      try {
        const tokenAddress = userTokenAccount;
        const accountInfo = await getAccount(connection, tokenAddress);
        return accountInfo.amount.toString();
      } catch (error) {
        console.error('Failed to get token balance:', error);
        return null;
      }
    }
    

    
const fetchUserBorrowData = async (_userBorrowData:PublicKey) => {
    try {
      const accountInfo = await connection.getAccountInfo(_userBorrowData);
      if (!accountInfo) {
        throw new Error("Account not found");
      }

      const data = accountInfo.data;

      // Parse the account data using the structure in idl.json
      const collateralAmount = BigInt(data.readBigUInt64LE(8));
      const borrowedAmount = BigInt(data.readBigUInt64LE(16));
      const lastUpdated = BigInt(data.readBigInt64LE(24));

      return {
        collateralAmount,borrowedAmount,lastUpdated
      }
    } catch (err: any) {
      console.error(err)
      return false;
    }
  };


  const fetchPoolStakingData = async (_poolStakingData:PublicKey) => {
    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(_poolStakingData));

      if (!accountInfo) {
        throw new Error("Account not found");
      }

      const data = accountInfo.data;

      const totalStaked = BigInt(data.readBigUInt64LE(8));
      const totalShares = BigInt(data.readBigUInt64LE(16));
      const totalBorrowed = BigInt(data.readBigUInt64LE(24));
      const pendingVaultProfit = BigInt(data.readBigUInt64LE(32));

      return {
        totalStaked,
        totalShares,
        totalBorrowed,
        pendingVaultProfit
      }
    } catch (err: any) {
        return false;
    }
  };


  const fetchUserStakingData = async (_userStakingData:PublicKey) => {
    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(_userStakingData));

      if (!accountInfo) {
        throw new Error("Account not found");
      }

      const data = accountInfo.data;
      const shares = BigInt(data.readBigUInt64LE(8));

      return {
        shares
      }
    } catch (err: any) {
        return false;
    }
  };
  

  const fetchSystemConfigData = async (_systemConfig:PublicKey) => {
    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(_systemConfig));
  
      if (!accountInfo) {
        throw new Error("Account not found");
      }
  
      const data = accountInfo.data;
  
      const offset = 8;
  
      const initialized = Boolean(data.readUInt8(offset));
      const authority = new PublicKey(data.slice(offset + 1, offset + 33)).toBase58();
      const poolTokenAuthority = new PublicKey(data.slice(offset + 33, offset + 65)).toBase58();
      const pumpFunProgram = new PublicKey(data.slice(offset + 65, offset + 97)).toBase58();
      const baseVirtualTokenReserves = BigInt(data.readBigUInt64LE(offset + 97));
      const baseVirtualSolReserves = BigInt(data.readBigUInt64LE(offset + 105));
      const poolTokenAuthorityBumpSeed = data.readUInt8(offset + 113);
      const borrowRatePerSecond = BigInt(data.readBigUInt64LE(offset + 114));
  
      return {
        initialized,
        authority,
        poolTokenAuthority,
        pumpFunProgram,
        baseVirtualTokenReserves,
        baseVirtualSolReserves,
        poolTokenAuthorityBumpSeed,
        borrowRatePerSecond
      };
    } catch (err: any) {
      console.error('Error fetching system config data:', err);
      return false;
    }
  };
  
  const solPriceFetch = async() =>{
    try{
      return Number(
        (await api_price_oracle("solana"))['solana']['usd']
      )

    }catch(e)
    {
      return 0;
    }
  }

/**
 * Curve data culcuation .
 */

  const curveBaseToken = BigInt('1073000000000000')
  const curveBaseSol = BigInt('30000000000')

  const culcuateBorrowAbleToken = async (
    amount:number
  )=>
  {
    let newBorrowToken = BigInt(amount);

    let borrowedToken = BigInt(0);
    let borrowedSol = BigInt(0); 
    try{
      // const borrowData =  await fetchUserBorrowData(userBorrowData);
      // if(borrowData)
      // {
      //   borrowedToken = borrowData.collateralAmount;
      //   borrowedSol = borrowData.borrowedAmount;
      // }
      if(userBorrowDataDetails)
      {
        borrowedToken = userBorrowDataDetails.collateralAmount;
        borrowedSol = userBorrowDataDetails.borrowedAmount;
      }
    }catch(e)
    {

    }
    const newToken = borrowedToken+curveBaseToken;
    const newSol = borrowedSol+curveBaseSol;

    const dSol = newSol-((newSol*newToken)/(newToken+newBorrowToken))
    return Number((Number(dSol)*0.7).toFixed(0));
  }
  
export {
    testSoalanData,
    solanaDataInit,

    fetchUserBorrowData,
    fetchPoolStakingData,
    fetchUserStakingData,
    fetchSystemConfigData,
    solPriceFetch,

    initFetchData,
    culcuateBorrowAbleToken
}