const { Command } = require("../structures")
const { CommandOptions } = require("../structures")

class Help extends Command {
	/**
	 * Constructs help command
	 * @param {ValClient} client
	 */
  constructor(client) {
		const options = new CommandOptions({
			name: 'help',
			cooldown: 0,
			nOfParams: 0,
			requiredRole: 'everyone',
			description: `لو محتاج مساعدة`,
			exampleUsage: `\`val! help\` او \`val! help command\``
		})

		super(client, options)
  }

  async _run(context) {
		const { message, params, channel } = context

		message.reply(`
			اهلاً اهلاً. شوف القايمة دي, متقسمه لعناوين حسب اللي انت ممكن تحتاجه
			\`\`\`md\nمساعدة في الكوماندز\n\`\`\`
			كل الكوماندز الموجودة دلوقتي ف الليست اللي تحت دي
			ولو عايز تعرف كوماند محددة او ازاي تستعملها جرب بعد اسم الكوماند تكتب help زي مثلاً \`val! clear help\`
			\`\`\`md\nلو عندك سؤال\n\`\`\`
			لو عايز تسأل على حاجة معينة ممكن تشوف تشانل <#586789353217327104> او تسأل حد من الادمنز
			\`\`\`md\nتشانلز مقفولة\n\`\`\`
			لو في تشانلز كتيرة مقفوله ليك و مش عارف تكتب فيها حاجة يبقى انت معملتش زي ما مطلوب في <#571718462179770369>, روح اقرا اللي هناك و هتعرف ازاي تفتح التشانلز دي
			\`\`\`md\nالكوماندز المتاحة حالياً\n\`\`\`\`${Object.keys(this.client.commands).join('\n')}\`
		`)


	}

}

module.exports = Help