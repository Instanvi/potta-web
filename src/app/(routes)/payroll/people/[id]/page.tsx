'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { peopleApi } from '../utils/api';
import Button from '@potta/components/button';
import MyTable from '@potta/components/table';
import {
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiMapPinLine,
  RiBuildingLine,
} from 'react-icons/ri';
import PersonalTab from './employeeTabs/PersonalTab';
import BenefitsTab from './employeeTabs/BenefitsTab';
import PTOTab from './employeeTabs/PTOTab';
import ShiftsTab from './employeeTabs/ShiftsTab';
import PayInfoTab from './employeeTabs/PayInfoTab';
import { useRoles } from '../hooks/useRoles';
import { Avatar, AvatarImage, AvatarFallback } from '@potta/components/avatar';

const TABS = [
  'Personal',
  'Job',
  'Benefits',
  'Timesheet',
  'Pay Info',
  'Performance',
  'PTO',
  'Documents',
];

interface EmployeeDetailsPageProps {
  employeeId: string;
}

const EmployeeDetailsPage: React.FC<EmployeeDetailsPageProps> = ({
  employeeId,
}) => {
  const id = employeeId;
  const [employee, setEmployee] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Personal');
  const { data: roles = [], isLoading: loadingRoles } = useRoles();

  // Use roleName directly from employee data instead of looking up by role_id
  const roleName = employee?.role_name || 'Unknown';

  useEffect(() => {
    if (id) {
      peopleApi.getPerson(id).then(setEmployee);
    }
  }, [id]);

  return (
    <div className="flex overflow-y-hidden w-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-[17%]  p-8 border-r flex flex-col items-start">
        <img
          src={
            employee?.profilePicture ||
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
          }
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover mb-4 self-center"
        />
        <div className="text-left w-full space-y-2">
          {/* <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <RiUserLine />
            {loadingRoles ? 'Loading...' : roleName}
          </div> */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RiUserLine />
            {employee?.matricule || '#988-987'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RiPhoneLine />
            {employee?.phone || '+237 654 666 765'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RiMailLine />
            {employee?.email || 'hia@yourdomain.com'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RiTimeLine />
            11:30 WET
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RiMapPinLine />
            Bonaberi
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RiBuildingLine />
            Marketing
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-10 h-full overflow-y-auto">
        {/* Header: Name and Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-green-800 mb-1 text-left">
            {employee?.firstName || 'Janifer'} {employee?.lastName || 'Hudson'}
          </h2>
          <div className="text-lg text-gray-600 mb-6 text-left">
            {loadingRoles ? 'Loading...' : roleName}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex space-x-8 border-b mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-2 text-lg font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === 'Personal' && <PersonalTab employee={employee} />}
        {activeTab === 'Benefits' && <BenefitsTab employee={employee} />}
        {activeTab === 'PTO' && <PTOTab employee={employee} />}
        {activeTab === 'Shifts' && <ShiftsTab employee={employee} />}
        {activeTab === 'Pay Info' && <PayInfoTab employee={employee} />}
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;
