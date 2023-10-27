'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        if(this.workerIndex === 0) {
        
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'registerProvider',
                invokerIdentity: 'User1',
                contractArguments: [],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
        // not an exact return example when requesting list of servers from api, but serves the same purpose
        let osInstances = [{"projectID":"1","ram":"16gb","os":"ubuntu","version":"11"},{"projectID":"2","ram":"16gb","os":"ubuntu","version":"11"}];

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'updateOpenstackInstances',
            invokerIdentity: 'User1',
            contractArguments: [osInstances],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

    async submitTransaction() {

        
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'queryOpenstackInstances',
            invokerIdentity: 'User1',
            contractArguments: [],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(myArgs);
    }

    async cleanupWorkloadModule() {

        if(this.workerIndex === 0) {
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'deleteProvider',
                invokerIdentity: 'User1',
                contractArguments: [],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;