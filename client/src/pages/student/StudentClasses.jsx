import { useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  BookOpen, Clock, Users, CreditCard, Search,
  ArrowLeft, Play, FileText, Upload, X
} from 'lucide-react';
import { SUBJECTS, GRADES, MEDIUMS } from '../../utils/constants';

// ── Payment Modal ─────────────────────────────────────────────────
const PaymentModal = ({ cls, onClose, onSuccess }) => {
  const [method, setMethod] = useState('cash');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [form, setForm] = useState({
    cardHolder: '', cardNumber: '', cardExpiry: '', cardCVV: '',
    bankName: '', transactionRef: '', notes: '',
  });
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: myFees } = useQuery({
    queryKey: ['my-fees'],
    queryFn: () => api.get('/fees/student').then(r => r.data),
  });

  const paidFees = myFees?.fees?.filter(f =>
    String(f.classId?._id || f.classId) === String(cls._id) && f.status === 'paid'
  ) || [];

  const unpaidFees = myFees?.fees?.filter(f =>
    String(f.classId?._id || f.classId) === String(cls._id) &&
    (f.status === 'unpaid' || f.status === 'overdue')
  ) || [];

  const paidMonths = paidFees.map(f => f.month);
  const selectedFeeRecord = unpaidFees.find(f => f.month === selectedMonth);

  const getCardType = (num) => {
    const n = num.replace(/\s/g, '');
    if (n.startsWith('4')) return 'VISA';
    if (n.startsWith('5')) return 'MASTERCARD';
    if (n.startsWith('3')) return 'AMEX';
    return 'CARD';
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -5; i <= 0; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const isPaid = paidMonths.includes(value);
      const hasFeeRecord = myFees?.fees?.some(f =>
        String(f.classId?._id || f.classId) === String(cls._id) && f.month === value
      );
      const isCurrentMonth = i === 0;
      if (hasFeeRecord || isCurrentMonth) options.push({ value, label, isPaid });
    }
    return options.sort((a, b) => a.value.localeCompare(b.value));
  };

  const handleSubmit = async () => {
    if (!selectedMonth) { toast.error('Please select a month to pay for'); return; }
    if (method === 'card') {
      if (!form.cardHolder.trim()) { toast.error('Please enter cardholder name'); return; }
      if (form.cardNumber.replace(/\s/g, '').length < 16) { toast.error('Please enter valid 16-digit card number'); return; }
      if (!form.cardExpiry.trim()) { toast.error('Please enter expiry date'); return; }
      if (!form.cardCVV.trim()) { toast.error('Please enter CVV'); return; }
    }
    if (method === 'bank_transfer') {
      if (!form.bankName.trim()) { toast.error('Please enter bank name'); return; }
      if (!form.transactionRef.trim()) { toast.error('Please enter transaction reference'); return; }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('classId', cls._id);
      formData.append('amount', cls.monthlyFee);
      formData.append('method', method);
      formData.append('month', selectedMonth);
      if (selectedFeeRecord) formData.append('feeRecordId', selectedFeeRecord._id);
      if (method === 'card') {
        formData.append('cardHolderName', form.cardHolder);
        formData.append('cardLastFour', form.cardNumber.replace(/\s/g, '').slice(-4));
        formData.append('cardType', getCardType(form.cardNumber));
      } else if (method === 'bank_transfer') {
        formData.append('bankName', form.bankName);
        formData.append('transactionRef', form.transactionRef);
        if (slip) formData.append('slip', slip);
      } else {
        formData.append('notes', form.notes);
      }

      const res = await api.post('/payment-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (method === 'card' && res.data.autoApproved) {
        if (res.data.reEnrolled) {
          toast.success(`✅ Payment approved! Receipt: ${res.data.receiptNumber} — 🎉 Re-enrolled!`);
        } else if (res.data.stillOwed?.length > 0) {
          toast.success(`✅ Payment approved! Receipt: ${res.data.receiptNumber}`);
          toast.error(`⚠️ Still need to pay: ${res.data.stillOwed.join(', ')} to re-enroll`, { duration: 6000 });
        } else {
          toast.success(`✅ Card payment approved! Receipt: ${res.data.receiptNumber}`);
        }
      } else if (method === 'cash') {
        toast.success('📋 Visit the counter with cash and show your barcode!');
      } else {
        toast.success('🏦 Bank transfer submitted! Admin will verify shortly.');
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.data?.suspended) {
        toast.error(`🚫 Account Suspended! ${err.response.data.message}`, { duration: 8000 });
      } else {
        toast.error(err.response?.data?.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = generateMonthOptions();

  const getSubmitLabel = () => {
    if (loading) return 'Processing...';
    if (!selectedMonth) return '← Select a month first';
    if (method === 'card') return `💳 Pay Now — Rs. ${cls.monthlyFee?.toLocaleString()}`;
    if (method === 'cash') return `📍 View Counter Instructions`;
    return `🏦 Submit Transfer — Rs. ${cls.monthlyFee?.toLocaleString()}`;
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'white', borderRadius:'20px', width:'500px', maxHeight:'90vh', overflowY:'auto', padding:'28px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <div>
            <h3 style={{ margin:0, fontSize:'18px', fontWeight:'700', color:'#1a1a1a' }}>💳 Pay Fee</h3>
            <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#888' }}>{cls.name} — Rs. {cls.monthlyFee?.toLocaleString()}/month</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#888' }}><X size={22}/></button>
        </div>

        {unpaidFees.length > 1 && (
          <div style={{ background:'#FEF2F2', border:'1.5px solid #FCA5A5', borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
            <p style={{ margin:0, fontSize:'13px', color:'#DC2626', fontWeight:'700' }}>⚠️ You have {unpaidFees.length} unpaid months!</p>
            <p style={{ margin:'4px 0 0', fontSize:'12px', color:'#EF4444', lineHeight:'1.5' }}>You must pay ALL outstanding months to re-enroll. Pay oldest months first.</p>
            <div style={{ marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'4px' }}>
              {unpaidFees.sort((a,b) => a.month.localeCompare(b.month)).map((f, i) => (
                <span key={i} style={{ background:'#FEE2E2', color:'#DC2626', padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'700' }}>⚠️ {f.month}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#555', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>📅 Select Month to Pay *</label>
          {monthOptions.length === 0 ? (
            <div style={{ background:'#F0FBF7', borderRadius:'10px', padding:'16px', textAlign:'center' }}>
              <p style={{ margin:0, color:'#0d6b7a', fontWeight:'600', fontSize:'14px' }}>✅ No outstanding fees!</p>
              <p style={{ margin:'4px 0 0', color:'#888', fontSize:'12px' }}>All fees are paid for this class.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {monthOptions.map(opt => (
                <button key={opt.value}
                  onClick={() => !opt.isPaid && setSelectedMonth(opt.value)}
                  disabled={opt.isPaid}
                  style={{
                    padding:'12px 16px', borderRadius:'10px', border:'2px solid',
                    borderColor: selectedMonth===opt.value ? '#0d6b7a' : opt.isPaid ? '#E8E8E8' : '#E8F5F0',
                    background: selectedMonth===opt.value ? '#E4F5F7' : opt.isPaid ? '#F9F9F9' : 'white',
                    cursor: opt.isPaid ? 'not-allowed' : 'pointer',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    opacity: opt.isPaid ? 0.7 : 1, transition:'all 0.2s',
                  }}>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ margin:0, fontSize:'14px', fontWeight:'600', color: selectedMonth===opt.value ? '#0d6b7a' : opt.isPaid ? '#999' : '#1a1a1a' }}>{opt.label}</p>
                    <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#888' }}>Rs. {cls.monthlyFee?.toLocaleString()}</p>
                  </div>
                  <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px',
                    background: opt.isPaid ? '#E4F5F7' : selectedMonth===opt.value ? '#0d6b7a' : '#FEF2F2',
                    color: opt.isPaid ? '#0d6b7a' : selectedMonth===opt.value ? 'white' : '#DC2626' }}>
                    {opt.isPaid ? '✓ Paid' : 'Unpaid'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#555', marginBottom:'8px', textTransform:'uppercase' }}>Payment Method</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
            {[{ key:'cash', label:'Cash', icon:'💵' }, { key:'card', label:'Card', icon:'💳' }, { key:'bank_transfer', label:'Bank Transfer', icon:'🏦' }].map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                style={{ padding:'12px 8px', borderRadius:'12px', border:'2px solid',
                  borderColor: method===m.key ? '#0d6b7a' : '#E8E8E8',
                  background: method===m.key ? '#E4F5F7' : 'white',
                  cursor:'pointer', textAlign:'center', transition:'all 0.2s' }}>
                <div style={{ fontSize:'20px', marginBottom:'4px' }}>{m.icon}</div>
                <p style={{ margin:0, fontSize:'12px', fontWeight:'600', color:method===m.key?'#0d6b7a':'#666' }}>{m.label}</p>
              </button>
            ))}
          </div>
        </div>

        {method === 'cash' && (
          <div style={{ background:'#E4F5F7', borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
            <p style={{ margin:'0 0 12px', fontWeight:'700', color:'#0d6b7a', fontSize:'14px' }}>💵 How Cash Payment Works</p>
            {['Visit XenEdu institute counter','Show your Student ID barcode',`Pay Rs. ${cls.monthlyFee?.toLocaleString()} cash to cashier`,'Payment updates automatically in your profile! ✅'].map((step, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#0d6b7a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:'white', fontSize:'12px', fontWeight:'800' }}>{i + 1}</span>
                </div>
                <p style={{ margin:0, fontSize:'13px', color:'#444' }}>{step}</p>
              </div>
            ))}
            <p style={{ margin:'8px 0 0', fontSize:'12px', color:'#0d6b7a', fontWeight:'600' }}>📞 033-2242-2589</p>
            <textarea placeholder="Add a note (optional)..." value={form.notes} onChange={e => setForm({...form, notes:e.target.value})}
              style={{ width:'100%', marginTop:'12px', padding:'10px 12px', border:'1px solid #b8e4ea', borderRadius:'8px', fontSize:'13px', outline:'none', resize:'none', height:'70px', boxSizing:'border-box' }}/>
          </div>
        )}

        {method === 'card' && (
          <div style={{ marginBottom:'20px' }}>
            <div style={{ background:'#E4F5F7', borderRadius:'12px', padding:'14px', marginBottom:'16px', textAlign:'center', border:'2px solid #0d6b7a' }}>
              <p style={{ margin:'0 0 4px', fontSize:'12px', color:'#888' }}>Amount to Pay</p>
              <p style={{ margin:'0 0 4px', fontSize:'28px', fontWeight:'800', color:'#0d6b7a' }}>Rs. {cls.monthlyFee?.toLocaleString()}</p>
              <p style={{ margin:0, fontSize:'12px', color:'#888' }}>{cls.name} • {selectedMonth || 'Select month above'}</p>
            </div>
            <div style={{ background:`linear-gradient(135deg, ${
              form.cardNumber.replace(/\s/g,'').startsWith('5') ? '#1a1a2e, #4a4a8a' :
              form.cardNumber.replace(/\s/g,'').startsWith('3') ? '#1B4332, #40916C' : '#0d6b7a, #00b8c8'
            })`, borderRadius:'16px', padding:'22px', marginBottom:'16px', color:'white', minHeight:'180px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                <div style={{ display:'flex', gap:'5px' }}>
                  {[0,1,2,3].map(i => <div key={i} style={{ width:'10px', height:'10px', borderRadius:'50%', background:'rgba(255,255,255,0.45)' }}/>)}
                </div>
                <span style={{ fontSize:'15px', fontWeight:'800', letterSpacing:'2px' }}>{getCardType(form.cardNumber)}</span>
              </div>
              <p style={{ margin:'0 0 20px', fontSize:'20px', fontFamily:'monospace', letterSpacing:'3px', fontWeight:'600' }}>
                {(() => { const d = form.cardNumber.replace(/\s/g,''); return d.padEnd(16,'•').replace(/(.{4})/g,'$1 ').trim(); })()}
              </p>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <p style={{ margin:'0 0 3px', fontSize:'9px', color:'rgba(255,255,255,0.6)', letterSpacing:'1px' }}>CARD HOLDER</p>
                  <p style={{ margin:0, fontSize:'13px', fontWeight:'700' }}>{form.cardHolder.toUpperCase() || 'FULL NAME'}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ margin:'0 0 3px', fontSize:'9px', color:'rgba(255,255,255,0.6)', letterSpacing:'1px' }}>EXPIRES</p>
                  <p style={{ margin:0, fontSize:'13px', fontWeight:'700' }}>{form.cardExpiry || 'MM/YY'}</p>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#555', marginBottom:'6px', textTransform:'uppercase' }}>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={form.cardNumber}
                  onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,16); setForm({...form, cardNumber: d.replace(/(.{4})/g,'$1 ').trim()}); }}
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'15px', fontFamily:'monospace', outline:'none', boxSizing:'border-box', letterSpacing:'1px' }}
                  onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#555', marginBottom:'6px', textTransform:'uppercase' }}>Cardholder Name</label>
                <input type="text" placeholder="John Silva" value={form.cardHolder} onChange={e => setForm({...form, cardHolder:e.target.value})}
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#555', marginBottom:'6px', textTransform:'uppercase' }}>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" maxLength={5} value={form.cardExpiry}
                    onChange={e => { const d = e.target.value.replace(/\D/g,'').slice(0,4); setForm({...form, cardExpiry: d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d}); }}
                    style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'14px', fontFamily:'monospace', outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#555', marginBottom:'6px', textTransform:'uppercase' }}>CVV</label>
                  <input type="password" placeholder="•••" maxLength={3} value={form.cardCVV}
                    onChange={e => setForm({...form, cardCVV:e.target.value.replace(/\D/g,'').slice(0,3)})}
                    style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'12px', color:'#888' }}>Accepted:</span>
                {['VISA','MASTERCARD','AMEX'].map(card => {
                  const active = (card==='VISA' && form.cardNumber.replace(/\s/g,'').startsWith('4')) ||
                    (card==='MASTERCARD' && form.cardNumber.replace(/\s/g,'').startsWith('5')) ||
                    (card==='AMEX' && form.cardNumber.replace(/\s/g,'').startsWith('3'));
                  return (
                    <span key={card} style={{ padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'800',
                      background: active ? '#0d6b7a' : '#F5F5F5', color: active ? 'white' : '#888',
                      border: `1px solid ${active ? '#0d6b7a' : '#E0E0E0'}`, transition:'all 0.2s' }}>{card}</span>
                  );
                })}
              </div>
              <div style={{ background:'#F0FBF7', border:'1px solid #b8e4ea', borderRadius:'10px', padding:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'16px' }}>🔒</span>
                <p style={{ margin:0, fontSize:'12px', color:'#0d6b7a' }}>256-bit SSL encrypted. Card payment is processed instantly!</p>
              </div>
            </div>
          </div>
        )}

        {method === 'bank_transfer' && (
          <div style={{ marginBottom:'20px' }}>
            <div style={{ background:'#F0F4FF', borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
              <p style={{ margin:'0 0 8px', fontWeight:'700', color:'#3B5BDB', fontSize:'13px' }}>🏦 XenEdu Bank Details</p>
              {[['Bank','Bank of Ceylon'],['Account','1234-5678-9012'],['Branch','Mirigama'],['Name','XenEdu Institute']].map(([k,v])=>(
                <p key={k} style={{ margin:'2px 0', fontSize:'13px', color:'#444' }}>{k}: <strong>{v}</strong></p>
              ))}
              <p style={{ margin:'6px 0 0', fontSize:'13px', fontWeight:'700', color:'#0d6b7a' }}>Amount: Rs. {cls.monthlyFee?.toLocaleString()}</p>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>Your Bank Name *</label>
              <input type="text" placeholder="e.g. Sampath Bank, HNB..." value={form.bankName} onChange={e=>setForm({...form,bankName:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>Transaction Reference Number *</label>
              <input type="text" placeholder="Transaction ID from bank e.g. TXN123456" value={form.transactionRef} onChange={e=>setForm({...form,transactionRef:e.target.value})}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
            </div>
            <div style={{ marginBottom:'12px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>Additional Notes (Optional)</label>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any additional info..."
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E8E8E8', borderRadius:'10px', fontSize:'13px', outline:'none', resize:'none', height:'70px', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='#0d6b7a'} onBlur={e=>e.target.style.borderColor='#E8E8E8'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>Upload Bank Slip (Optional)</label>
              <label style={{ display:'flex', alignItems:'center', gap:'10px', border:'2px dashed #b8e4ea', borderRadius:'10px', padding:'14px', cursor:'pointer', background:slip?'#E4F5F7':'white' }}>
                <Upload size={20} color={slip?'#0d6b7a':'#999'}/>
                <span style={{ fontSize:'13px', color:slip?'#0d6b7a':'#888' }}>{slip?slip.name:'Click to upload slip (JPG, PNG, PDF)'}</span>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display:'none' }} onChange={e=>setSlip(e.target.files[0])}/>
              </label>
            </div>
            <div style={{ background:'#FFF9E6', border:'1px solid #F5C518', borderRadius:'10px', padding:'12px', marginTop:'12px' }}>
              <p style={{ margin:0, fontSize:'12px', color:'#856404' }}>⏳ Admin will verify within 24 hours.</p>
            </div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !selectedMonth || monthOptions.length === 0}
          style={{
            width:'100%', padding:'14px',
            background: loading||!selectedMonth ? '#ccc' :
              method==='card' ? 'linear-gradient(135deg, #0d6b7a, #00b8c8)' :
              method==='bank_transfer' ? 'linear-gradient(135deg, #3B5BDB, #5C7CFA)' :
              'linear-gradient(135deg, #0d6b7a, #00b8c8)',
            color:'white', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'700',
            cursor: loading||!selectedMonth ? 'not-allowed' : 'pointer',
            boxShadow: !selectedMonth ? 'none' : '0 4px 15px rgba(13,107,122,0.3)', transition:'all 0.2s',
          }}>
          {getSubmitLabel()}
        </button>
      </div>
    </div>
  );
};

// ── Class Detail ──────────────────────────────────────────────────
const ClassDetail = ({ cls, onBack }) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('coursework');
  const [showPayModal, setShowPayModal] = useState(false);

  const { data: courseWork } = useQuery({ queryKey:['coursework',cls._id], queryFn:()=>api.get(`/coursework/${cls._id}`).then(r=>r.data) });
  const { data: myRequests } = useQuery({ queryKey:['my-payment-requests'], queryFn:()=>api.get('/payment-requests/my').then(r=>r.data) });
  const { data: myFees } = useQuery({ queryKey:['my-fees'], queryFn:()=>api.get('/fees/student').then(r=>r.data) });
  const { data: studentDash } = useQuery({ queryKey:['student-dashboard'], queryFn:()=>api.get('/dashboard/student').then(r=>r.data) });

  const isSuspended = studentDash?.student?.status === 'suspended';
  const suspendReason = studentDash?.student?.suspendReason;
  const pendingRequestForClass = myRequests?.requests?.find(r=>r.classId?._id===cls._id && r.status==='pending');

  const typeColors = {
    recording:   { bg:'#EEF2FF', color:'#3B5BDB', icon:'🎥' },
    instruction: { bg:'#E4F5F7', color:'#0d6b7a', icon:'📋' },
    assignment:  { bg:'#FFF9E6', color:'#856404', icon:'📝' },
    notes:       { bg:'#F5F0FF', color:'#6B17CC', icon:'📄' },
  };

  const statusColors = {
    pending:  { bg:'#FFF9E6', color:'#856404', label:'Pending Review' },
    approved: { bg:'#E4F5F7', color:'#0d6b7a', label:'Approved ✓' },
    rejected: { bg:'#FEF2F2', color:'#DC2626', label:'Rejected' },
  };

  const paidFees   = myFees?.fees?.filter(f=>String(f.classId?._id||f.classId)===String(cls._id)&&f.status==='paid')||[];
  const unpaidFees = myFees?.fees?.filter(f=>String(f.classId?._id||f.classId)===String(cls._id)&&(f.status==='unpaid'||f.status==='overdue'))||[];

  return (
    <div>
      {showPayModal && (
        <PaymentModal cls={cls} onClose={()=>setShowPayModal(false)} onSuccess={()=>{
          queryClient.invalidateQueries(['my-payment-requests']);
          queryClient.invalidateQueries(['my-fees']);
          queryClient.invalidateQueries(['student-dashboard']);
        }}/>
      )}

      <div style={{ background:'linear-gradient(135deg, #0d6b7a, #00b8c8)', borderRadius:'16px', padding:'24px', marginBottom:'24px', color:'white' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', color:'white', fontSize:'13px', marginBottom:'16px' }}>
          <ArrowLeft size={16}/> Back to classes
        </button>
        <h2 style={{ margin:'0 0 6px', fontSize:'22px', fontWeight:'800' }}>{cls.name}</h2>
        <p style={{ margin:0, opacity:0.85, fontSize:'14px' }}>{cls.subject} • {cls.grade} • {cls.medium} • {cls.hall}</p>
        <p style={{ margin:'6px 0 0', opacity:0.75, fontSize:'13px' }}>{cls.schedule?.dayOfWeek} at {cls.schedule?.startTime} • Teacher: {cls.teacherId?.userId?.name||'Not assigned'}</p>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px', background:'white', padding:'6px', borderRadius:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', width:'fit-content' }}>
        {[{key:'coursework',label:'📚 Course Work'},{key:'payment',label:'💳 Payment'}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ padding:'10px 20px', borderRadius:'8px', border:'none', background:tab===t.key?'#0d6b7a':'transparent', color:tab===t.key?'white':'#666', fontWeight:'600', fontSize:'14px', cursor:'pointer', transition:'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='coursework' && (
        <div>
          {(!courseWork?.items || courseWork.items.length === 0) && (
            <div style={{ background:'white', borderRadius:'16px', padding:'48px', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize:'32px', marginBottom:'12px' }}>📚</p>
              <p style={{ color:'#888', fontSize:'15px', fontWeight:'600' }}>No course work yet</p>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {courseWork?.items?.map((item,i)=>{
              const s=typeColors[item.type]||typeColors.instruction;
              return (
                <div key={i} style={{ background:'white', borderRadius:'14px', padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #F0F0F0', display:'flex', gap:'16px', alignItems:'flex-start' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <p style={{ margin:0, fontWeight:'700', color:'#1a1a1a', fontSize:'15px' }}>{item.title}</p>
                        <span style={{ display:'inline-block', marginTop:'4px', background:s.bg, color:s.color, fontSize:'11px', fontWeight:'600', padding:'2px 10px', borderRadius:'20px', textTransform:'capitalize' }}>{item.type}</span>
                      </div>
                      <p style={{ margin:0, fontSize:'12px', color:'#aaa' }}>{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    {item.description && <p style={{ margin:'8px 0 0', fontSize:'13px', color:'#666', lineHeight:'1.5' }}>{item.description}</p>}
                    {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'10px', color:'#0d6b7a', fontSize:'13px', fontWeight:'600', textDecoration:'none' }}><Play size={14}/> Watch Recording</a>}
                    {item.fileUrl && <a href={`https://192.168.0.72:5000${item.fileUrl}`} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'10px', color:'#0d6b7a', fontSize:'13px', fontWeight:'600', textDecoration:'none' }}><FileText size={14}/> {item.fileName||'Download File'}</a>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==='payment' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Suspension banner */}
          {isSuspended && (
            <div style={{ background:'#FEF2F2', border:'2px solid #FCA5A5', borderRadius:'16px', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <span style={{ fontSize:'24px' }}>🚫</span>
                <h3 style={{ margin:0, fontSize:'16px', fontWeight:'800', color:'#DC2626' }}>Account Suspended</h3>
              </div>
              <p style={{ margin:'0 0 8px', fontSize:'13px', color:'#EF4444', lineHeight:'1.6' }}>
                Your account has been suspended. You cannot make payments or enroll in new classes until the suspension is lifted by the admin.
              </p>
              {suspendReason && (
                <div style={{ background:'#FEE2E2', borderRadius:'8px', padding:'10px 14px', marginBottom:'10px' }}>
                  <p style={{ margin:0, fontSize:'13px', color:'#DC2626', fontWeight:'700' }}>📋 Reason: {suspendReason}</p>
                </div>
              )}
              <p style={{ margin:0, fontSize:'12px', color:'#888' }}>📞 Contact institute: 033-2242-2589</p>
            </div>
          )}

          {/* Fee summary */}
          <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:'16px', fontWeight:'700', color:'#1a1a1a' }}>Fee Summary</h3>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ margin:0, fontSize:'14px', color:'#666' }}>Monthly Fee</p>
                <p style={{ margin:'4px 0 0', fontSize:'28px', fontWeight:'800', color:'#0d6b7a' }}>Rs. {cls.monthlyFee?.toLocaleString()}</p>
                {unpaidFees.length > 0 && (
                  <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#DC2626', fontWeight:'600' }}>
                    ⚠️ {unpaidFees.length} unpaid month{unpaidFees.length>1?'s':''}
                    {unpaidFees.length > 1 && ' — must pay ALL to re-enroll'}
                  </p>
                )}
              </div>
              {pendingRequestForClass ? (
                <div style={{ background:'#FFF9E6', color:'#856404', padding:'8px 16px', borderRadius:'20px', fontWeight:'700', fontSize:'13px' }}>⏳ Pending Review</div>
              ) : (
                <button onClick={() => !isSuspended && setShowPayModal(true)} disabled={isSuspended}
                  style={{
                    background: isSuspended ? '#ccc' : 'linear-gradient(135deg, #0d6b7a, #00b8c8)',
                    color:'white', border:'none', borderRadius:'12px', padding:'12px 24px', fontWeight:'700', fontSize:'14px',
                    cursor: isSuspended ? 'not-allowed' : 'pointer',
                    boxShadow: isSuspended ? 'none' : '0 4px 15px rgba(13,107,122,0.3)',
                  }}>
                  {isSuspended ? '🚫 Suspended' : 'Pay Now'}
                </button>
              )}
            </div>
          </div>

          {unpaidFees.length > 0 && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:'16px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin:'0 0 10px', fontSize:'14px', fontWeight:'700', color:'#DC2626' }}>⚠️ Outstanding Fees</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {unpaidFees.sort((a,b)=>a.month.localeCompare(b.month)).map((fee,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', borderRadius:'8px', padding:'8px 12px' }}>
                    <span style={{ fontSize:'13px', fontWeight:'600', color:'#DC2626' }}>📅 {fee.month}</span>
                    <span style={{ fontSize:'13px', fontWeight:'700', color:'#1a1a1a' }}>Rs. {fee.amount?.toLocaleString()}</span>
                    <span style={{ fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', background:'#FEE2E2', color:'#DC2626', textTransform:'uppercase' }}>{fee.status}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin:'10px 0 0', fontSize:'12px', color:'#EF4444' }}>
                Total outstanding: <strong>Rs. {unpaidFees.reduce((sum,f)=>sum+f.amount,0).toLocaleString()}</strong>
              </p>
            </div>
          )}

          {paidFees.length > 0 && (
            <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin:'0 0 12px', fontSize:'15px', fontWeight:'700', color:'#1a1a1a' }}>✅ Paid Months</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {paidFees.map((fee,i)=>(
                  <span key={i} style={{ background:'#E4F5F7', color:'#0d6b7a', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'600' }}>✓ {fee.month}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:'15px', fontWeight:'700', color:'#1a1a1a' }}>Available Payment Methods</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { icon:'💵', title:'Cash', desc:'Pay at the institute counter. Cashier scans your barcode — updates automatically!' },
                { icon:'💳', title:'Card', desc:'✅ Instant approval! Fill card details and payment is confirmed immediately.', highlight:true },
                { icon:'🏦', title:'Bank Transfer', desc:'Transfer to institute account, enter reference number. Admin verifies within 24 hours.' },
              ].map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:'12px', padding:'12px', background: m.highlight?'#E4F5F7':'#FAFAF8', borderRadius:'10px', border: m.highlight?'1px solid #0d6b7a':'none' }}>
                  <span style={{ fontSize:'22px', flexShrink:0 }}>{m.icon}</span>
                  <div>
                    <p style={{ margin:0, fontWeight:'600', fontSize:'14px', color: m.highlight?'#0d6b7a':'#1a1a1a' }}>
                      {m.title} {m.highlight && <span style={{ fontSize:'11px', background:'#0d6b7a', color:'white', padding:'2px 8px', borderRadius:'10px', marginLeft:'6px' }}>INSTANT</span>}
                    </p>
                    <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#888' }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {myRequests?.requests?.filter(r=>r.classId?._id===cls._id)?.length > 0 && (
            <div style={{ background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'15px', fontWeight:'700', color:'#1a1a1a' }}>Payment History</h3>
              {myRequests.requests.filter(r=>r.classId?._id===cls._id).map((req,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'#FAFAF8', borderRadius:'10px', marginBottom:'8px' }}>
                  <div>
                    <p style={{ margin:0, fontWeight:'600', fontSize:'14px', color:'#1a1a1a' }}>{req.method?.replace('_',' ').toUpperCase()} — Rs. {req.amount?.toLocaleString()}</p>
                    <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#888' }}>{new Date(req.createdAt).toLocaleDateString()}{req.month&&` • ${req.month}`}</p>
                    {req.rejectReason && <p style={{ margin:'4px 0 0', fontSize:'12px', color:'#DC2626' }}>Reason: {req.rejectReason}</p>}
                    {req.receiptNumber && <p style={{ margin:'4px 0 0', fontSize:'12px', color:'#0d6b7a', fontWeight:'600' }}>Receipt: {req.receiptNumber}</p>}
                  </div>
                  <span style={{ background:statusColors[req.status]?.bg, color:statusColors[req.status]?.color, padding:'4px 12px', borderRadius:'20px', fontWeight:'700', fontSize:'12px' }}>
                    {statusColors[req.status]?.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const StudentClasses = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ subject:'', grade:'', medium:'' });
  const [selectedClass, setSelectedClass] = useState(null);

  const { data: classes, isLoading } = useQuery({
    queryKey: ['available-classes', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.medium) params.append('medium', filters.medium);
      return api.get(`/classes?${params}`).then(r => r.data);
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
  });

  const enrollMutation = useMutation({
    mutationFn: (classId) => api.post(`/classes/${classId}/enroll`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['available-classes']);
      queryClient.invalidateQueries(['student-dashboard']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Enrollment failed'),
  });

  const unenrollMutation = useMutation({
    mutationFn: (classId) => api.delete(`/classes/${classId}/unenroll`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['available-classes']);
      queryClient.invalidateQueries(['student-dashboard']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const enrolledIds = dashboard?.enrolledClasses?.map(c => String(c.classId)) ?? [];
  const enrolledClasses = classes?.classes?.filter(c => enrolledIds.includes(String(c._id))) ?? [];
  const filtered = classes?.classes?.filter(cls =>
    cls.name?.toLowerCase().includes(search.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Suspension check ──────────────────────────────────────────
  const isSuspended = dashboard?.student?.status === 'suspended';
  const suspendReason = dashboard?.student?.suspendReason;

  const hallColors = {
    'Hall 1':'bg-blue-100 text-blue-700',
    'Hall 2':'bg-purple-100 text-purple-700',
    'Hall 3':'bg-orange-100 text-orange-700',
  };

  if (selectedClass) return <StudentLayout><ClassDetail cls={selectedClass} onBack={() => setSelectedClass(null)}/></StudentLayout>;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Classes</h2>
          <p className="text-sm text-gray-400 mt-1">Browse, enroll and manage your classes</p>
        </div>

        {/* ── Suspension banner (top level) ── */}
        {isSuspended && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🚫</span>
            <div>
              <p className="font-bold text-red-700 text-base">Account Suspended</p>
              <p className="text-sm text-red-500 mt-0.5">
                You cannot enroll in classes or make payments until your suspension is lifted.
                Contact institute: 📞 033-2242-2589
              </p>
              {suspendReason && (
                <div className="mt-2 bg-red-100 rounded-lg px-3 py-1.5 inline-block">
                  <p className="text-xs text-red-600 font-bold">📋 Reason: {suspendReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
          {[
            { key:'browse', label:'Browse Classes' },
            { key:'myclasses', label:`My Classes (${enrolledClasses.length})` },
          ].map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab===t.key?'bg-[#0d6b7a] text-white':'text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab==='browse' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
                <input type="text" placeholder="Search classes..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select value={filters.subject} onChange={e=>setFilters({...filters,subject:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                  <option value="">All Subjects</option>{SUBJECTS.map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={filters.grade} onChange={e=>setFilters({...filters,grade:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                  <option value="">All Grades</option>{GRADES.map(g=><option key={g}>{g}</option>)}
                </select>
                <select value={filters.medium} onChange={e=>setFilters({...filters,medium:e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                  <option value="">All Mediums</option>{MEDIUMS.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {isLoading && <div className="text-center text-gray-400 py-12">Loading classes...</div>}

            <div className="grid grid-cols-2 gap-4">
              {filtered?.map(cls => {
                const isEnrolled = enrolledIds.includes(String(cls._id));
                const isFull = cls.availableSlots <= 0;
                return (
                  <div key={cls._id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition ${isEnrolled?'border-[#0d6b7a]':'border-transparent hover:border-gray-200'}`}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{cls.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{cls.subject} • {cls.grade} • {cls.medium}</p>
                        </div>
                        {isEnrolled && <span className="bg-[#0d6b7a] text-white text-xs font-bold px-2 py-1 rounded-full">Enrolled</span>}
                        {isFull&&!isEnrolled && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">Full</span>}
                      </div>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><BookOpen size={14} className="text-gray-400"/><span>Teacher: {cls.teacherId?.userId?.name||'Not assigned'}</span></div>
                        <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400"/><span>{cls.schedule?.dayOfWeek} at {cls.schedule?.startTime} ({cls.schedule?.durationMins} mins)</span></div>
                        <div className="flex items-center gap-2"><Users size={14} className="text-gray-400"/><span>{cls.enrolledCount} / {cls.maxCapacity} students</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hallColors[cls.hall] || 'bg-gray-100 text-gray-600'}`}>{cls.hall}</span></div>
                        <div className="flex items-center gap-2"><CreditCard size={14} className="text-gray-400"/><span className="font-bold text-gray-800">Rs. {cls.monthlyFee?.toLocaleString()} / month</span></div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                          <div className={`h-1.5 rounded-full ${isFull?'bg-red-500':'bg-[#0d6b7a]'}`} style={{ width:`${Math.min((cls.enrolledCount/cls.maxCapacity)*100,100)}%` }}/>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{cls.availableSlots} slots available</p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-2">
                      {isEnrolled ? (
                        <>
                          <button onClick={()=>setSelectedClass(cls)} className="flex-1 py-2.5 bg-[#0d6b7a] text-white rounded-xl font-semibold text-sm hover:bg-[#0a505d] transition">View Class</button>
                          {!isSuspended && (
                            <button onClick={()=>{if(window.confirm('Unenroll from this class?'))unenrollMutation.mutate(cls._id);}} className="py-2.5 px-4 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition">Leave</button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => !isSuspended && enrollMutation.mutate(cls._id)}
                          disabled={isFull || enrollMutation.isPending || isSuspended}
                          className="w-full py-2.5 bg-[#0d6b7a] text-white rounded-xl font-semibold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">
                          {isSuspended ? '🚫 Account Suspended' : isFull ? 'Class Full' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered?.length===0&&!isLoading && <div className="col-span-2 text-center py-12 text-gray-400">No classes found</div>}
            </div>
          </>
        )}

        {activeTab==='myclasses' && (
          <div>
            {enrolledClasses.length===0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-gray-600 font-semibold">No classes enrolled yet</p>
                <p className="text-gray-400 text-sm mt-1">Go to Browse Classes to enroll</p>
                <button onClick={()=>setActiveTab('browse')} className="mt-4 bg-[#0d6b7a] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a505d] transition">Browse Classes</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {enrolledClasses.map(cls => {
                  const attData = dashboard?.enrolledClasses?.find(c=>String(c.classId)===String(cls._id));
                  return (
                    <div key={cls._id} onClick={()=>setSelectedClass(cls)} className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-[#0d6b7a] cursor-pointer hover:shadow-md transition">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-gray-800">{cls.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{cls.subject} • {cls.grade}</p>
                          </div>
                          <span className="bg-[#0d6b7a] text-white text-xs font-bold px-2 py-1 rounded-full">Enrolled</span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-500">
                          <p>👨‍🏫 {cls.teacherId?.userId?.name||'Not assigned'}</p>
                          <p>🕐 {cls.schedule?.dayOfWeek} at {cls.schedule?.startTime}</p>
                          <p>📍 {cls.hall}</p>
                          <p className="font-bold text-gray-800">💰 Rs. {cls.monthlyFee?.toLocaleString()}/month</p>
                        </div>
                        {attData && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Attendance</span>
                              <span className={`text-xs font-bold ${attData.atRisk?'text-red-500':'text-green-600'}`}>{attData.percentage}</span>
                            </div>
                            {attData.percentage!=='No sessions yet' && (
                              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                <div className={`h-1.5 rounded-full ${attData.atRisk?'bg-red-500':'bg-green-500'}`} style={{ width:attData.percentage }}/>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-[#0d6b7a] font-semibold">Click to view details →</span>
                          <div className="flex gap-1">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">📚 Course Work</span>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">💳 Pay</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentClasses;