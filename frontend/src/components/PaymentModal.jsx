import { useState, useEffect, useRef } from 'react';
import './PaymentModal.css';

const CONFETTI = [
    { tx: '100px', ty: '-120px', bg: '#0095ff', d: '0.3s', r: '540deg' },
    { tx: '-110px', ty: '-90px', bg: '#10b981', d: '0.35s', r: '-400deg' },
    { tx: '55px', ty: '-140px', bg: '#f59e0b', d: '0.4s', r: '620deg' },
    { tx: '-80px', ty: '-130px', bg: '#ef4444', d: '0.32s', r: '-520deg' },
    { tx: '130px', ty: '-30px', bg: '#8b5cf6', d: '0.38s', r: '480deg' },
    { tx: '-125px', ty: '-20px', bg: '#ec4899', d: '0.42s', r: '-600deg' },
    { tx: '35px', ty: '-150px', bg: '#06b6d4', d: '0.36s', r: '700deg' },
    { tx: '-45px', ty: '-110px', bg: '#f97316', d: '0.34s', r: '-460deg' },
    { tx: '110px', ty: '50px', bg: '#6366f1', d: '0.4s', r: '560deg' },
    { tx: '-100px', ty: '40px', bg: '#14b8a6', d: '0.38s', r: '-380deg' },
    { tx: '15px', ty: '70px', bg: '#eab308', d: '0.42s', r: '650deg' },
    { tx: '-25px', ty: '55px', bg: '#e11d48', d: '0.36s', r: '-500deg' },
];

const PaymentModal = ({ isOpen, amount, hotelName, bookingDetails, onPaymentComplete, onCancel }) => {
    const [stage, setStage] = useState('qr');
    const [countdown, setCountdown] = useState(5);
    const [qrLoaded, setQrLoaded] = useState(false);
    const callbackRef = useRef(onPaymentComplete);

    useEffect(() => {
        callbackRef.current = onPaymentComplete;
    }, [onPaymentComplete]);

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setStage('qr');
            setCountdown(5);
            setQrLoaded(false);
        }
    }, [isOpen]);

    // Stage timer logic
    useEffect(() => {
        if (!isOpen) return;

        if (stage === 'qr') {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setStage('processing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }

        if (stage === 'processing') {
            const timer = setTimeout(() => setStage('success'), 2000);
            return () => clearTimeout(timer);
        }

        if (stage === 'success') {
            const timer = setTimeout(() => callbackRef.current(), 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, stage]);

    if (!isOpen) return null;

    const upiString = `upi://pay?pa=zentarastay@ybl&pn=Zentarastay&am=${amount}&cu=INR&tn=Hotel Booking`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}&color=1e293b&bgcolor=ffffff`;

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="payment-overlay" onClick={(e) => { if (e.target === e.currentTarget && stage === 'qr') onCancel(); }}>
            <div className="payment-modal">

                {/* ===== QR STAGE ===== */}
                {stage === 'qr' && (
                    <div className="payment-qr-stage animate-fade-in">
                        <div className="payment-header">
                            <div className="payment-logo">🏨</div>
                            <h3>Complete Payment</h3>
                            <p className="payment-hotel-name">{hotelName}</p>
                        </div>

                        {bookingDetails && (
                            <div className="payment-summary">
                                <div className="summary-row">
                                    <span>📅 Check-in</span>
                                    <span>{formatDate(bookingDetails.checkInDate)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>📅 Check-out</span>
                                    <span>{formatDate(bookingDetails.checkOutDate)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>🛏️ Rooms</span>
                                    <span>{bookingDetails.roomCount} room(s)</span>
                                </div>
                                <div className="summary-row">
                                    <span>🌙 Duration</span>
                                    <span>{bookingDetails.days} night(s)</span>
                                </div>
                            </div>
                        )}

                        <div className="payment-amount-display">
                            <span className="amount-label">Total Amount</span>
                            <div className="amount-value">
                                <span className="currency">₹</span>
                                <span className="amount-num">{amount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="qr-wrapper">
                            <div className="qr-container">
                                <div className="qr-scan-line"></div>
                                <img
                                    src={qrUrl}
                                    alt="Payment QR Code"
                                    className={`qr-image ${qrLoaded ? 'loaded' : ''}`}
                                    onLoad={() => setQrLoaded(true)}
                                />
                                {!qrLoaded && <div className="qr-placeholder">Loading QR...</div>}
                            </div>
                            <div className="qr-corner tl"></div>
                            <div className="qr-corner tr"></div>
                            <div className="qr-corner bl"></div>
                            <div className="qr-corner br"></div>
                        </div>

                        <p className="scan-instruction">Scan with any UPI app to pay</p>

                        <div className="payment-methods">
                            <span className="method-badge">Google Pay</span>
                            <span className="method-badge">PhonePe</span>
                            <span className="method-badge">Paytm</span>
                            <span className="method-badge">UPI</span>
                        </div>

                        <div className="payment-timer">
                            <div className="timer-bar">
                                <div className="timer-progress" style={{ width: `${(countdown / 5) * 100}%` }}></div>
                            </div>
                            <span className="timer-text">Auto-verifying in {countdown}s</span>
                        </div>

                        <button className="btn-cancel-payment" onClick={onCancel}>Cancel Payment</button>
                    </div>
                )}

                {/* ===== PROCESSING STAGE ===== */}
                {stage === 'processing' && (
                    <div className="payment-processing-stage animate-fade-in">
                        <div className="processing-spinner">
                            <div className="spinner-ring"></div>
                            <div className="spinner-ring"></div>
                            <div className="spinner-ring"></div>
                        </div>
                        <h3>Verifying Payment</h3>
                        <p>Please wait while we confirm your transaction...</p>
                        <div className="processing-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}

                {/* ===== SUCCESS STAGE ===== */}
                {stage === 'success' && (
                    <div className="payment-success-stage animate-fade-in">
                        <div className="success-checkmark-container">
                            <svg className="success-checkmark" viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h3>Payment Successful!</h3>
                        <p className="success-amount">₹{amount.toLocaleString('en-IN')}</p>
                        <p className="success-message">Your booking is being confirmed...</p>
                        <div className="success-confetti">
                            {CONFETTI.map((c, i) => (
                                <div
                                    key={i}
                                    className="confetti-piece"
                                    style={{ '--tx': c.tx, '--ty': c.ty, '--d': c.d, '--r': c.r, background: c.bg }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
