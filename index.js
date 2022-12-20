require("dotenv").config();
const {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
	TransferTransaction,
	AccountBalanceQuery,
	TokenAssociateTransaction,
} = require("@hashgraph/sdk");


const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PRIVATE_KEY);
const aliceId = AccountId.fromString(process.env.ALICE_ID);
const aliceKey = PrivateKey.fromString(process.env.ALICE_PRIVATE_KEY);


const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

const supplyKey = PrivateKey.generateED25519();

let tokenId = process.env.CNGN_TOKENS_ID;




async function main() {
    //Create a file on Hedera and store the hex-encoded bytecode
    let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("CONVEXITY NGN")
    .setTokenSymbol("CNGN")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(100000000000)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .freezeWith(client);

    let tokenCreateSign = await tokenCreateTx.sign(treasuryKey);
	let tokenCreateSubmit = await tokenCreateSign.execute(client);
	let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    // console.log("token data", tokenCreateRx);
	let tokenId = tokenCreateRx.tokenId;
    console.log("supplyKey", supplyKey);
    console.log(`- Created token with ID: ${tokenId} \n`);

}

async function associateToken() {
    	// TOKEN ASSOCIATION WITH ALICE's ACCOUNT
	let associateAliceTx = await new TokenAssociateTransaction()
    .setAccountId(aliceId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(aliceKey);
    let associateAliceTxSubmit = await associateAliceTx.execute(client);
    let associateAliceRx = await associateAliceTxSubmit.getReceipt(client);
    console.log(`- Token association with Alice's account: ${associateAliceRx.status} \n`);
}

async function checkBalance() {
    	//BALANCE CHECK
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
	console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
	var balanceCheckTx = await new AccountBalanceQuery().setAccountId(aliceId).execute(client);
	console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
}


async function transferTokens() {
    	//TRANSFER STABLECOIN FROM TREASURY TO ALICE
	let tokenTransferTx = await new TransferTransaction()
    .addTokenTransfer(tokenId, treasuryId, -5000000)
    .addTokenTransfer(tokenId, aliceId, 5000000)
    .freezeWith(client)
    .sign(treasuryKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(`\n- Stablecoin transfer from Treasury to Alice: ${tokenTransferRx.status} \n`);

    await checkBalance();
}





//     //Create new keys
// const newAccountPrivateKey = PrivateKey.generateED25519();
// const newAccountPublicKey = newAccountPrivateKey.publicKey;

// console.log("new account private key: " + newAccountPrivateKey);
// console.log("new account public key: " + newAccountPublicKey);

//   //Create a new account with 1,000 tinybar starting balance
//   const newAccountTransactionResponse = await new AccountCreateTransaction()
//   .setKey(newAccountPublicKey)
//   .setInitialBalance(Hbar.fromTinybars(1000))
//   .execute(client);

//     // Get the new account ID
//     const getReceipt = await newAccountTransactionResponse.getReceipt(client);
//     const newAccountId = getReceipt.accountId;

//     console.log("The new account ID is: " +newAccountId);

//         //Verify the account balance
//         const accountBalance = await new AccountBalanceQuery()
//         .setAccountId(newAccountId)
//         .execute(client);

//     console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");



// main();  
// associateToken();    
checkBalance();
transferTokens();
