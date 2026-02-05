"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";


function formatINR(num: number) {
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function calculateEMI(P: number, r: number, n: number) {
  // P = principal, r = annual interest rate (percent), n = tenure in years
  const monthlyRate = r / 12 / 100;
  const totalMonths = n * 12;
  if (monthlyRate === 0) return P / totalMonths;
  const emi = P * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return emi;
}

interface MobileEmiCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  propertyPrice?: number;
}

export default function MobileEmiCalculatorModal({ open, onClose, propertyPrice }: MobileEmiCalculatorModalProps) {
  const [amount, setAmount] = React.useState(propertyPrice || 45000000);
  const [interest, setInterest] = React.useState(8.5);
  const [tenure, setTenure] = React.useState(20);

  const emi = calculateEMI(amount, interest, tenure);
  const total = emi * tenure * 12;
  const principal = amount;
  const interestAmount = total - principal;

  // Update amount when property price changes
  React.useEffect(() => {
    if (propertyPrice && propertyPrice > 0) {
      setAmount(propertyPrice);
    }
  }, [propertyPrice]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] rounded-2xl p-0 bg-white border border-gray-200 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">EMI Calculator</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-center px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-center">EMI Calculator</h2>
            <p className="text-center text-gray-600 text-sm mt-1">Find your ideal home loan</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Loan Amount */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 text-gray-800">Home Loan Amount</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base mb-3"
              value={amount}
              min={100000}
              max={1000000000}
              step={10000}
              onChange={e => setAmount(Number(e.target.value))}
            />
            <input
              type="range"
              min={100000}
              max={1000000000}
              step={10000}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full accent-[#0A1736]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>₹1L</span>
              <span>₹100Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 text-gray-800">Interest Rate (p.a)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base mb-3"
              value={interest}
              min={0}
              max={20}
              step={0.1}
              onChange={e => setInterest(Number(e.target.value))}
            />
            <input
              type="range"
              min={0}
              max={20}
              step={0.1}
              value={interest}
              onChange={e => setInterest(Number(e.target.value))}
              className="w-full accent-[#0A1736]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 text-gray-800">Tenure (years)</label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base mb-3"
              value={tenure}
              min={1}
              max={30}
              step={1}
              onChange={e => setTenure(Number(e.target.value))}
            />
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenure}
              onChange={e => setTenure(Number(e.target.value))}
              className="w-full accent-[#0A1736]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 year</span>
              <span>30 years</span>
            </div>
          </div>

          {/* EMI Result */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Monthly EMI</div>
              <div className="text-2xl font-bold text-[#0A1736]">{formatINR(emi)}</div>
            </div>
          </div>

          {/* Breakup Details */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-800">Payment Breakup</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Amount</span>
                <span className="font-medium">{formatINR(principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Amount</span>
                <span className="font-medium">{formatINR(interestAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-[#0A1736]">{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 