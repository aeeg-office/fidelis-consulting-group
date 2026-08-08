'use client';

import React, { useState } from 'react';

type PlanType = 'individual' | 'family' | 'teacher' | 'school' | 'institutional';

interface Plan {
  id: string;
  type: PlanType;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  maxSeats: number;
  popular?: boolean;
  color: string;
}

interface Subscription {
  id: string;
  planName: string;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  seatsUsed: number;
  seatsTotal: number;
  startDate: string;
  endDate: string;
  amount: number;
  period: string;
}

const PLANS: Plan[] = [
  { id: 'ind-1', type: 'individual', name: 'Individual Learner', description: 'Perfect for students studying independently', price: 29, period: 'month', maxSeats: 1, features: ['Full question bank access', 'AI-powered practice sessions', 'Diagnostic assessments', 'Performance analytics', 'Speaking & writing assessment', 'Learning objects access'], color: 'from-blue-500 to-blue-600' },
  { id: 'fam-1', type: 'family', name: 'Family Plan', description: 'For up to 4 family members', price: 79, period: 'month', maxSeats: 4, popular: true, features: ['Everything in Individual', 'Up to 4 student profiles', 'Parent dashboard access', 'Family progress reports', 'Shared study schedule', 'Priority support'], color: 'from-purple-500 to-purple-600' },
  { id: 'tea-1', type: 'teacher', name: 'Teacher Pro', description: 'For educators managing multiple students', price: 49, period: 'month', maxSeats: 30, features: ['Student management dashboard', 'Assignment creation & grading', 'AI-assisted scoring', 'Class performance analytics', 'Custom assessments', 'Progress reports generator'], color: 'from-green-500 to-green-600' },
  { id: 'sch-1', type: 'school', name: 'School/Institution', description: 'For schools and learning centers', price: 499, period: 'month', maxSeats: 200, features: ['Everything in Teacher Pro', 'Up to 200 student seats', 'Admin dashboard', 'Bulk student import', 'Custom branding', 'Dedicated account manager', 'API access', 'SSO integration'], color: 'from-[#1B2A4A] to-[#2a3d6a]' },
  { id: 'ins-1', type: 'institutional', name: 'Enterprise', description: 'For large institutions and districts', price: 1999, period: 'month', maxSeats: 1000, features: ['Everything in School', 'Unlimited student seats', 'Custom integrations', 'On-premise deployment option', 'SLA guarantee', '24/7 phone support', 'Custom feature development', 'Training & onboarding'], color: 'from-amber-600 to-amber-800' },
];

export default function SubscriptionManagement({ onBack }: { onBack?: () => void }) {
  const [activeSection, setActiveSection] = useState<'plans' | 'seats' | 'billing' | 'activate'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [licenseKey, setLicenseKey] = useState('');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const subscriptions: Subscription[] = [
    { id: 'sub-1', planName: 'Teacher Pro', status: 'active', seatsUsed: 12, seatsTotal: 30, startDate: '2026-01-15', endDate: '2026-08-15', amount: 49, period: 'month' },
  ];

  const billingHistory = [
    { date: '2026-07-15', description: 'Teacher Pro - Monthly', amount: 49, status: 'paid' },
    { date: '2026-06-15', description: 'Teacher Pro - Monthly', amount: 49, status: 'paid' },
    { date: '2026-05-15', description: 'Teacher Pro - Monthly', amount: 49, status: 'paid' },
    { date: '2026-04-15', description: 'Teacher Pro - Monthly', amount: 49, status: 'paid' },
  ];

  function handleActivate() {
    if (licenseKey.trim()) {
      setActivationStatus('success');
      setTimeout(() => setActivationStatus('idle'), 3000);
    } else {
      setActivationStatus('error');
      setTimeout(() => setActivationStatus('idle'), 3000);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Subscription Management</h1>
              <p className="text-[#C9A84C] text-sm mt-0.5">Manage plans, seats, and billing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['plans', 'seats', 'billing', 'activate'] as const).map(section => (
            <button key={section} onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeSection === section ? 'bg-[#1B2A4A] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#C9A84C]'
              }`}>
              {section === 'plans' && '📋 '}{section === 'seats' && '💺 '}{section === 'billing' && '💳 '}{section === 'activate' && '🔑 '}
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {/* Plans */}
        {activeSection === 'plans' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-500 mt-1">Select the plan that fits your needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col transition-all hover:shadow-md ${
                  plan.popular ? 'border-[#C9A84C] ring-2 ring-[#C9A84C]/20 scale-105 z-10' : 'border-gray-100'
                }`}>
                  {plan.popular && (
                    <div className="text-center mb-3">
                      <span className="px-3 py-1 bg-[#C9A84C] text-[#1B2A4A] text-[10px] font-bold rounded-full uppercase tracking-wider">Most Popular</span>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center text-white text-lg mb-3`}>
                    {plan.type === 'individual' ? '👤' : plan.type === 'family' ? '👨‍👩‍👧' : plan.type === 'teacher' ? '👩‍🏫' : plan.type === 'school' ? '🏫' : '🏢'}
                  </div>
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex-1">{plan.description}</p>
                  <div className="mt-4 mb-4">
                    <span className="text-3xl font-bold text-[#1B2A4A]">${plan.price}</span>
                    <span className="text-sm text-gray-400">/{plan.period}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">Up to {plan.maxSeats} {plan.maxSeats === 1 ? 'seat' : 'seats'}</div>
                  <ul className="space-y-1.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                      plan.popular ? 'bg-[#C9A84C] text-[#1B2A4A] hover:bg-[#d4b85a]' : 'border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white'
                    }`}>
                    {plan.popular ? 'Choose Plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seat Management */}
        {activeSection === 'seats' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Seat Management</h2>
            {subscriptions.map(sub => (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{sub.planName}</h3>
                    <p className="text-sm text-gray-500">{formatDate(sub.startDate)} — {formatDate(sub.endDate)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sub.status === 'active' ? 'bg-green-100 text-green-700' :
                    sub.status === 'expiring' ? 'bg-amber-100 text-amber-700' :
                    sub.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{sub.status}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Seats Used</span>
                    <span className="font-semibold">{sub.seatsUsed} / {sub.seatsTotal}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1B2A4A] to-[#C9A84C]" style={{ width: `${(sub.seatsUsed / sub.seatsTotal) * 100}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {sub.seatsUsed < sub.seatsTotal && (
                    <button className="px-3 py-1.5 bg-[#1B2A4A] text-white rounded-lg text-xs font-medium hover:bg-[#243555]">
                      Assign Seat
                    </button>
                  )}
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                    Manage Users
                  </button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                    + Add Seats
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">Current Seat Assignments</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-gray-600">Name</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Role</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Ahmed Hassan', email: 'ahmed@example.com', role: 'Student', status: 'active' },
                    { name: 'Mariam Ibrahim', email: 'mariam@example.com', role: 'Student', status: 'active' },
                  ].map((seat, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5 font-medium text-gray-700">{seat.name}</td>
                      <td className="py-2.5 text-gray-500">{seat.email}</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">{seat.role}</span></td>
                      <td className="py-2.5"><span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs">{seat.status}</span></td>
                      <td className="py-2.5">
                        <button className="text-red-600 hover:underline text-xs">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Billing History */}
        {activeSection === 'billing' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing History</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((bill, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{formatDate(bill.date)}</td>
                      <td className="px-4 py-3 text-gray-700">{bill.description}</td>
                      <td className="px-4 py-3 text-right font-medium">${bill.amount}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs font-medium">Paid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">💳</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Visa ending in 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/2027</p>
                </div>
                <button className="ml-auto text-xs text-blue-600 hover:underline">Update</button>
              </div>
            </div>
          </div>
        )}

        {/* License Activation */}
        {activeSection === 'activate' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Activate License</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-lg">
              <div className="text-center mb-6">
                <span className="text-4xl">🔑</span>
                <h3 className="font-bold text-gray-900 mt-3">Enter License Key</h3>
                <p className="text-sm text-gray-500 mt-1">Enter your license key to activate your subscription</p>
              </div>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                className="w-full p-3 border border-gray-200 rounded-lg text-center font-mono text-lg tracking-widest mb-4"
              />
              <button onClick={handleActivate} disabled={!licenseKey.trim()}
                className="w-full py-3 bg-[#C9A84C] text-[#1B2A4A] font-bold rounded-lg hover:bg-[#d4b85a] disabled:opacity-30 transition-all">
                Activate License
              </button>
              {activationStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                  ✅ License activated successfully! Your subscription is now active.
                </div>
              )}
              {activationStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                  ❌ Invalid license key. Please check and try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}