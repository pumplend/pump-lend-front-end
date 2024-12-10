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
    Struct
 } from "@solana/web3.js";
import {
  mintTo,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  createInitializeMintInstruction,
  getMintLen,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import * as abi from '@/core/pump_lend.json';
import { serialize , Schema,deserialize, deserializeUnchecked } from "borsh";
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
    userTokenAccount = (getAssociatedTokenAddressSync(
        tokenMint,
        publicKey,
        true
    ))

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

      const stakeAmountInLamports = new BN(0.01 * LAMPORTS_PER_SOL);

      const stakeId=  findInstructionsId('stake')
      console.log("👷 stakeId :: ",stakeId)

      const args = new StakeArgs({ amount: stakeAmountInLamports });
      const data = Buffer.from(
        serialize
        (
            StakeArgsSchema,
             args
            )
        );

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
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());

    console.log('Stake transaction sent with ID:', txid);
    return txid;
    
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
  
  // Borsh
  class StakeArgs  extends Struct {
    amount: BN;
    constructor(fields: { amount: BN }) {
     super(fields.amount);
      this.amount = fields.amount;
    }
  }
  const StakeArgsSchema = new Map([
    [StakeArgs, { kind: "struct", fields: [["amount", "u64"]] }]
  ]);


export {
    addressBooks,
    userStakeSol
}