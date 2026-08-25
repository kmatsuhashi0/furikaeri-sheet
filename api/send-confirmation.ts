export const config = {
  runtime: 'edge',
}

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: '許可されていない操作です。' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.SUBMIT_RECIPIENT_EMAIL

  if (!apiKey || !toEmail) {
    return jsonResponse(500, { error: 'サーバー側の設定が完了していません。管理者にご連絡ください。' })
  }

  let payload: { subject?: string; body?: string }
  try {
    payload = await request.json()
  } catch {
    return jsonResponse(400, { error: '送信内容の形式が正しくありません。' })
  }

  const subject = payload.subject?.trim()
  const body = payload.body?.trim()
  if (!subject || !body) {
    return jsonResponse(400, { error: '送信内容が不足しています。' })
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Furikaeri Sheet <onboarding@resend.dev>',
      to: toEmail,
      subject,
      text: body,
    }),
  })

  if (!resendResponse.ok) {
    const detail = await resendResponse.text()
    console.error('Resend API error:', detail)
    return jsonResponse(502, { error: 'メール送信に失敗しました。しばらくしてから再度お試しください。' })
  }

  return jsonResponse(200, { ok: true })
}
