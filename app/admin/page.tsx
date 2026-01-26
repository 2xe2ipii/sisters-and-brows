'use client'

import { useState, useEffect } from 'react';
import { 
  fetchServices, upsertService, removeServiceAction, 
  fetchAppConfig, updateTimeSlots, updateBranches 
} from '@/app/actions';
import { Lock, Plus, Edit, Trash, Save, X, Image as ImageIcon, Settings, List, MapPin, Clock, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'CONFIG'>('SERVICES');
  
  // Data
  const [services, setServices] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  
  // Editing State
  const [editingService, setEditingService] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  async function loadData() {
    setLoading(true);
    const sRes = await fetchServices();
    if (sRes.success) setServices(sRes.data);
    
    const cRes = await fetchAppConfig();
    if (cRes.success) {
      setTimeSlots(cRes.data.timeSlots || []);
      setBranches(cRes.data.branches || []);
    }
    setLoading(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) setIsAuthenticated(true);
  };

  // --- SERVICE HANDLERS ---
  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure? This is irreversible.")) return;
    await removeServiceAction(id, password);
    loadData();
  };

  // --- CONFIG HANDLERS ---
  const handleAddTimeSlot = () => setTimeSlots([...timeSlots, "12:00 PM - 1:30 PM"]);
  const handleRemoveTimeSlot = (idx: number) => setTimeSlots(timeSlots.filter((_, i) => i !== idx));
  const handleTimeSlotChange = (idx: number, val: string) => {
    const newSlots = [...timeSlots];
    newSlots[idx] = val;
    setTimeSlots(newSlots);
  };
  const saveTimeSlots = async () => {
    if(!confirm("Changing time slots may affect future bookings availability checks. Continue?")) return;
    await updateTimeSlots(password, timeSlots);
    alert("Time slots updated!");
  };

  const handleAddBranch = () => setBranches([...branches, { name: "New Branch", code: "NB", limit: 4 }]);
  const handleRemoveBranch = (idx: number) => setBranches(branches.filter((_, i) => i !== idx));
  const handleBranchChange = (idx: number, field: string, val: any) => {
    const newBranches = [...branches];
    newBranches[idx] = { ...newBranches[idx], [field]: val };
    setBranches(newBranches);
  };
  const saveBranches = async () => {
    await updateBranches(password, branches);
    alert("Locations updated! NOTE: If you added a new location, please contact the developer to update the Google Apps Script for the spreadsheet.");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full space-y-4">
          <div className="flex justify-center mb-4"><div className="p-3 bg-rose-100 rounded-full"><Lock className="w-6 h-6 text-rose-500" /></div></div>
          <h1 className="text-xl font-bold text-center text-slate-800">Admin Access</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" />
          <button className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <div className="flex gap-2">
           <button onClick={() => setActiveTab('SERVICES')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'SERVICES' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-100'}`}>
             <List className="w-4 h-4" /> Services
           </button>
           <button onClick={() => setActiveTab('CONFIG')} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'CONFIG' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-100'}`}>
             <Settings className="w-4 h-4" /> Configuration
           </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        
        {/* --- TAB: SERVICES --- */}
        {activeTab === 'SERVICES' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Services List</h2>
              <button onClick={() => setEditingService({})} className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg font-bold shadow hover:bg-rose-600 transition"><Plus className="w-4 h-4" /> Add Service</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3 group">
                  <div className="relative h-40 bg-slate-100 rounded-lg overflow-hidden">
                    {svc.image ? <img src={svc.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300"><ImageIcon /></div>}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded">{svc.price}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{svc.name}</h3>
                    <p className="text-xs text-slate-500 uppercase">{svc.category}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{svc.desc}</p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                    <button onClick={() => setEditingService(svc)} className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 rounded hover:bg-slate-100">Edit</button>
                    <button onClick={() => handleDeleteService(svc.id)} className="flex-1 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 rounded hover:bg-rose-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: CONFIGURATION --- */}
        {activeTab === 'CONFIG' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* TIME SLOTS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
               <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                 <Clock className="w-5 h-5 text-rose-500" />
                 <h2 className="font-bold text-lg text-slate-800">Time Frames</h2>
               </div>
               <div className="space-y-2">
                 {timeSlots.map((slot, idx) => (
                   <div key={idx} className="flex gap-2">
                     <input 
                       value={slot} 
                       onChange={(e) => handleTimeSlotChange(idx, e.target.value)}
                       className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-medium"
                     />
                     <button onClick={() => handleRemoveTimeSlot(idx)} className="p-2 text-slate-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                   </div>
                 ))}
                 <button onClick={handleAddTimeSlot} className="text-xs font-bold text-rose-500 hover:underline">+ Add Time Slot</button>
               </div>
               <button onClick={saveTimeSlots} className="w-full py-2 bg-slate-800 text-white rounded-lg font-bold text-sm">Save Time Slots</button>
            </div>

            {/* LOCATIONS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
               <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                 <MapPin className="w-5 h-5 text-rose-500" />
                 <h2 className="font-bold text-lg text-slate-800">Locations & Capacity</h2>
               </div>
               
               <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3">
                 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                 <p className="text-xs text-amber-700 leading-relaxed">
                   <strong>Important:</strong> If you add a new location here, you MUST update the Google Sheets script logic manually. Changing capacity (limit) is safe and immediate.
                 </p>
               </div>

               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                 {branches.map((branch, idx) => (
                   <div key={idx} className="p-3 border border-slate-100 rounded-lg bg-slate-50 space-y-2">
                     <div className="flex gap-2">
                        <input value={branch.name} onChange={(e) => handleBranchChange(idx, 'name', e.target.value)} className="flex-[2] p-2 text-xs border rounded" placeholder="Branch Name" />
                        <input value={branch.code} onChange={(e) => handleBranchChange(idx, 'code', e.target.value)} className="flex-1 p-2 text-xs border rounded" placeholder="Code (e.g. PQ)" />
                        <button onClick={() => handleRemoveBranch(idx)} className="text-slate-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-500">Max Capacity:</span>
                       <input type="number" value={branch.limit} onChange={(e) => handleBranchChange(idx, 'limit', parseInt(e.target.value))} className="w-16 p-1 text-xs border rounded text-center" />
                     </div>
                   </div>
                 ))}
                 <button onClick={handleAddBranch} className="text-xs font-bold text-rose-500 hover:underline">+ Add Location</button>
               </div>
               <button onClick={saveBranches} className="w-full py-2 bg-slate-800 text-white rounded-lg font-bold text-sm">Save Locations</button>
            </div>

          </div>
        )}
      </div>

      {/* --- EDIT MODAL (Services) --- */}
      {editingService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg">{editingService.id ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setEditingService(null)} className="p-1 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form action={async (formData) => {
                formData.append('adminPassword', password);
                await upsertService(null, formData);
                setEditingService(null);
                loadData();
            }} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingService.id || ""} />
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-400">Name</label><input name="name" defaultValue={editingService.name} required className="w-full p-2 border rounded-lg" /></div>
                 <div className="space-y-1"><label className="text-xs font-bold text-slate-400">Price</label><input name="price" defaultValue={editingService.price} required className="w-full p-2 border rounded-lg" placeholder="4999" /></div>
              </div>
              
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400">Image URL</label>
                 <div className="flex gap-2">
                   <input name="image" defaultValue={editingService.image} required className="w-full p-2 border rounded-lg" placeholder="https://... or /filename.jpg" />
                 </div>
                 <p className="text-[10px] text-slate-400">Paste a URL or a filename from the public folder.</p>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-400">Category</label>
                 <select name="category" defaultValue={editingService.category || "Brows"} className="w-full p-2 border rounded-lg bg-white">
                    {["Bundles", "Mix & Match", "Brows", "Lips", "Skin", "Eyes"].map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>

              <div className="space-y-1"><label className="text-xs font-bold text-slate-400">Description</label><textarea name="desc" defaultValue={editingService.desc} rows={3} className="w-full p-2 border rounded-lg" /></div>

              <button type="submit" className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}