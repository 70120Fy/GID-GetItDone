
import React from 'react';
import { DatabaseData } from '../../types';

interface DatabaseBlockProps {
  data: DatabaseData;
  onChange: (newData: DatabaseData) => void;
}

export const DatabaseBlock: React.FC<DatabaseBlockProps> = ({ data, onChange }) => {
  const addRow = () => {
    const newData = { ...data };
    const newRow = data.columns.reduce((acc, col) => ({ ...acc, [col.id]: col.type === 'checkbox' ? false : '' }), { id: Math.random().toString(36).substr(2, 9) });
    newData.rows.push(newRow);
    onChange(newData);
  };

  const updateCell = (rowIndex: number, colId: string, value: any) => {
    const newData = { ...data };
    newData.rows[rowIndex][colId] = value;
    onChange(newData);
  };

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
              {data.columns.map(col => (
                <th key={col.id} className="px-4 py-3 font-semibold text-zinc-500 dark:text-zinc-500 min-w-[120px]">
                  {col.title}
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rIdx) => (
              <tr key={row.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                {data.columns.map(col => (
                  <td key={col.id} className="px-4 py-2">
                    {col.type === 'checkbox' ? (
                      <input 
                        type="checkbox" 
                        checked={row[col.id]} 
                        onChange={(e) => updateCell(rIdx, col.id, e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white focus:ring-zinc-500"
                      />
                    ) : (
                      <input 
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={row[col.id] || ''}
                        onChange={(e) => updateCell(rIdx, col.id, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 placeholder-zinc-200 dark:placeholder-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    )}
                  </td>
                ))}
                <td>
                  <button 
                    className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-400"
                    onClick={() => {
                      const newData = { ...data };
                      newData.rows.splice(rIdx, 1);
                      onChange(newData);
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        onClick={addRow}
        className="w-full py-3 text-sm text-zinc-400 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all font-medium border-t border-zinc-100 dark:border-zinc-800"
      >
        + New Row
      </button>
    </div>
  );
};
