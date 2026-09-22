import { QRCodeSVG } from 'qrcode.react';

const StudentQRCode = ({ admissionNumber, studentName, size = 140 }) => {
  if (!admissionNumber) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{
        background: 'white', padding: '10px',
        borderRadius: '14px', border: '2px solid #E8F5F0',
        boxShadow: '0 4px 16px rgba(27,107,90,0.1)',
      }}>
        <QRCodeSVG
          value={admissionNumber}
          size={size}
          level="M"
          includeMargin={false}
          fgColor="#1B6B5A"
        />
      </div>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1B6B5A', letterSpacing: '2px' }}>
        {admissionNumber}
      </p>
    </div>
  );
};

export default StudentQRCode;