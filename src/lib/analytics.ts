/**
 * Google Ads Conversion Tracker
 * Tag ID: AW-18434893756
 * Event: Compra (JuCxCIjHh_AcELzPuNZE)
 */

const trackedTransactions = new Set<string>();

export function trackGooglePurchaseConversion(value: number, transactionId?: string) {
  const txId = transactionId || 'tx_' + Date.now();
  if (trackedTransactions.has(txId)) {
    return;
  }
  trackedTransactions.add(txId);

  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', 'conversion', {
        send_to: 'AW-18434893756/JuCxCIjHh_AcELzPuNZE',
        value: Number(value) || 1.0,
        currency: 'BRL',
        transaction_id: transactionId || '',
      });
      console.log('✅ [Google Ads] Compra conversion tracked:', {
        send_to: 'AW-18434893756/JuCxCIjHh_AcELzPuNZE',
        value: Number(value) || 1.0,
        currency: 'BRL',
        transaction_id: transactionId,
      });
    } catch (e) {
      console.warn('⚠️ [Google Ads] Failed to send conversion event:', e);
    }
  }
}
