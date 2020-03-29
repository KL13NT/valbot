const path = require('path')

const { Listener } = require('../structures')

class ConversationalListener extends Listener {
	constructor (client) {
		super(client, [
			'conversationMessage'
		])
	}

	async onConversationMessage (message){
		console.log('on conversation!')
		const { content, member, author, type } = message
		const greetingsRegex = /ها+ي+|هي|hai|hi|hui|hello|heyo|hiya|yo|مرحب/i
		const generalRegex = /how are you|how you doin|عامل ايه|اخبارك|ايه|بتعمل ايه|([a-zA-Z؀-ۿ]+)/i
		const b7bkRegex = /بحبك|شش+ بحبك/i

		const randomResponses = [
			'مش فاهم لا',
			'انتوا لو قاصدين تزلوني عشان مش فاهم انتوا كاتبين ايه مش هتعملوا فيا كده',
			'لا بص, انا اه بعرف ارد على هاي بس متوصلش بيك الجرأة تفتكر اني بوت ذكي للدرجة دي يعني, هما كام if اللي معمولينلي, خف عليا شوية بلز',
			'خنزير, عليا الطلاق خنزير :cry:',
			'اؤمر',
			'هاي',
			'الووو',
			'بحبك :heart:'
		]

		if(content.match(greetingsRegex)) message.reply('هاي, اخبارك ايه؟')
		else if(content.match(b7bkRegex))
			message.reply('انا اول مره اشوف حد بيحب بوت!', {
				files: [ {
					attachment: path.resolve(__dirname, '../media/b7bk.jpg'),
					name: 'اول مره اشوف حد بيحب بوت.jpg'
				} ]
			})
		else if(content.match(generalRegex)) message.reply(randomResponses[ Math.floor(Math.random() * randomResponses.length) ])
		else message.reply('لو محتاجين مساعدة تقدروا تكتبوا `val! help`')
	}
}

module.exports = ConversationalListener