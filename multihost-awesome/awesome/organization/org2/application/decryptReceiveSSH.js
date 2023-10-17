/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

// -----
// Source: https://gist.githubusercontent.com/vlucas/2bd40f62d20c1d49237a109d491974eb/raw/5b418d5ae7c770c77b803723b186bdff1c0a5400/encryption.js

const crypto = require('crypto');

const ENCRYPTION_KEY = 'abcdefghijklmnopqrstuvwxzy112345'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16;
  
function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
   
    decrypted = Buffer.concat([decrypted, decipher.final()]);
   
    return decrypted.toString();
}

// -----

// Connection to network using same method as shown in this example file: https://github.com/hyperledger/fabric-samples/blob/release-2.2/commercial-paper/organization/digibank/application/buy.js

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');

async function main() {
    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/isabella/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {
        // Specify userName for network access
        const userName = 'isabella';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await gateway.connect(connectionProfile, connectionOptions);

        // Access Awesome network
        console.log('Use network channel: mychannel.');
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to awesome contract
        console.log('Use org.papernet.awesome smart contract.');
        const contract = await network.getContract('awesome');

        /// Retrieve SSH Credentials

        const uniqueKey = '-ffYhdashkd6728312';

        console.log('Retrieve SSH credentials.');
        const responsePayload = await contract.evaluateTransaction('retrieveSSHCredentials', uniqueKey);
        const encryptedCredentialsRetrieved = responsePayload.toString();
        const sshCredentialsRetrieved = JSON.parse(decrypt(encryptedCredentialsRetrieved));
        console.log('SSH credentials retrieved: ', sshCredentialsRetrieved);


    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
    } finally {
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();
    }
}

main().then(() => {
    console.log('Store SSH login for delivery program complete.');
}).catch((e) => {
    console.log('Store SSH login for delivery program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
