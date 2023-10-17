Before running the ./run.sh, please execute the following command in a newly created folder (i.e. fabric) in your home directory: curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.12 1.5.6
The previous command will install the necessary fabric samples, binaries, and docker images.

When faced with this error:
Error: chaincode install failed with status: 500 - failed to invoke backing implementation of 'InstallChaincode': could not build chaincode: docker build failed: docker image build failed: docker build failed: Failed to pull hyperledger/fabric-nodeenv:2.2: no matching manifest for linux/arm64/v8 in the manifest list entries

FIX source https://github.com/hyperledger/fabric/issues/3438:
docker pull hyperledger/fabric-nodeenv:amd64-2.4.2
docker tag hyperledger/fabric-nodeenv:amd64-2.4.2 hyperledger/fabric-nodeenv:2.2

