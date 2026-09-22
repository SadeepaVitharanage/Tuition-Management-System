import { useQuery } from '@tanstack/react-query';
import ParentLayout from '../../layouts/ParentLayout';
import api from '../../api/axios';
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

const ParentDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['parent-dashboard'],
    queryFn: () => api.get('/dashboard/parent').then(r => r.data),
  });

  if (isLoading) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
    </ParentLayout>
  );

  return (
    <ParentLayout>
      <div className="space-y-6">

        {/* Parent info */}
        <div className="bg-[#0d6b7a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              {data?.parent?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{data?.parent?.name}</h2>
              <p className="text-white/70 text-sm">{data?.parent?.email}</p>
              <p className="text-white/60 text-sm mt-0.5">{data?.parent?.contact}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Monitoring {data?.children?.length} child{data?.children?.length > 1 ? 'ren' : ''}
            </p>
          </div>
        </div>

        {/* Each child */}
        {data?.children?.map((child, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold">
                {child.student.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{child.student.name}</h3>
                <p className="text-gray-400 text-sm">
                  {child.student.admissionNumber} • {child.student.grade} • {child.student.school}
                </p>
              </div>
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full capitalize ${
                child.student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>{child.student.status}</span>
            </div>

            {child.fees.totalOutstanding > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0"/>
                <p className="text-red-700 text-sm font-medium">
                  Outstanding fees: <span className="font-bold">Rs. {child.fees.totalOutstanding.toLocaleString()}</span>
                  {' '}({child.fees.unpaidCount} unpaid)
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Attendance */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800">Attendance Summary</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {child.attendance?.length === 0 && (
                    <div className="px-5 py-6 text-center text-gray-400 text-sm">No attendance data yet</div>
                  )}
                  {child.attendance?.map((att, j) => (
                    <div key={j} className="px-5 py-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{att.className}</p>
                          <p className="text-xs text-gray-400">{att.subject}</p>
                          <p className="text-xs text-gray-400">{att.hall} • {att.schedule?.dayOfWeek}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${att.atRisk ? 'text-red-500' : 'text-green-600'}`}>{att.percentage}</p>
                          {att.atRisk && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${att.risk === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{att.risk}</span>
                          )}
                        </div>
                      </div>
                      {att.percentage !== 'No sessions yet' && (
                        <div className="w-full h-2 bg-gray-100 rounded-full">
                          <div className={`h-2 rounded-full ${att.atRisk ? 'bg-red-500' : 'bg-[#0d6b7a]'}`} style={{ width: att.percentage }}/>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{att.presentCount} / {att.totalSessions} sessions attended</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h4 className="font-bold text-gray-800">Payment History</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {child.recentPayments?.length === 0 && (
                    <div className="px-5 py-6 text-center text-gray-400 text-sm">No payments yet</div>
                  )}
                  {child.recentPayments?.map((p, j) => (
                    <div key={j} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle size={16} className="text-green-600"/>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{p.class}</p>
                          <p className="text-xs text-gray-400">{p.receiptNumber} • {p.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm">Rs. {p.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{new Date(p.paidAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {child.fees.unpaidFees?.length > 0 && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 py-3 bg-red-50">
                      <p className="text-xs font-bold text-red-600 uppercase">Unpaid Fees</p>
                    </div>
                    {child.fees.unpaidFees.map((fee, j) => (
                      <div key={j} className="px-5 py-3 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <CreditCard size={16} className="text-red-500"/>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{fee.class}</p>
                            <p className="text-xs text-gray-400">{fee.month}</p>
                          </div>
                        </div>
                        <p className="font-bold text-red-500 text-sm">Rs. {fee.amount?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {i < data.children.length - 1 && <hr className="border-gray-200 my-2"/>}
          </div>
        ))}

        {data?.children?.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <p className="font-medium">No children linked to your account</p>
            <p className="text-sm mt-1">Contact admin to link your child</p>
          </div>
        )}
      </div>
    </ParentLayout>
  );
};

export default ParentDashboard;