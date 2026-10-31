/**
 * Secure email relay for the Sendhoor website.
 * Deploy as a Web app that executes as you and is accessible to anyone.
 * Before deployment, add Script Properties named OWNER_EMAIL and MAIL_RELAY_SECRET.
 */
function doPost(e) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const ownerEmail = properties.getProperty('OWNER_EMAIL');
    const relaySecret = properties.getProperty('MAIL_RELAY_SECRET');
    const request = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (!ownerEmail || !relaySecret || request.secret !== relaySecret || request.to !== ownerEmail) {
      return json({ ok: false });
    }

    if (typeof request.subject !== 'string' || typeof request.text !== 'string') {
      return json({ ok: false });
    }

    const options = {
      to: ownerEmail,
      subject: request.subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
      body: request.text.slice(0, 30000),
      name: 'Sendhoor Holidays',
    };

    if (typeof request.replyTo === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.replyTo)) {
      options.replyTo = request.replyTo;
    }

    MailApp.sendEmail(options);
    return json({ ok: true });
  } catch (error) {
    // Do not log the request body because it contains customer contact details.
    console.error('Sendhoor mail relay failed.');
    return json({ ok: false });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
