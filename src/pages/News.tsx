import React from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { LAB_NAME } from '../config/lab';
import { NewsItem } from '../types';
import { Calendar, Tag } from 'lucide-react';

export const News: React.FC = () => {
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: `${LAB_NAME} Secures New Defense Grant`,
      date: "2024-05-15",
      summary: "We are proud to announce a new partnership with the National Defense Research Institute to develop heat-resistant alloys.",
      category: "Award"
    },
    {
      id: '2',
      title: "Best Paper Award at TMS 2024",
      date: "2024-03-10",
      summary: "PhD candidate Sarah Chen received the Best Paper Award for her work on GAN-based phase prediction.",
      category: "Conference"
    },
    {
      id: '3',
      title: "Spring 2024 Lab Workshop",
      date: "2024-02-01",
      summary: `${LAB_NAME} hosted a workshop on AI applications in metallurgy featuring guest speakers from industry leaders.`,
      category: "General"
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-16">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">News & Updates</h1>
        </motion.div>

        <div className="space-y-6">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-soft hover:shadow-soft-hover transition-all duration-300 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                  ${item.category === 'Award' ? 'bg-gold-200 text-gold-700' : 
                    item.category === 'Conference' ? 'bg-primary-100 text-primary-700' : 
                    'bg-gray-200 text-gray-700'}`}>
                  <Tag size={12} /> {item.category}
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                  <Calendar size={14} /> {item.date}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.summary}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};