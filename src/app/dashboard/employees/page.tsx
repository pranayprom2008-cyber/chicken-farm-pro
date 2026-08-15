"use client";
import React, { useState, useEffect } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import { Users, UserPlus, Phone, Mail, Calendar, Briefcase, Edit, Trash2, X, Search, Grid, List } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive';
  notes: string;
}

export default function EmployeesPage() {
  const { currentPhone, theme } = useFarmStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const storageKey = `chickfarm-${currentPhone}-employees`;

  useEffect(() => {
    if (currentPhone) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setEmployees(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse employees data");
        }
      }
    }
  }, [currentPhone, storageKey]);

  const saveEmployees = (newData: Employee[]) => {
    setEmployees(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  };

  const handleSaveEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmp: Employee = {
      id: editingEmployee ? editingEmployee.id : `EMP-${Date.now()}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      hireDate: formData.get('hireDate') as string,
      salary: Number(formData.get('salary')),
      status: formData.get('status') as 'active' | 'inactive',
      notes: formData.get('notes') as string,
    };

    if (editingEmployee) {
      saveEmployees(employees.map(emp => emp.id === editingEmployee.id ? newEmp : emp));
    } else {
      saveEmployees([...employees, newEmp]);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      saveEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = employees.filter(e => e.status === 'active').length;

  const roles = [
    'Farm Manager', 'Veterinarian', 'Feed Manager', 'Labour', 'Security', 'Cleaner', 'Driver', 'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-6 h-6" /> Employee Management
          </h1>
          <p className="text-[var(--text-secondary)]">Manage your farm staff and contacts</p>
        </div>
        <button
          onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
          className={`px-4 py-2 text-white flex items-center gap-2 transition-all duration-200 rounded-xl ${
            theme === 'obsidian' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          <UserPlus className="w-5 h-5" /> Add Employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className={`px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
            <span className="text-[var(--text-secondary)] text-sm">Total: </span>
            <span className="font-bold text-[var(--text-primary)]">{employees.length}</span>
          </div>
          <div className={`px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
            <span className="text-[var(--text-secondary)] text-sm">Active: </span>
            <span className="font-bold text-emerald-500">{activeCount}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <p className="text-[var(--text-primary)] font-medium">No employees found.</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Add some employees to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className={`p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-transform hover:-translate-y-1 ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">
                    {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{emp.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {emp.role}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--text-muted)]/20 text-[var(--text-secondary)]'}`}>
                  {emp.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-[var(--text-secondary)] mb-4">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--text-muted)]" /> {emp.phone || 'N/A'}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--text-muted)]" /> {emp.email || 'N/A'}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--text-muted)]" /> Hired: {emp.hireDate}</div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
                <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                  <th className="p-4 font-medium">Name & Role</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Hire Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] text-sm">
                      <div>{emp.phone}</div>
                      <div className="text-xs text-[var(--text-muted)]">{emp.email}</div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] text-sm">{emp.hireDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--text-muted)]/20 text-[var(--text-secondary)]'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl max-h-[90vh] overflow-y-auto ${theme === 'obsidian' ? 'obsidian-glass' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
                <input required type="text" name="name" defaultValue={editingEmployee?.name} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
                <select name="role" defaultValue={editingEmployee?.role || roles[0]} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                  <input required type="text" name="phone" defaultValue={editingEmployee?.phone} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                  <input type="email" name="email" defaultValue={editingEmployee?.email} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Hire Date</label>
                  <input required type="date" name="hireDate" defaultValue={editingEmployee?.hireDate || new Date().toISOString().split('T')[0]} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Salary (₹)</label>
                  <input type="number" min="0" name="salary" defaultValue={editingEmployee?.salary} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
                <select name="status" defaultValue={editingEmployee?.status || 'active'} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
                <textarea name="notes" rows={2} defaultValue={editingEmployee?.notes} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"></textarea>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--border-color)] transition-all">
                  Cancel
                </button>
                <button type="submit" className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-all duration-200 ${
                  theme === 'obsidian' ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}>
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
