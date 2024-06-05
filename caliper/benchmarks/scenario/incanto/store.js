/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { assert } = require('console');
const OperationBase = require('./utils/operation-base')

let pathFiles = './benchmarks/scenario/incanto/files/asset_'

/**
 * Workload module for initializing the SUT with various accounts.
 */
class Open extends OperationBase {

    /**
     * Initializes the parameters of the workload.
     */
    constructor() {
        super();
    }

    /**
     * Assemble TXs for opening new accounts.
     */
    async submitTransaction() {
        let assertID = '36'
        let json_content = this.read_json(pathFiles + assertID +'/params.json')
        let image = this.base64_encode(pathFiles + assertID + '/image.jpg')
        let stl = this.base64_encode(pathFiles + assertID + '/stl.stl')
        let fingerprint = this.base64_encode(pathFiles + assertID + '/fingerprint.csv')
        let video = this.base64_encode(pathFiles + assertID + '/video.mp4')

        await this.sutAdapter.sendRequests(this.createConnectorRequest('store', [
            '16',
            json_content.Date,
            json_content.Printer,
            json_content.Service,
            json_content.Owner,
            image,
            stl,
            json_content.PrintDuration,
            json_content.NozzleTemperature,
            json_content.PlateTemperature,
            json_content.LayerHeight,
            json_content.Resolution,
            json_content.InfillDensity,
            json_content.Material,
            json_content.Weight,
            json_content.FilamentSpent,
            fingerprint,
            video
        ]));
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new Open();
}

module.exports.createWorkloadModule = createWorkloadModule;
