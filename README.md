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

Workflow:

1. When ending an auction, it will emit an event (defined in *endAuction* chaincode function)
2. Events listener catches it and starts communicating with the OpenStack interface (ensure to have configured the OpenStack auhtorization config)
3. Auction gets marked as pending: *Awaiting provisioning*
4. Once provisioning has completed, it submits a list of running instances onto the ledger

**Chaincode testing:**

To benchmark the chaincode functions, we have used **Hyperledger Caliper**: https://hyperledger.github.io/caliper/vNext/fabric-tutorial/tutorials-fabric-existing/

Example benchmark (single-host, similar for multi-host):

* Chaincode function: *queryInstances*
* Worker count: 10
* txNumber: 1000
* TPS: 10, 50, 100, 200, 400, 800

```
cd local/caliper-workspace
```

```
cd local/caliper-workspace
```

```
npm install
```
Run the benchmark:
```
npx caliper launch manager --caliper-workspace ./ --caliper-networkconfig networks/networkConfig.yaml --caliper-benchconfig benchmarks/queryInstancesWk10.yaml --caliper-flow-only-test
```


**MiroStack:**

We followed the following steps to install MicroStack our local machine: https://opendev.org/x/microstack

**Related Work**

Based on:

AWESOME: an auction and witness enhanced SLA model for decentralized cloud marketplaces
https://journalofcloudcomputing.springeropen.com/articles/10.1186/s13677-022-00292-8

A Customizable dApp Framework for User Interactions in Decentralized Service Marketplaces
https://ieeexplore.ieee.org/abstract/document/9874498

