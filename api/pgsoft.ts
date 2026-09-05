export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    return res.status(200).end();
  }

  const vpsUrl = `https://3.15.39.94${req.url}`;
  
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const method = req.method;
    const headers: Record<string, string> = {};

    let bodyData: any = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      if (req.body && typeof req.body === 'object' && !(req.body instanceof Buffer)) {
        bodyData = JSON.stringify(req.body);
        headers['content-type'] = 'application/json';
      } else if (typeof req.body === 'string') {
        bodyData = req.body;
        headers['content-type'] = req.headers['content-type'] || 'application/json';
      } else if (req.body instanceof Buffer) {
        bodyData = req.body;
        if (req.headers['content-type']) {
          headers['content-type'] = req.headers['content-type'];
        }
      }
    }

    const response = await fetch(vpsUrl, {
      method,
      headers,
      body: bodyData,
    });

    const contentType = response.headers.get('content-type');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Access-Control-Allow-Origin', '*');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    return res.status(response.status).send(buffer);
  } catch (error: any) {
    return res.status(502).json({ error: 'VPS Gateway Error', details: error.message });
  }
}
