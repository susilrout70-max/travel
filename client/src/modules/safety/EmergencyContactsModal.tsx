import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Phone, Trash2, Shield, User, Heart } from 'lucide-react';
import { api } from '../../utils/api';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Family');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/safety/contacts');
      setContacts(res.data.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setError(null);

    try {
      const res = await api.post('/safety/contacts', { name, phone, relation });
      setContacts([...contacts, res.data.data]);
      setName('');
      setPhone('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add contact.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/safety/contacts/${id}`);
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (err) {
      // ignore
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-blue-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
              Trip Safety Circle
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">Emergency Contacts</h3>
          <p className="text-blue-100 text-xs mt-0.5">
            People who will receive immediate SMS/coordinates when SOS is activated
          </p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Add form */}
          <form onSubmit={handleAdd} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              Add Trusted Contact
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone (e.g. +91 98765...)"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Family">Family Member</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Friend">Close Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Save Emergency Contact
            </button>
          </form>

          {/* Contact List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Registered Contacts ({contacts.length})
            </h4>

            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-slate-400 py-2">Loading contacts...</p>
              ) : contacts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <Heart className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 font-medium">
                    No emergency contacts added yet. Add family members or close friends above.
                  </p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800">{contact.name}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-semibold rounded-full">
                            {contact.relation}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
