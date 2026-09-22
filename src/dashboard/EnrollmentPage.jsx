import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle2, Loader2, Zap, AlertCircle } from 'lucide-react';

const EnrollmentPage = () => {
  const { gradeId, subjectName } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Payment State ---
  const [paymentData, setPaymentData] = useState({ name: '', card: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});

  const formattedSubject = subjectName?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "Subject";

  // --- Validation Logic ---
  const validate = () => {
    let errs = {};
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (paymentData.name.length < 3) errs.name = "Enter full name as on card";
    
    // Basic Card Check (16 digits)
    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(paymentData.card)) errs.card = "Invalid card format (16 digits required)";
    
    // Expiry Check (MM/YY)
    const expiryMatch = paymentData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
    if (!expiryMatch) {
      errs.expiry = "Use MM/YY";
    } else {
      const [_, month, year] = expiryMatch;
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errs.expiry = "Card expired";
      }
    }

    // CVV Check (3 digits)
    if (!/^\d{3}$/.test(paymentData.cvv)) errs.cvv = "Invalid CVV";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- Input Formatters ---
  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentData({ ...paymentData, card: value });
  };

  const handleExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    setPaymentData({ ...paymentData, expiry: value });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => navigate(`/classroom/${gradeId}/${subjectName}`), 2000);
      }, 2500);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
        <div className="text-center bg-white p-12 rounded-3xl border border-[#d0e4f7] shadow-lg animate-in zoom-in duration-500">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-[#0d3b72] mb-2">Payment Successful!</h2>
          <p className="text-[#6b92b8] mb-8">You are now enrolled in <br/><span className="font-bold text-[#0d3b72]">{formattedSubject} - Grade {gradeId}</span></p>
          <div className="flex items-center gap-2 justify-center text-xs text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full font-bold">
            <Loader2 size={14} className="animate-spin" /> Redirecting to Class...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6b92b8] hover:text-[#0d3b72] transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Subjects
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-[#d0e4f7] shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-[#0d3b72] mb-1">Complete Enrollment</h2>
            <p className="text-sm text-[#6b92b8] mb-8">Secure payment via EduNest Gateway.</p>

            <form onSubmit={handlePayment} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0d3b72] mb-1 block">Cardholder Name</label>
                <input 
                  type="text" 
                  value={paymentData.name}
                  onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                  placeholder="Kavindu Perera" 
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-[#d0e4f7]'}`} 
                />
                {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10}/> {errors.name}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0d3b72] mb-1 block">Card Number</label>
                <input 
                  type="text" 
                  value={paymentData.card}
                  onChange={handleCardInput}
                  placeholder="0000 0000 0000 0000" 
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all font-mono ${errors.card ? 'border-red-400 bg-red-50' : 'border-[#d0e4f7]'}`} 
                />
                {errors.card && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10}/> {errors.card}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0d3b72] mb-1 block">Expiry</label>
                  <input 
                    type="text" 
                    value={paymentData.expiry}
                    onChange={handleExpiryInput}
                    placeholder="MM/YY" 
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-[#d0e4f7]'}`} 
                  />
                  {errors.expiry && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10}/> {errors.expiry}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0d3b72] mb-1 block">CVV</label>
                  <input 
                    type="password" 
                    maxLength="3"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value.replace(/\D/g, '')})}
                    placeholder="***" 
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-[#d0e4f7]'}`} 
                  />
                  {errors.cvv && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle size={10}/> {errors.cvv}</p>}
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#0d3b72] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#1a6fc4] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/20"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                {isProcessing ? 'Verifying with Bank...' : 'Pay LKR 2,500 & Enroll'}
              </button>
            </form>
          </div>

          <div className="bg-[#0d3b72] text-white p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#f0b429]"/> Order Summary
              </h3>
              <div className="space-y-4 text-sm border-b border-white/10 pb-6 mb-6">
                <div className="flex justify-between text-white/60"><span>Subject</span><span className="font-bold text-white">{formattedSubject}</span></div>
                <div className="flex justify-between text-white/60"><span>Grade</span><span className="font-bold text-white">{gradeId}</span></div>
                <div className="flex justify-between text-white/60"><span>Type</span><span className="font-bold text-white">Monthly Access</span></div>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-[#f0b429]">LKR 2,500</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed mt-8 uppercase tracking-widest">Encrypted by AES-256 SSL Standards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;