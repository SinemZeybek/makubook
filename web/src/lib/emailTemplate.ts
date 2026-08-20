/**
 * Shared branded HTML shell for transactional emails. Table-based and
 * inline-styled for compatibility across email clients (no <style> blocks,
 * no modern CSS -- Gmail, Outlook, and Apple Mail all render this
 * consistently).
 */
export function renderEmail({
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#faf6f0;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf6f0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <span style="font-size:24px;font-weight:800;letter-spacing:-0.02em;">
                  <span style="color:#ffc067;">Maku</span><span style="color:#561c44;">book</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;border:1px solid rgba(86,28,68,0.1);border-radius:12px;padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#561c44;">${heading}</h1>
                <div style="font-size:15px;line-height:1.6;color:rgba(86,28,68,0.8);">
                  ${bodyHtml}
                </div>
                ${
                  ctaLabel && ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                  <tr>
                    <td style="background-color:#ffc067;border-radius:8px;">
                      <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#561c44;text-decoration:none;">${ctaLabel}</a>
                    </td>
                  </tr>
                </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:24px;">
                <p style="margin:0;font-size:12px;color:rgba(86,28,68,0.5);">
                  © ${new Date().getFullYear()} Makubook · Recipes from every home, shared with the world.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
