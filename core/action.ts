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

const addressBooks = ( publicKey:PublicKey) =>
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
 * Staking function
 */
const userStakeSol = async ( 
    amount:number,
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User stake sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )

      const stakeAmountInLamports = new BN(amount * LAMPORTS_PER_SOL);

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const stakeBuffer = serialize(StakeArgsSchema, args);

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","stake")),
            stakeBuffer
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userStakingData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}

const userWithdrawSol = async ( 
    amount:number,
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User withdraw sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )

      console.log(" Withdraws amount : ",amount)
      const stakeAmountInLamports = new BN(amount * LAMPORTS_PER_SOL);

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const stakeBuffer = serialize(StakeArgsSchema, args);

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","withdraw")),
            stakeBuffer
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userStakingData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}

const userBorrowToken = async ( 
    amount:number,
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
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

      console.log(" Borrow amount : ",amount)
      const stakeAmountInLamports = new BN(amount * 1e6);

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const stakeBuffer = serialize(StakeArgsSchema, args);

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","borrow")),
            stakeBuffer
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userBorrowData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}

const userRepayToken = async ( 
    publicKey:PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
)=>
{
    
    console.log(
        "🎦 User withdraw sol :",
        systemConfig.toBase58(),
        poolStakingData.toBase58(),
        userStakingData.toBase58(),
        userBorrowData.toBase58(),
        userTokenAccount.toBase58(),
        poolTokenAuthority.toBase58(),
        poolTokenAccount.toBase58(),
      )

    const data = Buffer.concat(
        [
            new Uint8Array(sighash("global","repay")),
        ]
    )
      const instruction = new TransactionInstruction({
        keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: poolStakingData, isSigner: false, isWritable: true },
            { pubkey: userBorrowData, isSigner: false, isWritable: true },
            { pubkey: poolTokenAuthority, isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
            { pubkey: systemConfig, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
        programId: programIdDefault,
        data: data
    });

    const transaction = new Transaction().add(instruction);
    transaction.feePayer = publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    console.log("🚀 final txn :: ",transaction)
    const signedTransaction = await signTransaction(transaction);

    try {
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction sent with ID:', txid);
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    
}

const getTokenBalance = async ( walletAddress: PublicKey) =>
{
  try {
    // 获取用户的 token 账户地址
    const tokenAddress = userTokenAccount;
    
    // 获取用户的 token 账户信息
    const accountInfo = await getAccount(connection, tokenAddress);
    
    // 返回余额 (以最小单位表示)
    return accountInfo.amount.toString();
  } catch (error) {
    console.error('Failed to get token balance:', error);
    return null;
  }
}


/**
 * Tools function
 */

async function createTokenMint(
    connection: any,
    payer: any,
    token_program_id: any,
) {

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    const mintLen = getMintLen([]);
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: token_program_id,
        }),
        createInitializeMintInstruction(mint, 9, payer.publicKey, null, token_program_id)
    );
    await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);

    return mint;
}

function findInstructionsId(name:string)
{
    for(let i = 0 ; i < abi.instructions.length ; i++)
        {
          if(abi.instructions[i].name == name)
          {
            return i ;
          }
        }
    return 0 ;
}

const stakeMethod = {
    name: "stake",
    accounts: [
      { name: "staker", isMut: true, isSigner: true },
      { name: "poolStakingData", isMut: true, isSigner: false },
      { name: "userStakingData", isMut: true, isSigner: false },
      { name: "poolTokenAuthority", isMut: true, isSigner: false },
      { name: "systemConfig", isMut: true, isSigner: false },
      { name: "systemProgram", isMut: false, isSigner: false }
    ],
    args: [{ name: "amount", type: "u64" }]
  };
  
// Borsh 数据结构
class StakeArgs extends Struct {
    amount: BN;
    
    constructor(fields: { amount: BN }) {
        super(fields);
        this.amount = fields.amount;
    }
}

// StakeArgs 的 Borsh schema
const StakeArgsSchema = new Map([
    [StakeArgs, { kind: "struct", fields: [["amount", "u64"]] }]
]);

function sighash(namespace: string, name: string): Buffer {
    const preimage = `${namespace}:${name}`;
    const hash = createHash('sha256'); 
    hash.update(preimage);
    const fullHash = hash.digest(); 
    return fullHash.slice(0, 8);  
}


export {
    addressBooks,
    userStakeSol,
    getTokenBalance,
    userWithdrawSol,
    userBorrowToken,
    userRepayToken
}