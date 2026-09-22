import { useQuery } from '@tanstack/react-query';
import StudentLayout from '../../layouts/StudentLayout';
import api from '../../api/axios';
import Barcode from 'react-barcode';
import StudentQRCode from '../../components/common/StudentQRCode';
import { CreditCard, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

const StudentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
  });

  if (isLoading) return (
    <StudentLayout>
      <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
    </StudentLayout>
  );

  return (
    <StudentLayout>
      <div className="space-y-6">

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#0d6b7a] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                {data?.student?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{data?.student?.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">{data?.student?.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-[#F5C518] text-[#0d6b7a] text-xs font-bold px-2 py-0.5 rounded-full">{data?.student?.admissionNumber}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{data?.student?.grade}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{data?.student?.stream}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
              <div><p className="text-white/60 text-xs">School</p><p className="text-white font-semibold text-sm mt-0.5">{data?.student?.school}</p></div>
              <div><p className="text-white/60 text-xs">Medium</p><p className="text-white font-semibold text-sm mt-0.5">{data?.student?.medium}</p></div>
              <div><p className="text-white/60 text-xs">Status</p><p className="text-white font-semibold text-sm mt-0.5 capitalize">{data?.student?.status}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-4">
            <p className="text-xs font-bold text-gray-400 uppercase">My Student ID</p>
            <div className="flex gap-4 items-center justify-center w-full">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400 font-semibold">Barcode</p>
                {data?.barcode && <Barcode value={data.barcode} width={1.2} height={50} fontSize={10} margin={0}/>}
              </div>
              <div className="w-px h-24 bg-gray-100"/>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400 font-semibold">QR Code</p>
                <StudentQRCode admissionNumber={data?.barcode} studentName={data?.student?.name} size={80}/>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Show either code to teacher for attendance</p>
          </div>
        </div>

        {data?.fees?.totalOutstanding > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500"/>
            <p className="text-red-700 font-medium text-sm">
              You have outstanding fees of Rs. {data.fees.totalOutstanding.toLocaleString()} —
              <span className="font-bold"> {data.fees.unpaidCount} unpaid record{data.fees.unpaidCount > 1 ? 's' : ''}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Enrolled Classes</p><p className="text-3xl font-bold text-gray-800 mt-1">{data?.enrolledClasses?.length ?? 0}</p></div>
            <div className="w-12 h-12 rounded-xl bg-[#0d6b7a] flex items-center justify-center"><BookOpen size={22} className="text-white"/></div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Outstanding Fees</p><p className="text-3xl font-bold text-red-500 mt-1">Rs. {data?.fees?.totalOutstanding?.toLocaleString() ?? 0}</p></div>
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center"><CreditCard size={22} className="text-white"/></div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Recent Payments</p><p className="text-3xl font-bold text-green-600 mt-1">{data?.recentPayments?.length ?? 0}</p></div>
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center"><CheckCircle size={22} className="text-white"/></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">My Classes</h3></div>
            <div className="divide-y divide-gray-100">
              {data?.enrolledClasses?.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No classes enrolled yet</div>}
              {data?.enrolledClasses?.map((cls, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{cls.className}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cls.subject} • {cls.hall} • {cls.schedule?.dayOfWeek} {cls.schedule?.startTime}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Teacher: {cls.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${cls.atRisk ? 'text-red-500' : 'text-green-600'}`}>{cls.percentage}</p>
                      <p className="text-xs text-gray-400">Attendance</p>
                    </div>
                  </div>
                  {cls.percentage !== 'No sessions yet' && (
                    <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-1.5 rounded-full ${cls.atRisk ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: cls.percentage }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Recent Payments</h3></div>
            <div className="divide-y divide-gray-100">
              {data?.recentPayments?.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No payments yet</div>}
              {data?.recentPayments?.map((payment, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{payment.class}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{payment.receiptNumber} • {payment.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs. {payment.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{new Date(payment.paidAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {data?.fees?.unpaidFees?.length > 0 && (
              <div className="border-t border-gray-100">
                <div className="px-5 py-3 bg-red-50"><p className="text-xs font-bold text-red-600 uppercase">Unpaid Fees</p></div>
                {data.fees.unpaidFees.map((fee, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between border-t border-gray-100">
                    <div><p className="font-semibold text-gray-800 text-sm">{fee.class}</p><p className="text-xs text-gray-400">{fee.month}</p></div>
                    <p className="font-bold text-red-500">Rs. {fee.amount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;