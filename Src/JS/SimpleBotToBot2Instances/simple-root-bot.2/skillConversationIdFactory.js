// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { SkillConversationIdFactoryBase } = require('botbuilder');
const { CosmosDbPartitionedStorage } = require('botbuilder-azure');
const ENV_FILE = require('path').join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

/**
 * A SkillConversationIdFactory that uses an in memory dictionary
 *to store and retrieve ConversationReference instances.
 */
class SkillConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor() {
        super();
        // this.refs = {};

        // Create access to CosmosDb Storage - this replaces local Memory Storage.
        this.storage = new CosmosDbPartitionedStorage({
            cosmosDbEndpoint: process.env.DB_SERVICE_ENDPOINT,
            authKey: process.env.AUTH_KEY,
            databaseId: process.env.DATABASE_ID,
            containerId: process.env.CONTAINER
        });
    }

    async createSkillConversationId(conversationReference) {

        const key = `${ conversationReference.conversation.id }-${ conversationReference.channelId }-skillconvo`;
        const skillStorage = {};
        skillStorage[key] = conversationReference;
        await this.storage.write(skillStorage);
        return key;
    }

    async getConversationReference(skillConversationId) {
        const skillConversationInfo = await this.storage.read([skillConversationId]);
        return skillConversationInfo[skillConversationId];
    }

    async deleteConversationReference(skillConversationId) {
        // this.refs[skillConversationId] = undefined;
    }
}

module.exports.SkillConversationIdFactory = SkillConversationIdFactory;
