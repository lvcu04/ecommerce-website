// lvcu04/ecommerce-website/ecommerce-website-00324e89d06c51b533ee0b8d5c991011da91ce99/app/checkout/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react'; // <-- Added useCallback
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { authFetch } from '@/app/utils/authFetch';
// Remove unused Product import here if CheckoutForm is in the same file
// import { Product } from '@/app/(types)';

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
// Keep these imports here as they are used in CheckoutForm below
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutItem {
  id: number;
  quantity: number;
  product: any; // Using 'any' for simplicity, replace Product if defined elsewhere
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'YOUR_PK_TEST_KEY');


// --- PASTE CheckoutForm definition HERE, BEFORE CheckoutPageContent ---
function CheckoutForm({ items, clientSecret }: { items: CheckoutItem[], clientSecret: string }) {
  const stripe = useStripe(); // Now used
  const elements = useElements(); // Now used
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Thông tin giao hàng
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

     if (!address || !customerName || !phone) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement); // Now used
    if (!cardElement) {
        setIsProcessing(false);
        setErrorMessage("Lỗi: Không tìm thấy Card Element.");
        return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: customerName,
          phone: phone,
          address: {
            line1: address,
          },
        },
      },
    });

    if (error) {
      console.error('[stripe error]', error);
      setErrorMessage(error.message || 'Thanh toán thất bại.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('[PaymentIntent]', paymentIntent);
      alert('Đặt hàng và thanh toán thành công!');
      router.push('/orders/history');
    } else {
       setErrorMessage('Trạng thái thanh toán không thành công: ' + paymentIntent?.status);
       setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
       <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
        <input type="text" id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
        <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
      </div>

       <h2 className="text-2xl font-semibold mb-4 pt-4 border-t">Thông tin thanh toán</h2>
        <div className="p-3 border rounded-md">
          <CardElement options={{
              style: { /* styles... */ },
          }} />
        </div>

      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !clientSecret}
        className="w-full bg-lime-600 text-white py-3 rounded-full font-semibold hover:bg-lime-700 disabled:opacity-50"
      >
        {isProcessing ? 'Đang xử lý...' : `Thanh toán ${formatPrice(items.reduce((total, item) => total + item.quantity * item.product.price, 0))}`}
      </button>
    </form>
  );
}
// --- END of CheckoutForm definition ---


// --- CheckoutPageContent remains largely the same, but remove unused imports ---
function CheckoutPageContent() {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const productId = searchParams.get('productId');
  const quantity = searchParams.get('quantity');

  useEffect(() => {
    // ... (logic fetchItemsAndCreateIntent remains the same) ...
     const isBuyNow = !!productId;
    setIsLoading(true);
    setError('');
    setClientSecret(null); // Reset clientSecret

    const fetchItemsAndCreateIntent = async () => {
      let fetchedItems: CheckoutItem[] = [];
      try {
        // 1. Fetch items (giỏ hàng hoặc sản phẩm mua ngay)
        if (isBuyNow) {
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) throw new Error('Không thể tải sản phẩm.');
          const productData = await res.json();
          fetchedItems = [{ product: productData, quantity: Number(quantity || 1), id: productData.id }];
        } else {
          const res = await authFetch('/api/cart', {}, router);
          // Check for 401 Unauthorized specifically handled by authFetch
          if (!res) return; // authFetch likely redirected, stop execution
          if (!res.ok && res.status !== 401) throw new Error('Không thể tải giỏ hàng.');
          if (res.status === 401) return; // Already handled by authFetch

          const data = await res.json();
          if (data.length === 0) {
            alert('Giỏ hàng trống, bạn sẽ được chuyển về trang chủ.');
            router.push('/');
            return;
          }
          fetchedItems = data;
        }
        setItems(fetchedItems); // Cập nhật state items

        // 2. Tạo PaymentIntent sau khi đã có items
        if (fetchedItems.length > 0) {
           const intentRes = await authFetch('/api/payments/create-payment-intent', {
             method: 'POST',
           }, router);

           // Check for 401 Unauthorized again
           if (!intentRes) return; // authFetch likely redirected
           if (!intentRes.ok && intentRes.status !== 401) {
             const errorData = await intentRes.json();
             throw new Error(errorData.message || 'Không thể khởi tạo thanh toán.');
           }
           if (intentRes.status === 401) return; // Already handled by authFetch

           const intentData = await intentRes.json();
           console.log("Client Secret received:", intentData.clientSecret);
           setClientSecret(intentData.clientSecret); // Lưu clientSecret vào state
        }

      } catch (err: unknown) {
        if ((err as Error).message !== 'Unauthorized') setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemsAndCreateIntent();
  }, [router, productId, quantity]); // <-- Keep dependencies here

  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity * item.product.price, 0);
  }, [items]);

   const options: StripeElementsOptions = useMemo(() => ({
    clientSecret: clientSecret || undefined,
     appearance: { theme: 'stripe' },
   }), [clientSecret]);

  if (isLoading && !clientSecret) {
    return <div className="min-h-screen text-center py-10">Đang tải thông tin thanh toán...</div>;
  }

   if (error) {
     return <div className="min-h-screen text-center py-10 text-red-500">Lỗi: {error}</div>;
   }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">Thanh Toán</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-7/12">
           {clientSecret ? (
              // Now CheckoutForm is defined and can be used here
              <Elements stripe={stripePromise} options={options}>
                 <CheckoutForm items={items} clientSecret={clientSecret} />
              </Elements>
           ) : (
             <div className="bg-white p-8 rounded-lg shadow-md text-center">
               Đang khởi tạo cổng thanh toán... {isLoading ? '(Đang tải...)' : ''}
             </div>
           )}
        </div>
        {/* Phần hiển thị đơn hàng giữ nguyên */}
        {/* ... */}
         <div className="lg:w-5/12">
           <div className="bg-gray-50 p-6 rounded-lg shadow-lg sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Image src={item.product.imageUrl || ''} alt={item.product.name} width={64} height={64} className="rounded-md object-cover"/>
                            <div>
                                <p className="font-semibold">{item.product.name}</p>
                                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t space-y-2">
                 <div className="flex justify-between font-semibold">
                    <span>Tạm tính</span>
                    <span>{formatPrice(cartTotal)}</span>
                 </div>
                 <div className="flex justify-between text-2xl font-bold text-lime-600">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(cartTotal)}</span>
                 </div>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Component export default giữ nguyên ---
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-center py-10">Đang tải trang thanh toán...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}