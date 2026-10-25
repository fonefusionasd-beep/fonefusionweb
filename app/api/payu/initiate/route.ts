import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount,
      productinfo,
      firstname,
      email,
      phone,
      orderId,
      key,
      salt,
      env = 'test',
    } = body;

    // Use keys from request or fall back to demo test keys
    const merchantKey = key?.trim() || process.env.PAYU_MERCHANT_KEY || 'gtKFFx';
    const merchantSalt = salt?.trim() || process.env.PAYU_MERCHANT_SALT || 'eCwWELxi';

    const txnid = 'Txn' + Date.now();
    const cleanAmount = Number(amount).toFixed(2);
    const cleanName = firstname?.trim() || 'Customer';
    const cleanEmail = email?.trim() || 'customer@example.com';
    const cleanPhone = phone?.trim() || '9999999999';
    const cleanInfo = (productinfo?.trim() || 'Mobile Accessories').substring(0, 50);
    const cleanOrderId = orderId?.trim() || txnid;

    // PayU hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    const hashString = `${merchantKey}|${txnid}|${cleanAmount}|${cleanInfo}|${cleanName}|${cleanEmail}|${cleanOrderId}|||||||||${merchantSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const origin = request.headers.get('origin') || 'https://fone-fusion-six.vercel.app';
    const actionUrl = env === 'live' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';

    return NextResponse.json({
      success: true,
      action: actionUrl,
      params: {
        key: merchantKey,
        txnid,
        amount: cleanAmount,
        productinfo: cleanInfo,
        firstname: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        udf1: cleanOrderId,
        surl: `${origin}/api/payu/callback?orderId=${encodeURIComponent(cleanOrderId)}&status=success`,
        furl: `${origin}/api/payu/callback?orderId=${encodeURIComponent(cleanOrderId)}&status=failure`,
        hash,
        service_provider: 'payu_paisa',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to initiate PayU payment' },
      { status: 500 }
    );
  }
}
