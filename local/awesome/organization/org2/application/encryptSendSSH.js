/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

// -----
// Source: https://gist.githubusercontent.com/vlucas/2bd40f62d20c1d49237a109d491974eb/raw/5b418d5ae7c770c77b803723b186bdff1c0a5400/encryption.js

const crypto = require('crypto');

const ENCRYPTION_KEY = 'abcdefghijklmnopqrstuvwxzy112345'; // must be 256 bits (32 characters)
const IV_LENGTH = 16; 

// function used to encrypt 
function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
  
    return iv.toString('hex') + ':' + encrypted.toString('hex');
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

        // Store SSH Credentials
        console.log('Store SSH credentials for delivery.');
        const sshCredentials = {
            auction: 'auction1234',
            username: 'admin',
            password: '1234',
            pemKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAz6WVD8+DD1mh+BiZPHX3gqLKBZm63MrJChvK3sYZHDZXMkHi\nGeLQpKMw+11htRMqquku4E/2954zhD18zjnSpe9VQ2TB3R8Uald6cLAJ+fgRL2lj\nVRa24VgBTGH5qDj3sBrFUwG3q/R6FA5M+dpDxK33CQCUq7GKwtKI0LHHUeWg533y\nnTFMDj6g2tGZ97EQJEwKb748fBHKPZKn+BZGP8j11OGI0WWI/+YCXxDPqI9DWC04\npip0glc7eJWr9ywahB5I0sgEXE4WP5eiEoxLo90eTEznBOaV79XgbfrFoJBUkE6K\n1FdFJv5mghPfYbmflLPCKKtLZTY8kTmZ81233QIDAQABAoIBAQCxVOa9TunNlS22\n9EMBmHldbmr7Z3NnFiOk52FU6XcOWfYTrKJMmyC2ScwOD4zfGFRLC8OFu6TdiZTT\nbbOFZ2pXXdLCMG1Dy0QjITwmuqB6gvkiNW2ogDKEtiS9t7p/iM827VXxcrkKOEp9\nkEz64AUaFbuwS3esPX6UrTo8iGcBr4Dt1J21AiTbPPex9vRk8Xb9r03/v21VRBOo\narfQ8khF6KpJvAVHtrHzyD/0hNx6k1Ixgaui/2bsIm0xq5/XPzSzaaKpU+BH+uvK\nC3tzu/ikB9mQo1QsCLhMFq46ENKEBt2dcNJ56sny0T9CfsutkWe29ywuP3CP0lps\nzq9EkK59AoGBAOioqmLXVLAh9H3RZOqjZ7krHaIe4RT5nFnMwW2ckTm+LDT+AHe5\ncB8rFE9MxjVg0wtD+d8KRsc7D8KocFflnPeKjOJiBIMYXjdp2Tpb4n7BjYpYlnvG\nRBdVtsyEJ0zNFfU/hfaa0hEHJSxUlpghMsrxYp1PIYumYTSALhA04FVzAoGBAOR6\niXcvXF/HO2+7uUUGuyY6XQpbemScJ0QZNLg9L0zAU4AaLv9yzogdA3vS2fbdRJ/w\nzHsjOTlZVL1OxIEkF7TH3/r/kcYotjwqsKv88LRDK97xxhE7ZsVUfyXXA1z+hZWx\nqHKC3ykJ90AY+r7v7bTz0uI4DTNwIN8IaK+5oelvAoGBAKdJ17HYaQF4eMcbD/gS\n5JrlIJqYn3kofb6oFpENGfMuBbVYyddMVA1lOWZHquForHcWOo2gYwIQOqXZ3WWm\nKTZoviJtHhdxJxWrG1H2Dabc3zwRtKptBjrNG/J0N5nmgRplwZpu+graW2VDsUDT\n5iS8ag74fgNe79gDLpvimUd3AoGBAOE52iDfUxQndfPi/fOJextoFSeMnc5oEF0U\n699ikSn7vVRee03dgrKyxyhc5fhwjqGL4kbQpixeXyZua09SoPvYvHbVUIIix+Hv\nw1EHetB4FtsjQrjh8aE8dkp69hnJ3S1/gCnB0PLHnDBXb3ahVZY3dP8Deh/mvMCf\nrXLsbyuJAoGAcODlEjGTHQEKWGX0t3MS3MC5aX3dBidHYI+msLRewIMr7pVTAlLi\nAICxf0ILTW4S1t8BvJbLBknu4qF0kQ8YmSJmajqclGFD8ta62I99qKdy5+mAvhoL\nnAp7gnJQzvIv/WNQu4PsO4lMhFHV7JnP3gzS8rH2XRF/U21+SlU1aSc=\n-----END RSA PRIVATE KEY-----\n'
        };
        const uniqueKey = '-ffYhdashkd6728312';
        const sshCredentialsJson = JSON.stringify(sshCredentials);
        const encryptedCredentials = encrypt(sshCredentialsJson);

        await contract.submitTransaction('storeSSHCredentials', uniqueKey, encryptedCredentials);
        console.log('SSH credentials ready for delivery.');


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
