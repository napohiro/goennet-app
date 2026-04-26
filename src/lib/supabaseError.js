/**
 * Supabase エラーの詳細をコンソールに出力し、
 * message / details / hint / code を含む Error を throw する。
 * 画面側では e.message を表示すれば detail も見える。
 */
export function throwSupabaseError(context, error) {
  console.error(`[Goen Net] ${context}`, {
    message: error?.message,
    details: error?.details,
    hint:    error?.hint,
    code:    error?.code,
  })
  const parts = [
    error?.message,
    error?.details && `詳細: ${error.details}`,
    error?.hint    && `ヒント: ${error.hint}`,
    error?.code    && `コード: ${error.code}`,
  ].filter(Boolean)
  throw new Error(parts.join('\n'))
}
