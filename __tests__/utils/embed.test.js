const { MessageEmbed } = require('discord.js')
const {
	createEmbed,
	createRoleEmbed,
	createClearEmbed,
	createLevelupEmbed,
	createUserModerationEmbed
} = require('../../src/utils/embed')

describe('Embed specific utils tests', () => {
	const member = '12897361929875'
	const moderator = '19823712893512'
	const channel = '981275891279519'
	const role = '910827498127498'

	const userMention = `<@${member}>`
	const modMention = `<@${moderator}>`
	const channelMention = `<#${channel}>`
	const roleMention = `<@&${role}>`

	const date = new Date()
	const dateString = date.toUTCString()

	const title = 'Test title'
	const reason = 'This is a test reason'
	const color = '#ffcc5c'
	const count = 4

	const mockMilestone = {
		name: 'Test',
		description: 'Test description'
	}

	const mockRole = {
		name: 'Test'
	}

	const dateField = {
		name: '**Date / Time**',
		value: dateString,
		inline: true
	}

	const options = {
		title,
		color
	}

	const fields = [
		{
			name: '**User**',
			value: userMention,
			inline: true
		},
		{ name: '**User ID**', value: member, inline: true },
		{ name: '**Moderator**', value: modMention },
		{ name: '**Location**', value: channelMention, inline: true }
	]

	const moderationEmbed = new MessageEmbed({
		...options,
		fields: [...fields, { name: '**Reason**', value: reason }, dateField]
	})

	const roleEmbed = new MessageEmbed({
		...options,
		fields: [...fields, { name: '**Role**', value: roleMention }, dateField]
	})

	const levelupEmbed = new MessageEmbed({
		...options,
		title: `Achievement Unlocked - ${mockMilestone.name}`,
		description: `GG! You unlocked the ${mockMilestone.name} achievement\nYou just received the ${mockRole.name} role!`,
		footer: 'To get all available levels ask an admin/moderator.',
		timestamp: true,
		fields: [
			{ name: 'Achievement name', value: mockMilestone.name },
			{ name: 'Achievement description', value: mockMilestone.description }
		]
	})

	const clearEmbed = new MessageEmbed({
		...options,
		title: 'Message Purge',
		fields: [
			{ name: '**Moderator**', value: modMention },
			{ name: '**Location**', value: channelMention, inline: true },
			{
				name: '**Purged Amount**',
				value: `Purged **${count}** messages`,
				inline: true
			},
			dateField
		]
	})

	test('createUserModerationEmbed should return proper embed', () => {
		expect(
			createUserModerationEmbed({
				title,
				member,
				moderator,
				channel,
				reason,
				date
			})
		).toEqual(moderationEmbed)
	})

	test('createUserModerationEmbed should throw if required params are missing', () => {
		expect(() =>
			createUserModerationEmbed({
				title,
				member,
				moderator,
				channel, // reason is missing
				date
			})
		).toThrow('A reason is required')
	})

	test('createRoleEmbed should return proper embed', () => {
		expect(
			createRoleEmbed({
				title,
				member,
				moderator,
				channel,
				role,
				date
			})
		).toEqual(roleEmbed)
	})

	test('createRoleEmbed should throw if required pararms are missing', () => {
		expect(() =>
			createRoleEmbed({
				title,
				member,
				moderator,
				channel,
				date
			})
		).toThrow('A role ID is required')
	})

	test('createClearEmbed should return proper embed after purging messages', () => {
		expect(
			createClearEmbed({
				moderator,
				channel,
				count,
				date
			})
		).toEqual(clearEmbed)
	})

	test('createClearEmbed should throw if required params are missing', () => {
		expect(() =>
			createClearEmbed({
				moderator,
				channel,
				date
			})
		).toThrow('A count is required')
	})

	test('createLevelupEmbed should return proper embed', () => {
		expect(
			createLevelupEmbed({
				milestone: mockMilestone,
				role: mockRole
			})
		).toEqual(levelupEmbed)
	})

	test('createLevelupEmbed should throw if required params are missing', () => {
		expect(() =>
			createLevelupEmbed({
				milestone: mockMilestone
			})
		).toThrow('A role is required')
	})
})

describe('Embed general util tests', () => {
	const fields = [
		{
			name: 'Moderator',
			value: '<@12893712924233>',
			inline: false
		},
		{
			name: 'Some other field',
			value: 'Some other value',
			inline: true
		}
	]

	const title = 'Test title'
	const description = 'Test description'
	const color = '#ffcc5c'

	const embed = new MessageEmbed({
		title,
		description,
		color,
		fields
	})

	const generatedEmbed = createEmbed({
		fields,
		description,
		title
	})

	test('createEmbed should generate proper embed', () => {
		expect(generatedEmbed).toEqual(embed)
	})

	test('generated embed should have proper color', () => {
		expect(generatedEmbed.color).toEqual(16763996) // hex to decimal
	})

	test('generated embed should have correct number of fields', () => {
		expect(generatedEmbed.fields.length).toEqual(fields.length)
	})
})
