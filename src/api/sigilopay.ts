

export interface PixRequest {
  amount: number;
  client: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  profileId: string;
}

export interface PixResponse {
  transaction: {
    id: string;
    status: string;
  };
  pix: {
    code: string;
    image?: string;
  };
}

export async function generatePix(data: PixRequest): Promise<PixResponse> {
  const response = await fetch('/api/generate-pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const responseData = await response.json();

  if (!response.ok || responseData.error) {
    throw new Error(responseData.error || 'Erro ao comunicar com o servidor');
  }

  return responseData;
}
