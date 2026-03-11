import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, CreditCard, ChevronRight, ShoppingBag, MapPin } from 'lucide-react';
import { useCart } from '../../features/customer/CartContext';
import Button from '../../components/ui/Button';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';

const CartPage = () => {

    const { cartItems, removeFromCart, updateQuantity, cartTotal, restaurant, clearCart } = useCart();

    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('gpay');
    const [orderType, setOrderType] = useState('DELIVERY'); // 'DELIVERY' | 'PICKUP'

    // API Data
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [instructions, setInstructions] = useState('');

    React.useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await userService.getAddresses();
                const fetchedAddresses = res.data || [];
                setAddresses(fetchedAddresses);
                if (fetchedAddresses.length > 0) {
                    setSelectedAddress(fetchedAddresses[0]);
                }
            } catch (err) {
                console.error('Failed to load addresses:', err);
            }
        };
        fetchAddresses();
    }, []);

    // Mock Tax & Fees
    const deliveryFee = orderType === 'DELIVERY' ? 35 : 0;
    const taxes = Math.round(cartTotal * 0.05); // 5% tax
    const platformFee = 5;
    const grandTotal = cartTotal + deliveryFee + taxes + platformFee;

    const handleCheckout = async () => {
        if (!selectedMethod) {
            setPaymentError('Please select a payment method to continue.');
            return;
        }
        // Only require address for delivery orders
        if (orderType === 'DELIVERY' && !selectedAddress) {
            setPaymentError('Please add a delivery address.');
            toast.error('No delivery address selected');
            return;
        }

        setPaymentError('');
        setIsProcessing(true);

        try {
            const formattedItems = cartItems.map(item => ({
                menuItemId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: parseFloat(item.rawPrice || String(item.price).replace(/[^0-9.]/g, '') || 0)
            }));

            const payload = {
                restaurantId: restaurant.id,
                type: orderType, // 'DELIVERY' or 'PICKUP'
                items: formattedItems,
                subtotal: cartTotal,
                deliveryFee,
                taxes,
                platformFee,
                total: grandTotal,
                deliveryAddress: orderType === 'DELIVERY' && selectedAddress ? {
                    label: selectedAddress.label || 'Saved Address',
                    street: selectedAddress.street,
                    city: selectedAddress.city
                } : null,
                customerNotes: instructions,
                paymentMethod: selectedMethod === 'gpay' ? 'GOOGLE_PAY' : 'CASH'
            };

            const response = await orderService.createOrder(payload);
            toast.success('Order Placed Successfully!');
            clearCart();
            const newOrderId = response.data?.id;
            navigate(`/customer/orders/${newOrderId}`);
        } catch (error) {
            console.error('Checkout failed', error);
            toast.error(error.response?.data?.message || 'Failed to place order.');
            setPaymentError('Checkout failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
                    <p className="text-neutral-500 mb-6">Looks like you haven't added anything yet.</p>
                    <Button onClick={() => navigate('/customer/home')} className="w-full">
                        Browse Restaurants
                    </Button>
                </div>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-content mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-neutral-900">Checkout</h1>
                        <p className="text-xs text-neutral-500">{restaurant?.name}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-content mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
                {/* Left Col: Items & Delivery */}
                <div className="md:col-span-2 space-y-6">

                    {/* Order Type Toggle */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-neutral-900 mb-3">Order Type</h3>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setOrderType('DELIVERY')}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${orderType === 'DELIVERY'
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                                    }`}
                            >
                                🚚 Delivery
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderType('PICKUP')}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${orderType === 'PICKUP'
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                                    }`}
                            >
                                🏃 Pickup
                            </button>
                        </div>
                    </div>

                    {/* Address Card — only for delivery */}
                    {orderType === 'DELIVERY' && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                    Delivery Address
                                </h3>
                                <button className="text-primary-600 text-sm font-medium">Change</button>
                            </div>
                            <div className="ml-6">
                                {selectedAddress ? (
                                    <>
                                        <p className="font-medium text-neutral-900">{selectedAddress.label || 'Saved Address'}</p>
                                        <p className="text-sm text-neutral-500">{selectedAddress.street}, {selectedAddress.city}</p>
                                        <p className="text-sm text-neutral-500 mt-1">30-40 mins • Delivery to Door</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-neutral-500">No address saved. Please add one in profile.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cart Items */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-neutral-900 mb-4">Items Added</h3>
                        <div className="space-y-4">
                            {cartItems.map((item) => {
                                const itemPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
                                return (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-neutral-900">{item.name}</h4>
                                            <p className="text-sm text-neutral-500">PKR {itemPrice} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-neutral-50 rounded-lg p-1">
                                            <button
                                                onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-neutral-600 hover:text-red-500"
                                            >
                                                {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : '-'}
                                            </button>
                                            <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-green-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="w-16 text-right font-medium text-neutral-900">
                                            PKR {itemPrice * item.quantity}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Instruction */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-neutral-900 mb-2">Cooking Instructions</h3>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="e.g. Less spicy, no cutlery needed..."
                            className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500"
                            rows="2"
                        ></textarea>
                    </div>
                </div>

                {/* Right Col: Bill & Pay */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-neutral-900 mb-4">Bill Details</h3>
                        <div className="space-y-2 text-sm text-neutral-600 border-b border-neutral-100 pb-4">
                            <div className="flex justify-between">
                                <span>Item Total</span>
                                <span>PKR {cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>PKR {deliveryFee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes (5%)</span>
                                <span>PKR {taxes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span>PKR {platformFee}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-neutral-900 pt-4">
                            <span>To Pay</span>
                            <span>PKR {grandTotal}</span>
                        </div>
                    </div>

                    {/* Payment Method Stub */}
                    <button
                        type="button"
                        onClick={() => setSelectedMethod('gpay')}
                        className={`w-full bg-white p-5 rounded-xl shadow-sm border transition flex items-center justify-between ${selectedMethod === 'gpay'
                            ? 'border-primary-300 ring-2 ring-primary-100'
                            : 'border-neutral-100 hover:border-primary-200'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs font-bold">
                                GPay
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-sm text-neutral-900">Google Pay</p>
                                <p className="text-xs text-neutral-500">epaisa@gpay.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedMethod === 'gpay' && (
                                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                    Selected
                                </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-neutral-400" />
                        </div>
                    </button>

                    {paymentError && (
                        <p className="text-xs text-error mt-2">{paymentError}</p>
                    )}

                    <Button
                        onClick={handleCheckout}
                        className="w-full py-4 text-lg shadow-xl shadow-primary-500/20"
                        isLoading={isProcessing}
                    >
                        Pay PKR {grandTotal}
                    </Button>
                </div>
            </div>
        </div>
    );

};

export default CartPage;

