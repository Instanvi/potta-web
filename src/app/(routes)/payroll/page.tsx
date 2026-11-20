"use client"
import React from 'react';
import RootLayout from '../layout';
import { useRouter } from 'next/navigation';
import { employeeApi } from './utils/api';

const Payroll = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkEmployees = async () => {
      try {
        const res = await employeeApi.filterEmployees({ limit: 1 });
        if (res?.data?.data && res.data.data.length > 0) {
          router.replace('/payroll/overview');
          console.log("Employees found")
        } else {
          setLoading(false);
          console.log("Employees not found")
        }
      } catch (e) {
        setLoading(false);
      }
    };
    checkEmployees();
  }, [router]);

  if (loading) {
    return null;
  }

  const handleNavigation = (route: any) => {
    router.push(route);
  };

  return (
    <RootLayout>
      <div className="w-full h-[80%] flex justify-center items-center">
        <div>
          <div className="flex justify-center">
            <img src="/icons/team-work.svg" alt="Team Work" />
          </div>
          <p className="-mt-20 text-center text-2xl">
            Better Pay, Happier Employees
          </p>

          <div className="mt-5 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-48 p-4 ">
                <div
                  className="w-full h-24 cursor-pointer flex justify-center items-center bg-[#F9F9F9] hover:bg-[#f0f0f0] transition-colors"
                  onClick={() => handleNavigation('/payroll/people')}
                >
                  <img
                    src="/icons/people.svg"
                    className="h-12 w-auto"
                    alt="People Icon"
                  />
                </div>
                <p className="text-center">Add People</p>
              </div>
              <div className="w-48 p-4 ">
                <div
                  className="w-full h-24 cursor-pointer flex justify-center items-center bg-[#F9F9F9] hover:bg-[#f0f0f0] transition-colors"
                  onClick={() => handleNavigation('/payroll/benefit')}
                >
                  <img
                    src="/icons/heart.svg"
                    className="h-12 w-auto"
                    alt="Heart Icon"
                  />
                </div>
                <p className="text-center">Setup Benefits</p>
              </div>
              <div className="w-48 p-4 ">
                <div
                  className="w-full h-24 cursor-pointer flex justify-center items-center bg-[#F9F9F9] hover:bg-[#f0f0f0] transition-colors"
                  onClick={() => handleNavigation('/payroll/taxation')}
                >
                  <img
                    src="/icons/taxesh.svg"
                    className="h-12 w-auto"
                    alt="Taxes Icon"
                  />
                </div>
                <p className="text-center">Setup Taxation and Compliance</p>
              </div>
              <div className="w-48 p-4 ">
                <div
                  className="w-full h-24 cursor-pointer flex justify-center items-center bg-[#F9F9F9] hover:bg-[#f0f0f0] transition-colors"
                  onClick={() =>
                    handleNavigation('/payroll/retirement-compliance')
                  }
                >
                  <img
                    src="/icons/pig.svg"
                    className="h-12 w-auto"
                    alt="Pig Icon"
                  />
                </div>
                <p className="text-center">Setup Retirement Compliance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default Payroll;
