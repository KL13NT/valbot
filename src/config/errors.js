const COMMAND_DOES_NOT_EXIST =
	' لو قاصد تكتب كوماند فهي مش موجودة, متأكد انك كتبت الاسم صح؟ لو عايز تعرف ايه الكوماندز الموجودة جرب commands. اما بقى لو طلعت بتهزر فا هاجي اعلقك'
const COMMANDS_REQUIRE_2_PARAMS =
	'الأوامر بتحتاج ع الاقل كلمتين و انت كتبت اقل من كده, جرب تاني.'
const INSUFFICIENT_PARAMS_PASSED =
	'الكوماند دي بتحتاج باراميترز اكتر من كده. لو عايز تعرف ازاي تستعملها اعمل val! <command_name> help'
const SOMETHING_WENT_WRONG =
	'في حاجة غلط حصلت وانا بشغل الكوماند دي. كلم حد من الديفيلوبرز قولهم.'
const COMMAND_NOT_ALLOWED = 'مش مسمحولك تستعمل الكوماند دي'
const COMMAND_NOT_READY = 'الكوماند دي مش جاهزة دلوقتي. جرب ف وقت تاني'
const CHANNEL_NOT_FOUND = 'التشانل دي مش موجودة دلوقتي, اتاكد من الـ ID'
const MESSAGE_NOT_FOUND = 'الرسالة دي مش موجودة دلوقتي, اتاكد من الـ ID'
const ROLE_NOT_FOUND = 'الـ Role دي مش موجودة دلوقتي, اتاكد من الـ ID'
const CHANNEL_TYPE_MISMATCH = 'نوع التشانل مش مظبوط. جرب تاني.'
const PARAMS_MALFORMED = 'في حاجة غلط حصلت. الباراميترز مش مظبوطة'
const DB_INIT_FAILED = 'Failed to initialise database, retrying'
const DB_GET_COLLECTION_FAILED = 'Failed to get collection'
const DB_CREATE_COLLECTION_FAILED = 'Failed to create collection'

module.exports = {
	ERR0001: COMMAND_DOES_NOT_EXIST,
	ERR0002: COMMANDS_REQUIRE_2_PARAMS,
	ERR0003: INSUFFICIENT_PARAMS_PASSED,
	ERR0004: SOMETHING_WENT_WRONG,
	ERR0005: COMMAND_NOT_ALLOWED,
	ERR0006: COMMAND_NOT_READY,
	ERR0007: CHANNEL_NOT_FOUND,
	ERR0008: MESSAGE_NOT_FOUND,
	ERR0009: ROLE_NOT_FOUND,
	ERR0010: CHANNEL_TYPE_MISMATCH,
	ERR0011: PARAMS_MALFORMED,
	ERR0012: DB_INIT_FAILED,
	ERR0013: DB_GET_COLLECTION_FAILED,
	ERR0014: DB_CREATE_COLLECTION_FAILED
}

/**
 * To define error schema
 * [ERR0001] [Err variable value] [err.message]
 */
