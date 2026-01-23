import { X, FileText, Check } from "lucide-react";
import { useState } from "react";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any;
  onSigned?: () => void;
}

export function ContractModal({ isOpen, onClose, enrollment, onSigned }: ContractModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState("");
  const [signatureError, setSignatureError] = useState("");

  if (!isOpen || !enrollment) return null;

  const handleSign = async () => {
    if (!signature.trim()) {
      setSignatureError("Please enter your full name to sign");
      return;
    }

    if (!agreed) {
      setSignatureError("You must agree to the terms");
      return;
    }

    setSigning(true);
    setSignatureError("");

    try {
      const accessToken = localStorage.getItem('accessToken');
      const projectId = (await import('../utils/supabase/info')).projectId;
      const publicAnonKey = (await import('../utils/supabase/info')).publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/contracts/sign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            enrollmentId: enrollment.enrollmentId,
            signature: signature.trim(),
            signedAt: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        if (onSigned) {
          onSigned();
        }
        onClose();
      } else {
        const data = await response.json();
        setSignatureError(data.error || 'Failed to sign contract');
      }
    } catch (error) {
      console.error('Contract signing error:', error);
      setSignatureError('An error occurred while signing');
    } finally {
      setSigning(false);
    }
  };

  const contractDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-400" size={24} />
            <h2 className="text-white text-2xl font-bold">Training Program Agreement</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Contract Content */}
          <div className="bg-white text-black p-8 rounded-lg mb-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Authentic Fitness & Sports Performance</h1>
              <h2 className="text-xl text-gray-700">Training Program Agreement</h2>
              <p className="text-gray-600 mt-2">{contractDate}</p>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold mb-3">Program Details</h3>
                <div className="bg-gray-100 p-4 rounded">
                  <p><strong>Program Name:</strong> {enrollment.programName}</p>
                  {enrollment.customization?.format && (
                    <p><strong>Format:</strong> {enrollment.customization.format}</p>
                  )}
                  {enrollment.customization?.sessionType && (
                    <p><strong>Session Type:</strong> {enrollment.customization.sessionType}</p>
                  )}
                  {enrollment.customization?.sessions && (
                    <p><strong>Sessions:</strong> {enrollment.customization.sessions}</p>
                  )}
                  {enrollment.customization?.totalPrice && (
                    <p><strong>Total Price:</strong> ${enrollment.customization.totalPrice}</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">1. Terms of Service</h3>
                <p className="text-gray-700 mb-2">
                  This agreement is between Authentic Fitness & Sports Performance (AFSP) and the participant 
                  for the training program specified above.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">2. Program Commitment</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>The participant agrees to attend scheduled training sessions as outlined in the program.</li>
                  <li>AFSP reserves the right to modify training schedules with reasonable notice.</li>
                  <li>Missed sessions may be rescheduled subject to trainer availability.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">3. Payment Terms</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Payment is due at the time of enrollment unless otherwise agreed.</li>
                  <li>All fees are non-refundable after 48 hours of enrollment.</li>
                  <li>Payment plans may be available for programs exceeding $500.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">4. Health & Safety</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>The participant confirms they are in good health and able to participate in physical training.</li>
                  <li>The participant agrees to inform AFSP of any medical conditions or injuries.</li>
                  <li>AFSP is not liable for injuries sustained during training sessions.</li>
                  <li>The participant should consult a physician before beginning any exercise program.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">5. Code of Conduct</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Participants must treat trainers, staff, and other athletes with respect.</li>
                  <li>AFSP reserves the right to terminate enrollment for violation of conduct policies.</li>
                  <li>Participants are responsible for their personal belongings.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">6. Cancellation Policy</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Sessions must be cancelled at least 24 hours in advance to reschedule.</li>
                  <li>No-shows will be counted as completed sessions.</li>
                  <li>Program cancellations may incur a cancellation fee.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">7. Liability Waiver</h3>
                <p className="text-gray-700 mb-2">
                  The participant acknowledges that participation in athletic training carries inherent risks. 
                  By signing this agreement, the participant waives any claims against AFSP, its trainers, 
                  and staff for injuries or damages arising from participation in the program.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">8. Photography & Media Release</h3>
                <p className="text-gray-700 mb-2">
                  The participant grants AFSP permission to use photographs and videos taken during training 
                  for promotional purposes unless otherwise requested in writing.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3">9. Our Philosophy</h3>
                <p className="text-gray-700 mb-2">
                  AFSP is built on five core principles:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Human-First Excellence:</strong> Science-backed training tailored to each athlete</li>
                  <li><strong>Tailored Holistic Coaching:</strong> Personalized approach to every individual</li>
                  <li><strong>Passion and Purpose:</strong> Commitment to your athletic journey</li>
                  <li><strong>Inclusive Community:</strong> Welcoming environment for all athletes</li>
                  <li><strong>Built to Last:</strong> Sustainable long-term development</li>
                </ul>
              </section>
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-black/30 border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Electronic Signature</h3>
            
            <div className="mb-4">
              <label htmlFor="signature" className="block text-gray-300 mb-2">
                Full Legal Name (Type to Sign)
              </label>
              <input
                type="text"
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors font-serif text-xl"
                placeholder="Type your full name"
              />
            </div>

            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 accent-blue-500"
              />
              <label htmlFor="agree" className="text-gray-300 text-sm">
                I have read and agree to all terms and conditions outlined in this Training Program Agreement. 
                I understand that this electronic signature is legally binding and has the same effect as a 
                handwritten signature.
              </label>
            </div>

            {signatureError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                {signatureError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSign}
                disabled={signing || !signature.trim() || !agreed}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {signing ? (
                  'Signing...'
                ) : (
                  <>
                    <Check size={20} />
                    Sign Agreement
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-white/20 text-gray-300 rounded hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
