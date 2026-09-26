import { useState } from 'react';
import { FaLock, FaTimes, FaCheckCircle, FaShieldAlt, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import './PaymentModal.css';

export default function PaymentModal({ amount, onSuccess, onClose }) {
  const [card, setCard] = useState({
    number: '', name: '', expiry: '', cvv: ''
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Detect card type from number
  const getCardType = () => {
    const num = card.number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return '';
  };

  const handleCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCard({ ...card, number: value });
  };

  const handleExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2);
    setCard({ ...card, expiry: value });
  };

  const handleCvv = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, cvv: value });
  };

  const handlePay = (e) => {
    e.preventDefault();

    if (card.number.replace(/\s/g, '').length < 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }
    if (!card.name.trim()) {
      alert('Please enter cardholder name');
      return;
    }
    if (card.expiry.length < 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (card.cvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1800);
    }, 2200);
  };

  const cardType = getCardType();

  return (
    <div className="pay-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
        {success ? (
          /* ===== Success Screen ===== */
          <div className="pay-success">
            <div className="pay-success-circle">
              <FaCheckCircle />
            </div>
            <h2>Payment Successful!</h2>
            <p>LKR {amount?.toLocaleString()} paid successfully</p>
            <span className="pay-success-sub">Confirming your booking...</span>
          </div>
        ) : (
          <>
            {/* ===== Header ===== */}
            <div className="pay-header">
              <div className="pay-header-left">
                <FaShieldAlt className="pay-shield" />
                <div>
                  <h2>Secure Checkout</h2>
                  <span>LuxeDrive Payments</span>
                </div>
              </div>
              <button className="pay-close" onClick={onClose}><FaTimes /></button>
            </div>

            {/* ===== Body (scrollable) ===== */}
            <div className="pay-body">
              {/* Amount */}
              <div className="pay-amount-box">
                <span>Total Amount</span>
                <strong>LKR {amount?.toLocaleString()}</strong>
              </div>

              {/* Card Preview */}
              <div className={`pay-card-preview ${cardType}`}>
                <div className="pay-card-top">
                  <div className="pay-card-chip"></div>
                  <div className="pay-card-brand">
                    {cardType === 'visa' && <FaCcVisa />}
                    {cardType === 'mastercard' && <FaCcMastercard />}
                    {cardType === 'amex' && <FaCcAmex />}
                    {!cardType && <span className="pay-card-logo">CARD</span>}
                  </div>
                </div>
                <div className="pay-card-number">
                  {card.number || '•••• •••• •••• ••••'}
                </div>
                <div className="pay-card-bottom">
                  <div>
                    <span>CARD HOLDER</span>
                    <p>{card.name || 'YOUR NAME'}</p>
                  </div>
                  <div>
                    <span>EXPIRES</span>
                    <p>{card.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              {/* Accepted cards */}
              <div className="pay-accepted">
                <span>We accept</span>
                <div className="pay-accepted-icons">
                  <FaCcVisa style={{ color: '#1a1f71' }} />
                  <FaCcMastercard style={{ color: '#eb001b' }} />
                  <FaCcAmex style={{ color: '#2e77bc' }} />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handlePay} className="pay-form" id="payForm">
                <div className="pay-field">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={handleCardNumber}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="pay-field">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="pay-row">
                  <div className="pay-field">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={handleExpiry}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <div className="pay-field">
                    <label>CVV</label>
                    <input
                      type="password"
                      value={card.cvv}
                      onChange={handleCvv}
                      placeholder="•••"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* ===== Footer (fixed) ===== */}
            <div className="pay-footer">
              <button
                type="submit"
                form="payForm"
                className="pay-btn"
                disabled={processing}
              >
                {processing ? (
                  <><span className="pay-spinner"></span> Processing...</>
                ) : (
                  <><FaLock /> Pay LKR {amount?.toLocaleString()}</>
                )}
              </button>
              <p className="pay-secure">
                <FaLock /> Secured with 256-bit SSL encryption · Demo mode
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}