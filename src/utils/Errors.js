const COMMAND_DOES_NOT_EXIST =
	' لو قاصد تكتب كوماند فهي مش موجودة, متأكد انك كتبت الاسم صح؟ لو عايز تعرف ايه الكوماندز الموجودة جرب commands. اما بقى لو طلعت بتهزر فا هاجي اعلقك'

const COMMANDS_REQUIRE_2_PARAMS =
	'الأوامر بتحتاج ع الاقل كلمتين و انت كتبت اقل من كده, جرب تاني.'

const INSUFFICIENT_PARAMS_PASSED =
	'الكوماند دي بتحتاج باراميترز اكتر من كده. لو عايز تعرف ازاي تستعملها اعمل val! <command_name> help'

const GENERIC_SOMETHING_WENT_WRONG =
	'في حاجة غلط حصلت وانا بشغل الكوماند دي. كلم حد من الديفيلوبرز قولهم.'

const COMMAND_NOT_ALLOWED = 'مش مسمحولك تستعمل الكوماند دي'

module.exports = {
	COMMAND_DOES_NOT_EXIST,
	COMMANDS_REQUIRE_2_PARAMS,
	INSUFFICIENT_PARAMS_PASSED,
	GENERIC_SOMETHING_WENT_WRONG,
	COMMAND_NOT_ALLOWED
}
