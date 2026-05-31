'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
}: TableProps) {
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Head */}
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-sm font-semibold text-slate-300 ${
                    column.width ? column.width : ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          {loading ? (
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="h-4 bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-slate-400">{emptyMessage}</p>
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              {data.map((row, i) => (
                <motion.tr
                  key={i}
                  custom={i}
                  variants={rowVariants}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors duration-200 group"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-slate-300 group-hover:text-white transition-colors ${
                        column.width ? column.width : ''
                      }`}
                    >
                      {column.render ? column.render(row[column.key]) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>
    </Card>
  );
}
