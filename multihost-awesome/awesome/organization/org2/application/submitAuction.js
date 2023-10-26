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

        // Access network
        console.log('Use network channel: mychannel.');
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to AWESOME contract
        console.log('Use org.papernet.awesome smart contract.');
        const contract = await network.getContract('awesome');

        // source for auctionObject: https://raw.githubusercontent.com/venoivankovic/awesome_app/main/awesome_webapp/views/ui_provider/postAuction.ejs
        // Define the new auction object
        let auctionObject = {
            service: {
                commodity: {
                    docType: 'vmInstance',
                    properties: [{
                        "commodityKey": "os",
                        "commodityValue": "Ubuntu 18.04",
                        "data_object": {
                              "server": {
                                "name": "test2", // the new should be changed after each creation. Except when instance is deleted
                                "imageRef": "0525f44b-aaeb-4acd-bade-cee56d3449c0", 
                                "flavorRef": "1", 
                                "networks": [
                                  {
                                    "uuid": "8e1585a8-fdac-4296-82bf-b46a0e0ea96c" 
                                  }
                                ],
                                "security_groups": [
                                  {
                                    "name": "default"
                                  }
                                ],
                                "key_name": "cirrosSSH" // use an already created ssh key
                              }
                            },
                    }]
                },
                pricing: {
                    pricingSubscription: 'flatFee'
                },
                sloRulesAndFines: [{
                    "ruleIdentifier": "VM availability",
                    "ruleCondition": "We can ssh into the vm",
                    "ruleFine": "100",
                    "sloWitnessConfig": {
                        "rewardViolation": "5",
                        "rewardNoViolation": "10",
                        "punishmentViolation": "15",
                        "punishmentNoViolation": "20",
                        "tPeriod": {
                            "hours": "0",
                            "minutes": "0",
                            "seconds": "45"
                        }
                    }
                }, {
                    "ruleIdentifier": "VM latency",
                    "ruleCondition": "Less than 3 s",
                    "ruleFine": "50",
                    "sloWitnessConfig": {
                        "rewardViolation": "25",
                        "rewardNoViolation": "30",
                        "punishmentViolation": "35",
                        "punishmentNoViolation": "40",
                        "tPeriod": {
                            "hours": "0",
                            "minutes": "0",
                            "seconds": "45"
                        }
                    }
                }],
                witnessGlobalRules: {
                    n: '1',
                    m: '2',
                    cFee: '50',
                    pFee: '50',
                    witnessGamePeriod: {
                        days: '0',
                        hours: '1',
                        minutes: '3',
                        seconds: '0'
                    },
                    slaDeadline: '2023-12-31T23:59'
                }
            },
            auctionRules: {
                auctionDirection: 'forward',
                auctionType: 'english',
                pricing: {
                    startPrice: '100',
                    pricingReserve: '200',
                    biddingStep: '10'
                },
                deadline: '2023-07-01T00:00'
            }
        };


        // Submit submitAuction transaction
        console.log('Submit submitAuction transaction.');
        let auctionObjectJSON = JSON.stringify(auctionObject);
        const issueResponse = await contract.submitTransaction('submitAuction', 202300013, auctionObjectJSON);

        // process response
        // console.log('Process submitAuction transaction response.');
        // let result = JSON.parse(issueResponse.toString());
        // console.log(result);
        console.log('Transaction complete. Successfully submitted the auction.');

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
    console.log('Submitting auction program complete.');
}).catch((e) => {
    console.log('Submitting auction program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
