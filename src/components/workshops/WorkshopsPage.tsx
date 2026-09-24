import React from 'react';
import { WORKSHOPS } from '../../data/mockData';
import { WorkshopsSection } from '../home/WorkshopsSection';

export const WorkshopsPage: React.FC = () => {
  return (
    <div className="bg-[#F7EBD7] min-h-screen py-8 sm:py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#07545A] font-display">
          Artisan Craft Workshops
        </h1>
        <p className="text-xs sm:text-sm text-[#173B3D]/70 mt-1 max-w-2xl">
          Learn directly from India’s leading handmade creators. Small interactive batches with materials delivered to your doorstep.
        </p>
      </div>
      <WorkshopsSection />
    </div>
  );
};
