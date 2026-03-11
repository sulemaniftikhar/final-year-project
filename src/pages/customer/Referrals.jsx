import React from 'react';
import { Gift, Link as LinkIcon, Copy, Users, ArrowRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DashboardSidebar from '../../components/layout/Customer/DashboardSidebar';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';

const Referrals = () => {
  const { profile } = useAuth();
  const referralCode = profile?.referralCode || '—';
  const referralCredits = profile?.referralCredits || 0;

  const handleCopy = () => {
    if (!referralCode || referralCode === '—') return;
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-12">
      <div className="max-w-content mx-auto px-4">
        <Link to="/customer/home" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Account</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Referral Hero */}
            <Card className="p-6 md:p-8 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-white/80 mb-1">Referral Program</p>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Give PKR 250, Get PKR 250</h2>
                  <p className="text-sm md:text-base text-white/90 max-w-md">
                    Share your code with friends. They get PKR 250 off their first order, and you earn
                    PKR 250 in credits after they complete it.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
                    <Gift className="w-4 h-4" />
                    <span>Referral credits: PKR {referralCredits}</span>
                  </div>
                  <Button variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20">
                    View terms
                  </Button>
                </div>
              </div>
            </Card>

            {/* Code & Share */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Your referral code</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <LinkIcon className="w-4 h-4 text-primary-600" />
                  <span className="font-mono font-semibold text-neutral-900 tracking-widest">
                    {referralCode}
                  </span>
                </div>
                <Button variant="outline" icon={Copy} className="w-full md:w-auto" onClick={handleCopy}>
                  Copy code
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Share this code anywhere – chats, social apps, or email.
              </p>
            </Card>

            {/* How it works */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                How referrals work
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Step 1</p>
                  <p className="font-medium text-neutral-900 mb-1">Share your code</p>
                  <p className="text-sm text-neutral-600">
                    Send your referral code to friends or family.
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Step 2</p>
                  <p className="font-medium text-neutral-900 mb-1">They place an order</p>
                  <p className="text-sm text-neutral-600">
                    They get PKR 250 off their first eligible order.
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Step 3</p>
                  <p className="font-medium text-neutral-900 mb-1">You earn credits</p>
                  <p className="text-sm text-neutral-600">
                    You receive PKR 250 in credits once their order is completed.
                  </p>
                </div>
              </div>
            </Card>

            {/* History placeholder */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900">Referral history</h3>
                <Button variant="ghost" size="sm" className="text-sm text-neutral-600">
                  View details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <p className="text-sm text-neutral-500">
                You haven't referred anyone yet. Share your code to see referrals here.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
