import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendRegistrationOTPEmail } from '../utils/email';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  // Use a ref so the interval handle is always current in closures
  const intervalRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Start a countdown to a fixed expiry timestamp (ms). */
  const startTimer = useCallback((expiresAtMs) => {
    stopTimer();
    const tick = () => {
      const diff = expiresAtMs - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        stopTimer();
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    };
    tick(); // run immediately so there's no 1-second blank
    intervalRef.current = setInterval(tick, 1000);
  }, [stopTimer]);

  useEffect(() => {
    const dataStr = sessionStorage.getItem('pendingRegistration');
    const otpExpStr = sessionStorage.getItem('otpExpiresAt');

    if (!email || !dataStr || !otpExpStr) {
      toast.error('Session expired or invalid. Please register again.');
      navigate('/register');
      return;
    }

    const expiresAt = new Date(otpExpStr).getTime();
    startTimer(expiresAt);
    setIsPageLoading(false);

    return stopTimer;
  }, [email, navigate, startTimer, stopTimer]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    if (seconds === 0) return 'Code Expired';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    setTimeout(() => {
      const inputs = document.querySelectorAll('.otp-input');
      const nextIndex = Math.min(pastedData.length, 5);
      if (inputs[nextIndex]) {
        inputs[nextIndex].focus();
      }
    }, 0);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length !== 6) {
      setError('Please enter the 6-digit code.');
      toast.error('Please enter the 6-digit code.');
      return;
    }

    if (timeLeft === 0) {
      setError('OTP has expired. Please request a new one.');
      toast.error('OTP has expired.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storedOTP = sessionStorage.getItem('registrationOTP');
      const dataStr = sessionStorage.getItem('pendingRegistration');

      if (!storedOTP || !dataStr) {
        throw new Error('Session expired. Please register again.');
      }

      if (enteredCode !== storedOTP) {
        setError('Invalid OTP code.');
        toast.error('Invalid OTP code.');
        setLoading(false);
        return;
      }

      const pendingData = JSON.parse(dataStr);

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        pendingData.email, 
        pendingData.password
      );
      const user = userCredential.user;

      // 2. Create user document in Firestore, now fully verified
      await setDoc(doc(db, 'users', user.uid), {
        firstName: pendingData.firstName,
        lastName: pendingData.lastName,
        phone: pendingData.phone,
        email: pendingData.email,
        isAdmin: false,
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      });

      // 3. Clear session
      sessionStorage.removeItem('pendingRegistration');
      sessionStorage.removeItem('registrationOTP');
      sessionStorage.removeItem('otpExpiresAt');

      toast.success('Account successfully created and verified!');
      navigate('/shop');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
      toast.error(err.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    
    try {
      const dataStr = sessionStorage.getItem('pendingRegistration');
      if (!dataStr) {
        setError('Session expired. Please register again.');
        toast.error('Session expired. Please register again.');
        navigate('/register');
        return;
      }

      const pendingData = JSON.parse(dataStr);
      const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Update session storage
      sessionStorage.setItem('registrationOTP', newOtpCode);
      sessionStorage.setItem('otpExpiresAt', newExpiresAt.toISOString());

      try {
        const sent = await sendRegistrationOTPEmail(
          email,
          pendingData.firstName || 'Customer',
          newOtpCode
        );
        if (sent !== false) {
          toast.success('A new OTP has been sent to your email.');
        } else {
          throw new Error('Email sending returned false');
        }
      } catch (emailErr) {
        console.error('Email resend error:', emailErr);
        toast.error('Failed to send OTP email.');
      }

      setOtp(['', '', '', '', '', '']);
      startTimer(newExpiresAt.getTime());
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to resend OTP. Please try again later.');
      toast.error('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-grow bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group">
              <div className="flex flex-col items-center">
                  <div className="relative bg-brandBlack p-3 rounded-full border border-brandLime/50 mb-3 group-hover:border-brandLime transition-all duration-300">
                      <i className="fa-solid fa-microchip text-brandLime text-2xl"></i>
                  </div>
                  <span className="text-3xl font-black tracking-tight text-brandDark">
                      MAYJAY <span className="text-brandLime">CONCEPTS</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Electronics & Solar</span>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="bg-brandDark px-8 py-6 text-white text-center">
              <h1 className="text-2xl font-black uppercase tracking-wide">Verify Your Email</h1>
              <p className="text-gray-400 text-sm font-medium mt-1">We sent a 6-digit code to <strong>{email}</strong></p>
            </div>

            <div className="px-8 py-8 text-center">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-sm mb-6 flex items-center gap-2 justify-center">
                  <i className="fas fa-exclamation-circle text-red-500"></i> {error}
                </div>
              )}

              <div className={`mb-6 font-black text-xl tracking-wider transition-opacity duration-300 ${isPageLoading ? 'opacity-50' : 'opacity-100'} ${timeLeft === 0 ? 'text-red-500' : 'text-brandDark'}`}>
                {isPageLoading ? 'Loading timer...' : formatTime(timeLeft)}
              </div>

              <form onSubmit={verifyOTP}>
                <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      onFocus={(e) => e.target.select()}
                      className="otp-input w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl text-center border-2 border-gray-200 focus:border-brandLime outline-none rounded-lg font-black bg-gray-50 focus:bg-white text-brandDark transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-100"
                      disabled={isPageLoading}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading || isPageLoading} className="w-full bg-brandLime hover:bg-white border-2 border-transparent hover:border-brandLime disabled:opacity-60 text-brandBlack font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Verifying...</>
                  ) : (
                    <><i className="fas fa-check-circle"></i> Verify Email</>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600 font-medium">
                  Didn't receive the code?{' '}
                  <button 
                    onClick={handleResend} 
                    disabled={resending || isPageLoading}
                    className="text-brandDark font-black hover:text-brandLime transition-colors disabled:opacity-50 underline"
                  >
                    {resending ? 'Sending...' : 'Resend Code'}
                  </button>
                </p>
              </div>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-6 flex justify-center gap-8 text-xs text-gray-400 font-medium">
            <span><i className="fas fa-shield-alt mr-1 text-blue-500"></i> Secure Verification</span>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
