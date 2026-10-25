import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const status = formData.get('status')?.toString()?.toLowerCase() || '';
    const txnid = formData.get('txnid')?.toString() || '';
    const udf1 = formData.get('udf1')?.toString() || '';
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId') || udf1 || txnid;
    const isSuccess = status === 'success' || url.searchParams.get('status') === 'success';

    if (orderId) {
      try {
        await supabase
          .from('orders')
          .update({
            payment_status: isSuccess ? 'paid' : 'failed',
            payment_id: txnid || undefined,
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase order payment status update error:', err);
      }
    }

    const origin = url.origin || 'https://fone-fusion-six.vercel.app';
    const redirectUrl = `${origin}/payment-status?status=${isSuccess ? 'success' : 'failure'}&orderId=${encodeURIComponent(orderId)}&txnid=${encodeURIComponent(txnid)}`;

    return NextResponse.redirect(redirectUrl, 303);
  } catch (e: any) {
    console.error('PayU callback error:', e);
    return NextResponse.redirect('https://fone-fusion-six.vercel.app/payment-status?status=failure', 303);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'failure';
  const orderId = url.searchParams.get('orderId') || '';
  const txnid = url.searchParams.get('txnid') || '';
  const isSuccess = status === 'success';

  if (orderId) {
    try {
      await supabase
        .from('orders')
        .update({
          payment_status: isSuccess ? 'paid' : 'failed',
          payment_id: txnid || undefined,
        })
        .eq('id', orderId);
    } catch (err) {
      console.warn('Supabase order update err:', err);
    }
  }

  const origin = url.origin || 'https://fone-fusion-six.vercel.app';
  return NextResponse.redirect(`${origin}/payment-status?status=${isSuccess ? 'success' : 'failure'}&orderId=${encodeURIComponent(orderId)}`, 303);
}
