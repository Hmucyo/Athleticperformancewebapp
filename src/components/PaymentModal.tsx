import { useState } from "react";
import { CreditCard, X, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  programName: string;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, amount, programName, onPaymentSuccess }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    zipCode: ''
  });

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setPaymentComplete(true);
      
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setPaymentComplete(false);
        setCardDetails({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          nameOnCard: '',
          zipCode: ''
        });
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-md p-8">
        {!paymentComplete ? (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg">
                <CreditCard className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">Payment</h2>
                <p className="text-gray-400 text-sm">{programName}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm mb-1">Total Amount</p>
              <p className="text-white text-3xl font-bold">{amount}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm">Card Number</label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm">Expiry Date</label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm">CVV</label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="123"
                    maxLength={4}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 text-sm">Name on Card</label>
                <input
                  type="text"
                  value={cardDetails.nameOnCard}
                  onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm">ZIP Code</label>
                <input
                  type="text"
                  value={cardDetails.zipCode}
                  onChange={(e) => setCardDetails({ ...cardDetails, zipCode: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="12345"
                  maxLength={5}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className={`w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-semibold text-lg ${
                  processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {processing ? 'Processing...' : `Pay ${amount}`}
              </button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-4">
              🔒 Secure payment powered by Square
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h3 className="text-white text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-400">You're enrolled in {programName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
