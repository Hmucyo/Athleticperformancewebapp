import { useState, useEffect } from "react";
import { FileText, Check, Clock, Download, Eye } from "lucide-react";
import { projectId } from '../../utils/supabase/info';

interface ContractManagementProps {
  user: any;
}

export function ContractManagement({ user }: ContractManagementProps) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/admin/contracts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || []);
      } else {
        console.error('Failed to fetch contracts');
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = filterStatus === 'all'
    ? contracts
    : contracts.filter(c => c.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'text-green-400 bg-green-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'expired':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const stats = {
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'signed').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    thisMonth: contracts.filter(c => {
      const signedDate = new Date(c.signedAt);
      const now = new Date();
      return signedDate.getMonth() === now.getMonth() && signedDate.getFullYear() === now.getFullYear();
    }).length
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading contracts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">Contract Management</h1>
        <p className="text-gray-400">View and manage training program agreements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Total Contracts</h3>
            <FileText className="text-blue-400" size={20} />
          </div>
          <p className="text-white text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-gray-900 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Signed</h3>
            <Check className="text-green-400" size={20} />
          </div>
          <p className="text-white text-3xl font-bold">{stats.signed}</p>
        </div>

        <div className="bg-gray-900 border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">Pending</h3>
            <Clock className="text-yellow-400" size={20} />
          </div>
          <p className="text-white text-3xl font-bold">{stats.pending}</p>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm">This Month</h3>
            <FileText className="text-purple-400" size={20} />
          </div>
          <p className="text-white text-3xl font-bold">{stats.thisMonth}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${ 
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Contracts
        </button>
        <button
          onClick={() => setFilterStatus('signed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === 'signed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Signed
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filterStatus === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Pending
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-gray-900 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Athlete</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Program</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Signed Date</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Status</th>
                <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No contracts found
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{contract.userName}</p>
                        <p className="text-gray-400 text-sm">{contract.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{contract.programName}</p>
                      {contract.customization && (
                        <p className="text-gray-400 text-sm">Custom Program</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">
                        {new Date(contract.signedAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(contract.signedAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          ></div>
          
          <div className="relative bg-gray-900 border border-white/20 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">Contract Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Athlete Info */}
              <div className="bg-black/30 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Athlete Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Name</p>
                    <p className="text-white">{selectedContract.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white">{selectedContract.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="bg-black/30 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Program Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Program Name</p>
                    <p className="text-white">{selectedContract.programName}</p>
                  </div>
                  
                  {selectedContract.customization && (
                    <>
                      {selectedContract.customization.goals && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Goals</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedContract.customization.goals.map((goal: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedContract.customization.format && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Format</p>
                            <p className="text-white">{selectedContract.customization.format}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Session Type</p>
                            <p className="text-white">{selectedContract.customization.sessionType}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedContract.customization.sessions && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Sessions</p>
                            <p className="text-white">{selectedContract.customization.sessions}</p>
                          </div>
                          {selectedContract.customization.totalPrice && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Total Price</p>
                              <p className="text-white">${selectedContract.customization.totalPrice}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-black/30 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Contract Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Signature</p>
                    <p className="text-white font-serif text-lg">{selectedContract.signature}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Signed Date</p>
                    <p className="text-white">
                      {new Date(selectedContract.signedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>
                      {selectedContract.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Version</p>
                    <p className="text-white">{selectedContract.version}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
