import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const QRScanner = ({ onScan, onClose, title = 'Scan Student QR Code' }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scannerId = 'xenedu-qr-scanner';
    const scanner = new Html5QrcodeScanner(
      scannerId,
      { fps:10, qrbox:{width:250,height:250}, supportedScanTypes:[Html5QrcodeScanType.SCAN_TYPE_CAMERA,Html5QrcodeScanType.SCAN_TYPE_FILE], rememberLastUsedCamera:true, showTorchButtonIfSupported:true },
      false
    );
    scanner.render(
      (decodedText) => { if (scanning) { setScanning(false); scanner.clear().catch(()=>{}); onScan(decodedText.trim()); } },
      () => {}
    );
    scannerRef.current = scanner;
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(()=>{}); };
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'24px', width:'100%', maxWidth:'420px', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ background:'linear-gradient(135deg, #0d6b7a, #00b8c8)', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ margin:0, color:'white', fontWeight:'700', fontSize:'16px' }}>📷 {title}</p>
            <p style={{ margin:'2px 0 0', color:'rgba(255,255,255,0.7)', fontSize:'12px' }}>Point camera at student ID barcode or QR code</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'10px', padding:'8px 12px', color:'white', cursor:'pointer', fontSize:'16px' }}>✕</button>
        </div>
        <div style={{ padding:'16px' }}>
          <div id="xenedu-qr-scanner" style={{ width:'100%' }}/>
          {error && <p style={{ color:'red', fontSize:'13px', textAlign:'center', margin:'8px 0 0' }}>{error}</p>}
        </div>
        <div style={{ padding:'12px 20px 20px', background:'#F8FFFE', borderTop:'1px solid #E8F5F0' }}>
          <p style={{ margin:0, fontSize:'12px', color:'#888', textAlign:'center' }}>💡 Works with QR codes and barcodes on student ID cards</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;