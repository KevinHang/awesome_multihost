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

        // Initialize the ledger
        console.log('Submit querying Openstackprofile instances transaction.');
        const instancesJson = await contract.evaluateTransaction('queryOpenstackInstances');

        // Make the return more readable
        let instances = JSON.parse(instancesJson);
        instances = instances.map(instance => {
            return {
                id: instance.id,
                name: instance.name,
                status: instance.status,
                tenant_id: instance.tenant_id,
                user_id: instance.user_id,
                created: instance.created,
                updated: instance.updated,
                addresses: instance.addresses
            };
        });
        console.log(`Instances have been retrieved from the ledger: ${JSON.stringify(instances, null, 2)}`);
        // console.log('Instances have been retrieved from the ledger:', instancesJson.toString());


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
    console.log('Querying Openstack profile instances program complete.');
}).catch((e) => {
    console.log('Querying Openstack profile instances program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
