export const COMMAND_DOES_NOT_EXIST =
	" لو قاصد تكتب كوماند فهي مش موجودة, متأكد انك كتبت الاسم صح؟ لو عايز تعرف ايه الكوماندز الموجودة جرب commands. اما بقى لو طلعت بتهزر فا هاجي اعلقك";
export const COMMANDS_REQUIRE_2_PARAMS =
	"الأوامر بتحتاج ع الاقل كلمتين و انت كتبت اقل من كده, جرب تاني.";
export const INSUFFICIENT_PARAMS_PASSED =
	"الكوماند دي بتحتاج باراميترز اكتر من كده. لو عايز تعرف ازاي تستعملها اعمل val! <command_name> help";
export const SOMETHING_WENT_WRONG =
	"في حاجة غلط حصلت وانا بشغل الكوماند دي. كلم حد من الديفيلوبرز قولهم.";
export const COMMAND_NOT_ALLOWED = "مش مسمحولك تستعمل الكوماند دي";
export const COMMAND_NOT_READY = "الكوماند دي مش جاهزة دلوقتي. جرب ف وقت تاني";
export const CHANNEL_NOT_FOUND = "التشانل دي مش موجودة دلوقتي, اتاكد من الـ ID";
export const MESSAGE_NOT_FOUND = "الرسالة دي مش موجودة دلوقتي, اتاكد من الـ ID";
export const ROLE_NOT_FOUND = "الـ Role دي مش موجودة دلوقتي, اتاكد من الـ ID";
export const CHANNEL_TYPE_MISMATCH = "نوع التشانل مش مظبوط. جرب تاني.";
export const PARAMS_MALFORMED = "في حاجة غلط حصلت. الباراميترز مش مظبوطة";
export const DB_INIT_FAILED = "Failed to initialise database, retrying";
export const DB_GET_COLLECTION_FAILED = "Failed to get collection";
export const DB_CREATE_COLLECTION_FAILED = "Failed to create collection";

const errors: { [index: string]: string } = {
	"0001": COMMAND_DOES_NOT_EXIST,
	"0002": COMMANDS_REQUIRE_2_PARAMS,
	"0003": INSUFFICIENT_PARAMS_PASSED,
	"0004": SOMETHING_WENT_WRONG,
	"0005": COMMAND_NOT_ALLOWED,
	"0006": COMMAND_NOT_READY,
	"0007": CHANNEL_NOT_FOUND,
	"0008": MESSAGE_NOT_FOUND,
	"0009": ROLE_NOT_FOUND,
	"0010": CHANNEL_TYPE_MISMATCH,
	"0011": PARAMS_MALFORMED,
	"0012": DB_INIT_FAILED,
	"0013": DB_GET_COLLECTION_FAILED,
	"0014": DB_CREATE_COLLECTION_FAILED,
};

export default errors;

/**
 * To define error schema
 * [ERR0001] [Err variable value] [err.message]
 */
