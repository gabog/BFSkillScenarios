// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { SkillConversationIdFactoryBase, TurnContext } = require('botbuilder');
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

    async createSkillConversationIdWithOptions(options) {
        const skillConversationReference = {
            conversationReference: TurnContext.getConversationReference(options.activity),
            oAuthScope: options.fromBotOAuthScope
        };
        // This key has a 100 character limit by default. Increase with `restify.createServer({ maxParamLength: 1000 });` in index.js.
        const key = `${ options.fromBotId }-${ options.botFrameworkSkill.appId }-${ skillConversationReference.conversationReference.conversation.id }-${ skillConversationReference.conversationReference.channelId }-skillconvo`;
        const skillStorage = {};
        skillStorage[key] = skillConversationReference;
        await this.storage.write(skillStorage);
        return key;
    }

    async getSkillConversationReference(skillConversationId) {
        const skillConversationInfo = await this.storage.read([skillConversationId]);
        const skillConversationReference = skillConversationInfo[skillConversationId];
        return skillConversationReference;
    }

    async deleteConversationReference(skillConversationId) {
        // TODO: Need to implement the delete.
        // this.refs[skillConversationId] = undefined;
    }
}

module.exports.SkillConversationIdFactory = SkillConversationIdFactory;
