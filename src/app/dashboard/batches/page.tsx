"use client";

import { useState } from 'react';
import { useFarmStore } from '@/store/useFarmStore';
import Modal from '@/components/Modal';
import { Plus, Edit2, Trash2, Skull } from 'lucide-react';

export default function BatchesPage() {
  const { batches, theme, addBatch, updateBatch, deleteBatch } = useFarmStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<any>(null);

  const cardClass = `bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm ${theme === 'obsidian' ? 'obsidian-glass' : ''}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Batch Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
        >
          <Plus size={18} />
          <span>Add New Batch</span>
        </button>
      </div>

      {batches.length === 0 ? (
        <div className={`p-12 text-center flex flex-col items-center justify-center ${cardClass}`}>
          <div className="bg-[var(--bg-secondary)] p-4 rounded-full mb-4">
            <Plus size={32} className="text-[var(--text-muted)]" />
          </div>
          <h2 className="text-xl font-medium mb-2">No batches yet</h2>
          <p className="text-[var(--text-secondary)] mb-6">Create your first batch to start tracking your farm.</p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl transition-all duration-200"
          >
            Add First Batch
          </button>
        </div>
      ) : (
        <div className={`overflow-x-auto ${cardClass}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                <th className="p-4 font-medium rounded-tl-2xl">Name</th>
                <th className="p-4 font-medium">Breed</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Alive</th>
                <th className="p-4 font-medium">Dead</th>
                <th className="p-4 font-medium">Mortality %</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="p-4 font-medium">{batch.name}</td>
                  <td className="p-4">{batch.breedType}</td>
                  <td className="p-4">{batch.totalChicks}</td>
                  <td className="p-4 text-emerald-500">{batch.chicksAlive}</td>
                  <td className="p-4 text-red-500">{batch.chicksDead}</td>
                  <td className="p-4">{batch.mortalityPercentage.toFixed(2)}%</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium
                      ${batch.status === 'growing' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      ${batch.status === 'sold' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                      ${batch.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' : ''}
                    `}>
                      {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-amber-500 transition-colors" title="Record Mortality">
                        <Skull size={18} />
                      </button>
                      <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-blue-500 transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-red-500 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals for Add/Edit/Mortality would go here using the Modal component */}
    </div>
  );
}
