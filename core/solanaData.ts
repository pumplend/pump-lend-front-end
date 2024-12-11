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
import BN from 'bn.js';
import * as abi from '@/core/pump_lend.json';
import { serialize , Schema,deserialize, deserializeUnchecked } from "borsh";
import { createHash } from 'crypto';

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

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const solanaDataInit = ( publicKey:PublicKey) =>
{
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

)=>
{
    const id = new Uint8Array(sighash("global","PoolStakingData"));
    console.log(id)
    const accounts = await connection.getProgramAccounts(programIdDefault, {
        filters: [
          {
            memcmp: {
                offset: 0, // 假设函数标识位于数据的起始位置
                bytes:id.toString('base64'), // 要匹配的字节值，通常是函数名或特定标识符
              },
          },
        ],
      });
      console.log("accounts :: " ,accounts)
      // Deserialize account data
      const deserializedData = accounts.map(({ pubkey, account }) => {
        const data = deserialize(
          PoolStakingDataSchema,
          PoolStakingData,
          account.data
        );
        return { pubkey: pubkey.toBase58(), data };
      });
    console.log("deserializedData :: " ,deserializedData)
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


export {
    testSoalanData,
    solanaDataInit
}