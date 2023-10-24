# awesome multi-host

For both of the deployments (single-host and multi-host), please first meet following prerequisites:

 * docker
 * docker-compose
 * hyperledger fabric (fabric samples, binaries, and docker images)
 * node.js

The deployments have been testing on the following machine: MacBook Pro M2 Pro 2013.

The necessary Hyperledger Fabric files can be installed using the following command (version 2.2):

```
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.12 1.5.6
```

**For the single-host deployment:**

1. Run the following script in the local/awesome directory:

```
./run.sh
```

Known issues on ARM processor architecture:

Error: chaincode install failed with status: 500 - failed to invoke backing implementation of 'InstallChaincode': could not build chaincode: docker build failed: docker image build failed: docker build failed: Failed to pull hyperledger/fabric-nodeenv:2.2: no matching manifest for linux/arm64/v8 in the manifest list entries.

-> The 2.2 image is not supported on a ARM platform, therefore, we pull a newer image and tag it as 2.2.

Fix: 

1. Pull newer image:
```
docker pull hyperledger/fabric-nodeenv:amd64-2.4.2
```

2. Retag the new image:
```
docker tag hyperledger/fabric-nodeenv:amd64-2.4.2 hyperledger/fabric-nodeenv:2.2
```


**For the multi-host deployment:**

The instructions for deploying the framework on a multi-host setup, please follow the steps in the following folder:

```
cd multihost-awesome/awesome
```

You should find the two files:

1. Install docker guide.txt
2. Docker SWARM and CC guide.txt

For this deployment, you first need to create three virtual machines either on a cloud service platform of your choice (we used AWS), or on your local machine.

**Event listener**

The event listener application can be found in both the multi-host and single-host deployment directories.
Please have the events listener running whenever an auction ends. This is crucial as it automatically provisions the specific OpenStack instance.

```
cd multihost-awesome/awesome/organization/org2/application
```

```
node eventListener.js
```

**MiroStack:**

We followed the following steps to install MicroStack our local machine: https://opendev.org/x/microstack

