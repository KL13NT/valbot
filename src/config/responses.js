const COMMAND_CANCEL = 'لغيت الكوماند'
const COMMAND_ERROR = 'في حاجة غلط حصلت, جرب تاني.'
const COMMAND_NOT_UNDERSTOOD = 'مش فاهم, اتاكد انك كتبت كل حاجة صح و جرب تاني.'

const MEMBER_MUTE = 'تستاهل'
const MEMBER_UNMUTE = 'تقدر تتكلم دلوقتي. متعملهاش تاني بقى عشان مزعلش منك.'

const WARN_TOXICITY = 'لو سمحت حسنوا من اسلوبكم.'

const ROLE_ADDED = 'ضيفتلك روول جديد'
const ROLE_REMOVED = 'شيلت منك روول'

module.exports = {
	EV0001: COMMAND_CANCEL,
	EV0002: COMMAND_ERROR,
	EV0003: COMMAND_NOT_UNDERSTOOD,
	EV0004: MEMBER_MUTE,
	EV0005: MEMBER_UNMUTE,
	EV0006: WARN_TOXICITY,
	EV0007: ROLE_ADDED,
	EV0008: ROLE_REMOVED
}
