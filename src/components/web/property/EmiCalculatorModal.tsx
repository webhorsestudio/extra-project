"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function formatINR(num: number) {
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

function calculateEMI(P: number, r: number, n: number) {
  // P = principal, r = annual interest rate (percent), n = tenure in years
  const monthlyRate = r / 12 / 100;
  const totalMonths = n * 12;
  if (monthlyRate === 0) return P / totalMonths;
  const emi = P * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return emi;
}

function EmiCalculatorHeader() {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <DialogTitle className="text-2xl font-bold text-center text-[#1a2236]">EMI Calculator</DialogTitle>
      <div className="text-center text-gray-600 text-base mt-2">Find your ideal home loan right here</div>
    </div>
  );
}

interface EmiCalculatorFormProps {
  amount: number;
  setAmount: (amount: number) => void;
  interest: number;
  setInterest: (interest: number) => void;
  tenure: number;
  setTenure: (tenure: number) => void;
}

function EmiCalculatorForm({ amount, setAmount, interest, setInterest, tenure, setTenure }: EmiCalculatorFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div>
        <label className="block font-semibold mb-2">Home Loan Amount ( in ₹ )</label>
        <input
          type="number"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base mb-2"
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
          className="w-full accent-blue-900"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₹1,00,000</span>
          <span>₹1,00,00,00,000</span>
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-2">Interest ( p.a )</label>
        <input
          type="number"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base mb-2"
          value={interest}
          min={0}
          max={20}
          step={0.01}
          onChange={e => setInterest(Number(e.target.value))}
        />
        <input
          type="range"
          min={0}
          max={20}
          step={0.01}
          value={interest}
          onChange={e => setInterest(Number(e.target.value))}
          className="w-full accent-blue-900"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>20</span>
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block font-semibold mb-2">Tenure ( in years )</label>
        <input
          type="number"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base mb-2"
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
          className="w-full accent-blue-900"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>30</span>
        </div>
      </div>
    </div>
  );
}

function EmiBreakupChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  const principalAngle = (principal / total) * 360;
  // SVG pie chart
  return (
    <svg width={120} height={120} viewBox="0 0 40 40">
      <circle r="16" cx="20" cy="20" fill="#e5f6ef" />
      <path
        d={`M20 20 L20 4 A16 16 0 ${principalAngle > 180 ? 1 : 0} 1 ${20 + 16 * Math.sin((Math.PI * principalAngle) / 180)} ${20 - 16 * Math.cos((Math.PI * principalAngle) / 180)} Z`}
        fill="#003366"
      />
    </svg>
  );
}

function EmiBreakupDetails({ principal, interest, total, emi }: { principal: number; interest: number; total: number; emi: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-bold mb-2">Break-up of Total payment</div>
      <div className="flex flex-col gap-1 text-base">
        <div className="flex justify-between w-full">
          <span>Principal Amount</span>
          <span>{formatINR(principal)}</span>
        </div>
        <div className="flex justify-between w-full">
          <span>Interest Amount</span>
          <span>{formatINR(interest)}</span>
        </div>
        <div className="flex justify-between w-full">
          <span>Total Amount Payable</span>
          <span>{formatINR(total)}</span>
        </div>
        <div className="mt-2 font-semibold">Equated Monthly Installments (EMI)</div>
        <div className="text-2xl font-bold text-blue-900">{formatINR(emi)}</div>
      </div>
    </div>
  );
}

export default function EmiCalculatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = React.useState(45000000);
  const [interest, setInterest] = React.useState(10.0);
  const [tenure, setTenure] = React.useState(20);

  const emi = calculateEMI(amount, interest, tenure);
  const total = emi * tenure * 12;
  const principal = amount;
  const interestAmount = total - principal;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="!max-w-3xl !w-[98vw] max-h-[95vh] overflow-y-auto p-10 rounded-2xl">
        <EmiCalculatorHeader />
        <EmiCalculatorForm
          amount={amount}
          setAmount={setAmount}
          interest={interest}
          setInterest={setInterest}
          tenure={tenure}
          setTenure={setTenure}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-8">
          <div className="flex justify-center">
            <EmiBreakupChart principal={principal} interest={interestAmount} />
          </div>
          <EmiBreakupDetails principal={principal} interest={interestAmount} total={total} emi={emi} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 