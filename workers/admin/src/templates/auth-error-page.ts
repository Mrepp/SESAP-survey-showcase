export function renderAuthErrorPage(errorMessage: string, details?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Required - SESAP Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Roboto', system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .error-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 100%;
      padding: 48px 40px;
      text-align: center;
    }

    .error-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 28px;
      color: #2c3e50;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .details {
      background: #f8f9fa;
      border-left: 4px solid #e74c3c;
      padding: 16px;
      margin: 24px 0;
      text-align: left;
      border-radius: 4px;
      font-size: 14px;
      color: #555;
    }

    .steps {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
      text-align: left;
    }

    .steps h2 {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 16px;
    }

    .steps ol {
      margin-left: 20px;
    }

    .steps li {
      color: #555;
      margin-bottom: 12px;
      line-height: 1.6;
    }

    .btn {
      display: inline-block;
      padding: 12px 32px;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn:hover {
      background: #2980b9;
    }

    .footer {
      margin-top: 32px;
      font-size: 14px;
      color: #95a5a6;
    }

    code {
      background: #ecf0f1;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">🔒</div>
    <h1>Authentication Required</h1>
    <p>${errorMessage}</p>

    ${
      details
        ? `<div class="details">
        <strong>Details:</strong> ${details}
      </div>`
        : ''
    }

    <div class="steps">
      <h2>To access this admin panel:</h2>
      <ol>
        <li>Ensure <strong>Cloudflare Access</strong> is configured for this worker</li>
        <li>Configure <strong>GitHub as an identity provider</strong> in Cloudflare Zero Trust</li>
        <li>Create an <strong>Access Policy</strong> requiring GitHub authentication</li>
        <li>Add your GitHub username to the <strong>whitelist</strong> in Cloudflare KV</li>
      </ol>
    </div>

    <p>
      <a href="/" class="btn">Reload Page</a>
    </p>

    <div class="footer">
      <p>SESAP Survey Showcase Admin Panel</p>
      <p>For setup instructions, see <code>AUTH_SETUP.md</code></p>
    </div>
  </div>
</body>
</html>
  `;
}
