/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

// Connection to network using same method as shown in this example file: https://github.com/hyperledger/fabric-samples/blob/release-2.2/commercial-paper/organization/digibank/application/buy.js

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');

async function main() {
    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/paul/wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {
        // Specify userName for network access
        const userName = 'paul';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org3.yaml', 'utf8'));

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

        // Login a provider
        console.log('Submit submitWitnessVote transaction.');
        const issueResponse = await contract.submitTransaction('submitWitnessVote', 'sla888', 0);

        // // process response
        // console.log('Process submitWitnessVote transaction response.');
        // let result = JSON.parse(issueResponse.toString());
        // console.log(result);
        console.log('Transaction complete. Successfully submitted witness vote.');

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
    console.log('Submitting witness vote program complete.');
}).catch((e) => {
    console.log('Submitting witness vote program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
