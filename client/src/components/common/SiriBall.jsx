import { useNavigate } from 'react-router-dom';

const SiriBall = () => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/student/learn')} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', cursor:'pointer' }}>
      <div style={{ position:'relative', width:'90px', height:'90px' }}>
        <div style={{ position:'absolute', top:'-8px', left:'-8px', width:'106px', height:'106px', borderRadius:'50%', background:'transparent', border:'2px solid rgba(0,184,200,0.3)', animation:'ringPulse 3.5s ease-in-out infinite' }}/>
        <div style={{ position:'absolute', top:'-16px', left:'-16px', width:'122px', height:'122px', borderRadius:'50%', background:'transparent', border:'1px solid rgba(0,184,200,0.15)', animation:'ringPulse 3.5s ease-in-out infinite 0.5s' }}/>
        <div style={{ width:'90px', height:'90px', borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #00FFD1, #00b8c8 25%, #0EECF8 45%, #0d6b7a 70%, #00b8c8 90%)', backgroundSize:'300% 300%', animation:'siriMove 6s ease infinite, siriPulse 3s ease-in-out infinite', boxShadow:'0 0 30px rgba(0,184,200,0.6), 0 0 60px rgba(14,236,248,0.4), 0 0 100px rgba(0,184,200,0.2)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:'60px', height:'60px', borderRadius:'50%', background:'rgba(0,255,200,0.5)', top:'8px', left:'0px', filter:'blur(10px)', animation:'blob1 4s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', width:'50px', height:'50px', borderRadius:'50%', background:'rgba(100,255,220,0.6)', bottom:'0px', right:'0px', filter:'blur(10px)', animation:'blob2 5s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', width:'40px', height:'40px', borderRadius:'50%', background:'rgba(0,184,200,0.7)', top:'20px', right:'10px', filter:'blur(8px)', animation:'blob3 4.5s ease-in-out infinite' }}/>
          <div style={{ position:'absolute', width:'22px', height:'22px', borderRadius:'50%', background:'rgba(255,255,255,0.9)', top:'12px', left:'18px', filter:'blur(5px)', animation:'shinePulse 3s ease-in-out infinite' }}/>
        </div>
      </div>
      <p style={{ margin:0, fontSize:'12px', fontWeight:'700', color:'#00b8c8', letterSpacing:'0.5px', textShadow:'0 0 10px rgba(0,184,200,0.5)', animation:'textGlow 3s ease-in-out infinite' }}>AI Tutor</p>
      <style>{`
        @keyframes siriMove { 0%{background-position:0% 50%}25%{background-position:100% 0%}50%{background-position:100% 100%}75%{background-position:0% 100%}100%{background-position:0% 50%} }
        @keyframes siriPulse { 0%,100%{transform:scale(1);box-shadow:0 0 30px rgba(0,184,200,0.6),0 0 60px rgba(14,236,248,0.4)}50%{transform:scale(1.08);box-shadow:0 0 50px rgba(0,184,200,0.8),0 0 80px rgba(14,236,248,0.6)} }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.5}25%{transform:translate(15px,-15px) scale(1.3);opacity:0.8}50%{transform:translate(20px,10px) scale(0.8);opacity:0.6}75%{transform:translate(-10px,15px) scale(1.2);opacity:0.7} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.6}25%{transform:translate(-15px,10px) scale(1.2);opacity:0.8}50%{transform:translate(-20px,-15px) scale(0.7);opacity:0.5}75%{transform:translate(10px,-10px) scale(1.3);opacity:0.9} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1);opacity:0.7}33%{transform:translate(-12px,12px) scale(1.4);opacity:0.9}66%{transform:translate(12px,-12px) scale(0.6);opacity:0.5} }
        @keyframes shinePulse { 0%,100%{opacity:0.9;transform:scale(1) translate(0,0)}50%{opacity:0.5;transform:scale(1.3) translate(3px,3px)} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.1);opacity:0.7} }
        @keyframes textGlow { 0%,100%{opacity:1;text-shadow:0 0 10px rgba(0,184,200,0.5)}50%{opacity:0.7;text-shadow:0 0 20px rgba(0,255,180,0.9)} }
      `}</style>
    </div>
  );
};

export default SiriBall;