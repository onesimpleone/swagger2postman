#!/usr/bin/env node
require('dotenv').config();
const converter = require('openapi-to-postmanv2')
const collection = require('./lib/collection')
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var configModule = require('config')
config = configModule.util.loadFileConfigs(__dirname + '/config/')
const fetch = require('./lib/fetch')
const merger=require('./lib/merger')

const program = require('commander')
program.version('1.0.0')
    .option('-s, --service <service>', 'service config name from config/ (e.g. local, staging, prod)')
    .option('-r --replace [repliaces]', 'comma split api name which will replace not merge')
    .parse(process.argv)


var serviceConfig = config[program.service]
var url = serviceConfig.url
var collectionPrefix = serviceConfig.collection_prefix
var collectionName = collectionPrefix + ': API'

//ensure auth collection exists
collection.createAuthCollection(collectionPrefix + ': Auth').catch(err => {
    console.error('❌ Failed to create auth collection:', err)
})

//run update
update().catch(err => {
    console.error('❌ Update failed:', err)
})

//get swagger json
function getSwaggerJson(url) {
    return fetch({
        url: url,
        methods: 'get'
    }).then(response => {
        return response.data
    }).catch(err => {
        console.error('❌ Failed to get Swagger JSON:', err.message)
        process.exit(-1);
    })
}



async function update() {
    var swaggerJson = await getSwaggerJson(url)
    //add postman collection used info
    swaggerJson['info'] = {
        'title': collectionName,
        'version': '1.0.0'
    }
    var converterInputData = {
        'type': 'json',
        'data': swaggerJson
    }

    //use postman tool convert to postman collection
    converter.convert(converterInputData, { 'folderStrategy': 'Tags' }, async (_a, res) => {
        if (res.result === false) {
            console.error('❌ Conversion failed')
            console.error(res.reason)
            return
        }
        var convertedJson = JSON.parse(
            JSON.stringify(res.output[0].data)
        )

        var id = await collection.getCollectionId(collectionName)
        if (id === null) {
            return
        }
        var template = collection.loadApiTemplate(collectionName)
        template.collection.info._postman_id = id
        template.collection.item = convertedJson.item
        var collectionJson = template
    
        var savedCollection = await collection.getCollectionDetail(id)   
        var mergedCollection=merger.merge(savedCollection,collectionJson)    
        collection.updateCollection(id, mergedCollection, 'API collection')
    })
}