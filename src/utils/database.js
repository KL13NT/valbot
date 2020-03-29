/** @typedef { import('../index.types') } */
/** @typedef { import('mongodb').Db } Db */
/** @typedef { import('mongodb').DbCollectionOptions } CollectionOptions */

const {
	ERROR_DB_REACTIONROLESREMOVE_FAILED,
	ERROR_DB_REACTIONROLESADD_FAILED,
	ERROR_DATABASE_GET_COLLECTION_FAILED,
	ERROR_DATABASE_CREATE_COLLECTION_FAILED
} = require('../config/events.json')

// This file declares helper functions needed for updating and fetching data
// Most/All functions will take the `database` object that's available on the ValClient
// And each function will specialise in a specific part/job
// This will make it easier to test and work with


/**
 *
 * @param {Db} db
 * @param {ReactionRolesMessage} message
 */
async function reactionRolesMessageAdd (db, message){
	try {
		const collection = db.collection('reactionroles')
		collection.insert(message)
	}
	catch (err) {
		return Error(ERROR_DB_REACTIONROLESADD_FAILED)
	}
}

/**
 *
 * @param {Db} db
 * @param {ReactionRolesMessage} message
 */
async function reactionRolesMessageRemove (db, message){
	try{
		const collection = db.collection('reactionroles')
		collection.deleteOne(message)
	}
	catch(err){
		throw Error(ERROR_DB_REACTIONROLESREMOVE_FAILED)
	}
}

/**
 *
 * @param {Db} db
 * @param {ReactionRolesMessage} message
 */
async function getReactionRolesMessage (db, { messageId, channelId }){
	try{
		const collection = db.collection('reactionroles')
		return await collection.findOne({ messageId, channelId })
	}
	catch(err){
		throw Error(ERROR_DB_REACTIONROLESREMOVE_FAILED)
	}
}

/**
 *
 * @param {Db} db
 * @param {ReactionRolesMessage} message
 */
function reactionRolesMessageExists (db, message){
	try{
		const collection = db.collection('reactionroles')
		let returned = false

		collection.findOne(message).then(message => message? returned = true: returned = false)

		return returned
	}
	catch(err){
		return Error(ERROR_DB_REACTIONROLESREMOVE_FAILED)
	}
}



module.exports = {
	reactionRolesMessageAdd,
	reactionRolesMessageRemove,
	getReactionRolesMessage,
	reactionRolesMessageExists
}