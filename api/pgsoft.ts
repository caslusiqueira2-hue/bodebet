export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  const vpsUrl = `https://3.15.39.94${req.url}`;
  
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const method = req.method;
    const headers: any = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    let bodyData = req.body;
    if (bodyData && typeof bodyData === 'object' && !(bodyData instanceof Buffer)) {
      bodyData = JSON.stringify(bodyData);
    }

    const response = await fetch(vpsUrl, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? bodyData : undefined,
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const responseData = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);
    return res.status(response.status).send(responseData);
  } catch (error: any) {
    return res.status(502).json({ error: 'VPS Gateway Error', details: error.message });
  }
}
