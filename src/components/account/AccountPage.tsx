import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Package,
  MapPin,
  Bell,
  LifeBuoy,
  LogOut,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const {
    user,
    userOrders,
    addresses,
    saveAddress,
    deleteAddress,
    logout,
    setActiveView,
    showToast,
  } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'notifications' | 'support'>('orders');

  // New Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState(user.name || '');
  const [addrPhone, setAddrPhone] = useState(user.phone || '');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');

  if (!user.isLoggedIn) {
    return (
      <div className="bg-[#F7EBD7] min-h-[70vh] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#FFF8EA] max-w-md w-full rounded-3xl p-8 border border-[#07545A]/15 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-[#07545A] font-display mb-2">
            Sign in to view your account
          </h2>
          <p className="text-xs text-[#687778] mb-6">
            Access your handmade order history, saved addresses, and support tickets.
          </p>
          <button
            onClick={() => setActiveView('signin')}
            className="w-full py-3 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold hover:bg-[#063F45] transition-colors cursor-pointer"
          >
            Go to Sign In Page
          </button>
        </div>
      </div>
    );
  }

  const handleSupport = (topic: string) => {
    showToast(`Support ticket opened for ${topic}`, 'Our team usually replies in under 2 hours.');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrCity.trim() || !addrPostalCode.trim()) return;
    saveAddress({
      label: addrLabel || 'Home',
      fullName: addrName || user.name,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      postalCode: addrPostalCode,
    });
    setAddrStreet('');
    setAddrCity('');
    setAddrPostalCode('');
    setIsAddingAddress(false);
    showToast('Address Saved', 'Your delivery address has been saved to your account.');
  };

  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-[#FFF8EA] rounded-3xl p-6 sm:p-8 border border-[#07545A]/10 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#07545A]/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#07545A] text-[#FFF8EA] font-bold text-xl flex items-center justify-center font-display">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#173B3D] font-display">
                {user.name || 'Curowit Member'}
              </h1>
              <p className="text-xs text-[#687778]">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-[#687778] mt-0.5">{user.phone}</p>
              )}
              <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-[#3F704B]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {user.provider === 'google'
                    ? 'Google Verified Account'
                    : 'Verified Store Account'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#E97868] hover:bg-[#E97868]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#07545A]/10">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: userOrders.length },
            { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: userOrders.length },
            { id: 'support', label: 'Care & Support', icon: LifeBuoy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#07545A] text-[#FFF8EA]'
                    : 'bg-[#FFF8EA] text-[#173B3D]/70 hover:text-[#07545A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                      isActive ? 'bg-[#F2A900] text-[#07545A]' : 'bg-[#07545A]/10 text-[#07545A]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders Content (Strictly User's Real Orders) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {userOrders.length > 0 ? (
              userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#07545A]/10">
                    <div>
                      <span className="font-bold text-sm text-[#07545A]">Order #{order.id}</span>
                      <span className="text-xs text-[#687778] ml-2">Placed on {order.date}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#3F704B]/15 text-[#3F704B]">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover bg-[#F7EBD7] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#173B3D] truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-[#687778]">
                            Qty: {item.quantity} · By {item.product.creatorName}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#07545A] tabular-nums">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#07545A]/10 flex flex-wrap items-center justify-between text-xs text-[#687778] gap-2">
                    <div>
                      Delivery to: <strong className="text-[#173B3D]">{order.shippingAddress.city}</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#07545A] tabular-nums">
                        Total: ₹{order.total}
                      </span>
                      <button
                        onClick={() =>
                          showToast(`Order #${order.id} Status: ${order.status}`, 'We will update you as your package progresses.')
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#F7EBD7] text-[#07545A] font-semibold hover:bg-[#07545A]/10 cursor-pointer"
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10">
                <Package className="w-10 h-10 text-[#07545A]/30 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#173B3D] mb-1">No Orders Yet</h3>
                <p className="text-xs text-[#687778] mb-4">
                  You haven't placed any orders with this account yet.
                </p>
                <button
                  onClick={() => setActiveView('shop')}
                  className="px-5 py-2.5 bg-[#07545A] text-[#FFF8EA] text-xs font-semibold rounded-xl hover:bg-[#063F45] transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {/* Addresses Content (User's Real Saved Addresses) */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#07545A]">Saved Delivery Addresses</h3>
              {!isAddingAddress && (
                <button
                  type="button"
                  onClick={() => {
                    setAddrName(user.name || '');
                    setAddrPhone(user.phone || '');
                    setIsAddingAddress(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-semibold hover:bg-[#063F45] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              )}
            </div>

            {isAddingAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/20 p-5 space-y-3.5"
              >
                <h4 className="text-sm font-bold text-[#07545A]">Add Delivery Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">Label</label>
                    <input
                      type="text"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      placeholder="Home / Work"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#173B3D] block mb-1">Street / House / Area</label>
                  <input
                    type="text"
                    required
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    placeholder="House no., building, street name"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">City & State</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="City, State"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#173B3D] block mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={addrPostalCode}
                      onChange={(e) => setAddrPostalCode(e.target.value)}
                      placeholder="6-digit PIN"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#F7EBD7] border border-[#07545A]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 rounded-xl bg-[#F7EBD7] text-[#173B3D] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#07545A] text-[#FFF8EA] text-xs font-bold cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/20 p-5 shadow-2xs relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#07545A] bg-[#07545A]/10 px-2.5 py-0.5 rounded">
                        {addr.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-[#687778] hover:text-[#E97868] hover:bg-[#E97868]/10 transition-colors cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-[#173B3D] mb-1">{addr.fullName}</h4>
                    <p className="text-xs text-[#173B3D]/70 leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city} - {addr.postalCode}
                      {addr.phone && (
                        <>
                          <br />
                          Phone: {addr.phone}
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingAddress && (
                <div className="text-center py-14 bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10">
                  <MapPin className="w-9 h-9 text-[#07545A]/30 mx-auto mb-2.5" />
                  <h4 className="text-sm font-bold text-[#173B3D] mb-1">No Saved Addresses</h4>
                  <p className="text-xs text-[#687778]">
                    Add a delivery address now or during checkout to save it for future orders.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* Notifications (Based on Real Account Activity) */}
        {activeTab === 'notifications' && (
          <div className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-5 space-y-3">
            {userOrders.length > 0 ? (
              userOrders.map((order) => (
                <div key={order.id} className="p-3.5 rounded-xl bg-[#F7EBD7] text-xs">
                  <span className="font-bold text-[#07545A] block mb-0.5">
                    Order #{order.id} — {order.status}
                  </span>
                  <p className="text-[#173B3D]/75">
                    Your order placed on {order.date} (₹{order.total}) is currently marked as{' '}
                    <strong>{order.status}</strong>.
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Bell className="w-8 h-8 text-[#07545A]/30 mx-auto mb-2" />
                <p className="text-xs text-[#687778]">
                  No new notifications yet. Order updates and delivery alerts will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Care & Support */}
        {activeTab === 'support' && (
          <div className="bg-[#FFF8EA] rounded-2xl border border-[#07545A]/10 p-6 space-y-4">
            <h3 className="font-bold text-base text-[#07545A] font-display">
              Curowit Customer Concierge
            </h3>
            <p className="text-xs text-[#173B3D]/75 leading-relaxed">
              Have a question about a creator’s materials, shipping transit time, or custom personalization? We are here to help you.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Order Status Inquiry', 'Custom Personalization Help', 'Artist Collaboration', 'Damaged Parcel Report'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSupport(topic)}
                  className="px-3.5 py-2 rounded-xl bg-[#F7EBD7] text-[#07545A] text-xs font-semibold hover:bg-[#07545A] hover:text-white transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
