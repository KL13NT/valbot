const { DB_COLLECTION_LEVELS } = proces.env


/**
 * @typedef {object} LevelData
 * @property {string} id
 * @property {number} score
 * @property {Date} lastMessage
 * @property {string} level
 */

class Levels {
	constructor (client){
		this.client = client
		this.members = {}
	}

	/**
	 *
	 * @param {string} memberId
	 * @param {LevelData} levelData
	 */
	addMember (memberId, levelData){	
		this.members[memberId] = levelData
	}

	memberExists (memberId){
		return this.members[memberId]
	}

	manageLevels (message){

	}

	/**
	 *
	 */
	async fetch (memberId){
		if(!this.client.database.ready()) return

		try{
			return await this.client.database
				.getDb()
				.collection(DB_COLLECTION_LEVELS)
				.findOne({ id: memberId })
		}
		catch(err){
			console.log(err)
			return false
		}
	}

	getUserScore (client, { member }){
		if(client.userScores[member.id]) return client.userScores[member.id]
		// return fetchUserScore(client, member.id)?
	}

}

function LevelUp (message){

}


function fetchUserScore (client, memberId){

}


async function userExistsDb (client, key){
	if(client.database.ready()){
		await client.database.getDb().collection(DB_COLLECTION_LEVELS).findOne({ id: key })

	}
	return false
}