export const config = {
  runtime: 'edge',
}

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 20 ? parsed : fallback
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

  const url = new URL(request.url)
  const subject = url.searchParams.get('subject')?.trim()
  const total = parsePositiveInt(url.searchParams.get('total'), 1)
  const part = Math.min(parsePositiveInt(url.searchParams.get('part'), 1), total)

  const bytes = new Uint8Array(await request.arrayBuffer())
  const isPdf = bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
  if (!subject || !isPdf) {
    return jsonResponse(400, { error: '送信内容が不足しています。' })
  }

  const multiPart = total > 1
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Furikaeri Sheet <onboarding@resend.dev>',
      to: toEmail,
      subject: multiPart ? `${subject}（${part}/${total}）` : subject,
      text: multiPart
        ? `振り返りシートの回答が届きました。回答が長いため、全${total}通に分けてお送りしています（${part}通目）。添付のPDFをご確認ください。`
        : '振り返りシートの回答が届きました。添付のPDFをご確認ください。',
      attachments: [
        {
          filename: multiPart ? `furikaeri-sheet-${part}of${total}.pdf` : 'furikaeri-sheet.pdf',
          content: toBase64(bytes),
        },
      ],
    }),
  })

  if (!resendResponse.ok) {
    const detail = await resendResponse.text()
    console.error('Resend API error:', detail)
    return jsonResponse(502, { error: 'メール送信に失敗しました。しばらくしてから再度お試しください。' })
  }

  return jsonResponse(200, { ok: true })
}
