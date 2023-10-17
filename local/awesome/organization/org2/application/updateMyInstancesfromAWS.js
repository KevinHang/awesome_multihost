
// disable strict SSL for development purpose. This HAS to be changed in a production environment.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var OSWrap = require('openstack-wrapper');
var keystone = new OSWrap.Keystone('https://62.195.55.145:5000/v3/');

 
keystone.getToken('admin', 'XBmhca6H6VVvPQhviTigq7SZE35gLCuE', function(error, token){
  if(error)
  {
    console.error('an error occured', error);
  }
  else
  {
    console.log('A general token object has been retrived', token);
    //the token value (token.token) is required for project listing & getting project specific tokens
 
    keystone.getProjectToken(token.token, 'b80cf0fac3734a49920d3502b742a468', function(error, project_token){
      if(error)
      {
        console.error('an error occured', error);
      }
      else
      {
        console.log('A project specific token has been retrived', project_token);
        //the project token contains all kinds of project information
        //including endpoint urls for each of the various systems (Nova, Neutron, Glance)
        //and the token value (project_token.token) required for instantiating all non Keystone Objects
        //see the openstack docs for more specifics on the return format of this object (or print it out I suppose)

        var nova = new OSWrap.Nova('https://62.195.55.145:8774/v2.1', project_token.token);
        
        nova.listServers(function(err, response) {
          if (err) {
            console.log(err);
          } else {
              console.log('A list of servers was retrived', response);

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
                    console.log('Updating Openstack instances on your profile.');
                    await contract.submitTransaction('updateOpenstackInstances', JSON.stringify(response));
                    console.log('Openstack instances have been stored on your profile.');


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
                console.log('Updating Openstack instances on ledger program complete.');
            }).catch((e) => {
                console.log('pdating Openstack instances on ledger program exception.');
                console.log(e);
                console.log(e.stack);
                process.exit(-1);
            });

          }
        });

      }
    });
  }
});



