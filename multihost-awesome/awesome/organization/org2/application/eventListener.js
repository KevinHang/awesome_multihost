const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // Import the yaml module
const { exec } = require('child_process');


async function main() {
    const wallet = await Wallets.newFileSystemWallet('../identity/user/isabella/wallet');
    const gateway = new Gateway();

    try {
        const userName = 'isabella';
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:true, asLocalhost: true }
        };

        console.log('Connect to Fabric gateway.');
        await gateway.connect(connectionProfile, connectionOptions);

        console.log('Use network channel: mychannel.');
        const network = await gateway.getNetwork('mychannel');

        console.log('Use org.papernet.awesome smart contract.');
        const contract = await network.getContract('awesome');

        while (true) {
            console.log('************************ Listenting for Auction End Events ************************************');
            // Promise that waits for the event
            var instanceObject = {};
            const waitForEvent = new Promise((resolve, reject) => {
                const listener = async (event) => {
                    if (event.eventName === 'auctionEnd') {
                        event = event.payload.toString();
                        event = JSON.parse(event);
                        console.log("Received the following auction event:", event);
                        instanceObject = event;
                        resolve(); // Resolve the promise once the event is received
                    }
                };
                contract.addContractListener(listener);
            });

            await waitForEvent; // Wait for the promise to resolve

            const issueResponse = await contract.submitTransaction('queryServiceActiveStatus', 'auction202300013');


            let result = issueResponse.toString();
            console.log("Current status of auction: ", result);

            console.log("\nWinner of auction:", instanceObject.thecustomer);
            console.log("Winning bid:", instanceObject.highestBid);
            console.log("\n");

            let data_object = instanceObject?.auctobject?.service.commodity.properties[0].data_object;
            if (data_object) {
                console.log("Resource to provision:", data_object);
            } else {
                console.error("Could not extract the desired resource information.");
            }


            console.log('************************ Starting provisioning ************************************');

            function createOpenstackInstance() {
                return new Promise((resolve, reject) => {

                     // disable strict SSL for development purpose. This HAS to be changed in a production environment.
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

                    var OSWrap = require('openstack-wrapper');
                    var keystone = new OSWrap.Keystone('https://62.195.55.145:5000/v3/');


                    keystone.getToken('admin', 'XBmhca6H6VVvPQhviTigq7SZE35gLCuE', function(error, token) {
                        if (error) {
                            reject('Error in getToken:', error);
                            return;
                        }
                        console.log("Connected to OpenStack.")
                        keystone.getProjectToken(token.token, 'b80cf0fac3734a49920d3502b742a468', function(error, project_token) {
                            if (error) {
                                reject('Error in getProjectToken:', error);
                                return;
                            }

                            var nova = new OSWrap.Nova('https://62.195.55.145:8774/v2.1', project_token.token);

                            nova.createServer(data_object, function(error, instance) {
                                if (error) {
                                    reject('Error in createServer:', error);
                                    return;
                                }

                                let server_id = instance.id;
                                console.log("Creation completed.")
                                console.log("Awaiting floating IP...")
                                nova.createFloatingIp({
                                    "pool": "external"
                                }, function(err, floatingIpResponse) {
                                    if (err) {
                                        reject('Error in createFloatingIp:', err);
                                        return;
                                    }

                                    let newFloatingIp = floatingIpResponse.ip;
                                    let serverId = server_id;

                                    setTimeout(function() {
                                        nova.associateFloatingIp(serverId, newFloatingIp, function(err, response) {
                                            if (err) {
                                                reject('Error in associateFloatingIp:', err);
                                                return;
                                            } else {
                                                resolve('Instance created and IP associated successfully!');
                                            }
                                        });
                                    }, 10000);
                                });
                            });
                        });
                    });
                });
            }


            try {
                // If createOpenstackInstance is the function that handles your provisioning:
                await createOpenstackInstance();
                console.log("Provisionning completed.")

                // set status as false on completion
                console.log("Updating auction status.")
                const issueResponse1 = await contract.submitTransaction('deactivateService', 'auction202300013');
                let auctionStatus = JSON.parse(issueResponse1.toString());
                console.log("New status of auction:", auctionStatus.active, "(false = completed; pending = still provisioning)");
            } catch (error) {
                console.error("Error during provisioning:", error);
            }




            console.log('************************ Finished provisioning ************************************');

            console.log("Updating instance onto Ledger.")

            await new Promise((resolve, reject) => exec('node updateMyInstancesfromAWS.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.log("\nSuccessfully updated instances onto the ledger.")
                stderr && console.error(`stderr: ${stderr}`);
                resolve(stdout);
            }));

            console.log('************************ End Provisioning Event on Auction End. Disconnecting... *******************************************************');
        }
        
        gateway.disconnect();

    } catch (error) {
        console.error(`Failed to invoke transaction: ${error}`);
        process.exit(1);
    }
}

main();
