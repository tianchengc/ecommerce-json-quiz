type Recommendation = {
  name?: string;
  description?: string;
  image?: string;
  shopLink?: string;
};

type EmailTemplateConfig = {
  brandName?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  footerText?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildRecommendationEmailHtml(
  recommendations: Recommendation[] = [],
  reasoning = '',
  templateConfig: EmailTemplateConfig = {}
): string {
  const safeReasoning = escapeHtml(reasoning || '');
  const brandName = escapeHtml(templateConfig.brandName || 'Your Brand');
  const title = escapeHtml(templateConfig.title || 'Your Personalized Recommendations');
  const subtitle = escapeHtml(templateConfig.subtitle || 'We selected these recommendations based on your survey answers.');
  const ctaText = escapeHtml(templateConfig.ctaText || 'View Product');
  const footerText = escapeHtml(templateConfig.footerText || 'Sent from your survey app.');

  const recommendationBlocks = recommendations
    .map((item) => {
      const name = escapeHtml(item?.name || 'Recommended Product');
      const description = escapeHtml(item?.description || '');
      const image = item?.image || '';
      const shopLink = item?.shopLink || '#';

      return `
        <div style="margin:0 0 28px 0;text-align:center;">
          ${
            image
              ? `<img src="${image}" alt="${name}" width="180" height="180" style="border-radius:12px;display:block;margin:0 auto 16px;object-fit:cover;" />`
              : ''
          }
          <h3 style="font-size:20px;line-height:28px;margin:0 0 8px;color:#2d2d2d;">${name}</h3>
          <p style="font-size:14px;line-height:22px;margin:0 0 14px;color:#4b5563;">${description}</p>
          <a href="${shopLink}" style="display:inline-block;background:#bfa16b;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:600;">${ctaText}</a>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:22px 0 0;" />
        </div>
      `;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;">
          <h1 style="font-size:26px;line-height:34px;margin:0 0 8px;color:#2d2d2d;">${brandName}</h1>
          <p style="font-size:18px;line-height:26px;margin:0 0 16px;color:#6b705c;">${subtitle}</p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 16px;" />
          <p style="font-size:14px;line-height:22px;margin:0 0 22px;color:#4b5563;white-space:pre-wrap;">${safeReasoning}</p>
          ${recommendationBlocks}
          <p style="font-size:12px;line-height:18px;margin:20px 0 0;color:#a3a3a3;">${footerText}</p>
        </div>
      </body>
    </html>
  `;
}
