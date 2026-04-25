'use client';
import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { Button } from '@potta/components/shadcn/button';
import { Switch } from '@potta/components/shadcn/switch';
import { Label } from '@potta/components/shadcn/label';
import {
  Layout,
  Sidebar,
  Settings as SettingsIcon,
  Monitor,
} from 'lucide-react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Separator } from '@potta/components/shadcn/seperator';

const SettingsPage = () => {
  const context = useContext(ContextData);

  const handleLayoutChange = (mode: 'sidebar' | 'navbar') => {
    if (context?.setLayoutMode) {
      context.setLayoutMode(mode);
    }
  };

  return (
    <div
      className={`p-6 py-3 space-y-6 ${
        context?.layoutMode === 'sidebar' && 'pl-10'
      }  bg-white min-h-screen`}
    >
      {/* Layout Settings */}
      <Card className="">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 flex items-center justify-center">
              <Layout className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-slate-800">
                Layout Preferences
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Choose your preferred navigation layout
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-700">
                Navigation Layout
              </Label>
              <p className="text-xs text-slate-500">
                Switch between sidebar and navbar navigation modes
              </p>
            </div>
          </div>

          <Separator />

          {/* Layout Previews */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-800">
              Layout Preview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sidebar Layout Preview */}
              <div
                className={`border-2  p-4 transition-all duration-200 cursor-pointer ${
                  context?.layoutMode === 'sidebar'
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-slate-200 bg-slate-50'
                }`}
                onClick={() => handleLayoutChange('sidebar')}
              >
                <div className="text-xs font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Sidebar className="h-3 w-3" />
                  Sidebar Layout
                  {context?.layoutMode === 'sidebar' && (
                    <span className="text-green-600 text-xs">(Current)</span>
                  )}
                </div>
                <div
                  className="relative bg-white border border-slate-200  overflow-hidden"
                  style={{ height: '200px' }}
                >
                  {/* Sidebar */}
                  <div className="absolute left-0 top-0 w-16 h-full bg-slate-800 flex flex-col items-center py-3">
                    <div className="w-8 h-8 bg-slate-700  mb-4"></div>
                    <div className="space-y-3">
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                    </div>
                  </div>
                  {/* Main Content */}
                  <div className="ml-16 h-full flex flex-col">
                    {/* Top Bar */}
                    <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4">
                      <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                      <div className="ml-3 w-20 h-3 bg-slate-300 rounded-sm"></div>
                    </div>
                    {/* Content Area */}
                    <div className="flex-1 p-4">
                      <div className="space-y-2">
                        <div className="w-full h-4 bg-slate-200 rounded-sm"></div>
                        <div className="w-3/4 h-4 bg-slate-200 rounded-sm"></div>
                        <div className="w-1/2 h-4 bg-slate-200 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Vertical navigation on the left side
                </p>
              </div>

              {/* Navbar Layout Preview */}
              <div
                className={`border-2  p-4 transition-all duration-200 cursor-pointer ${
                  context?.layoutMode === 'navbar'
                    ? 'border-green-500 bg-green-50/30'
                    : 'border-slate-200 bg-slate-50'
                }`}
                onClick={() => handleLayoutChange('navbar')}
              >
                <div className="text-xs font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Monitor className="h-3 w-3" />
                  Navbar Layout
                  {context?.layoutMode === 'navbar' && (
                    <span className="text-green-600 text-xs">(Current)</span>
                  )}
                </div>
                <div
                  className="relative bg-white border border-slate-200  overflow-hidden"
                  style={{ height: '200px' }}
                >
                  {/* Top Navbar */}
                  <div className="h-12 bg-slate-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-700 "></div>
                      <div className="w-16 h-4 bg-slate-600 rounded-sm"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                      <div className="w-6 h-6 bg-slate-600 rounded-sm"></div>
                    </div>
                  </div>
                  {/* Navigation Menu */}
                  <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4">
                    <div className="w-12 h-3 bg-slate-300 rounded-sm"></div>
                    <div className="w-12 h-3 bg-slate-300 rounded-sm"></div>
                    <div className="w-12 h-3 bg-slate-300 rounded-sm"></div>
                    <div className="w-12 h-3 bg-slate-300 rounded-sm"></div>
                  </div>
                  {/* Content Area */}
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-slate-200 rounded-sm"></div>
                      <div className="w-3/4 h-4 bg-slate-200 rounded-sm"></div>
                      <div className="w-1/2 h-4 bg-slate-200 rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Horizontal navigation at the top
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-slate-50 p-4 ">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <SettingsIcon className="h-3 w-3 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-800">
                  Current Layout:{' '}
                  {context?.layoutMode === 'navbar' ? 'Navbar' : 'Sidebar'}
                </h4>
                <p className="text-xs text-slate-600">
                  {context?.layoutMode === 'navbar'
                    ? 'Using horizontal navigation bar at the top of the screen.'
                    : 'Using vertical sidebar navigation on the left side of the screen.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100  flex items-center justify-center">
              <Monitor className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-slate-800">
                Display Settings
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Customize your display preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-700">
                Responsive Design
              </Label>
              <p className="text-xs text-slate-500">
                Automatically adapt layout for different screen sizes
              </p>
            </div>
            <Switch
              checked={true}
              disabled
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-700">
                Mobile Optimization
              </Label>
              <p className="text-xs text-slate-500">
                Optimize interface for mobile devices
              </p>
            </div>
            <Switch
              checked={true}
              disabled
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-800">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Common settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start text-slate-700 border-slate-200 hover:bg-slate-50"
            onClick={() => window.location.reload()}
          >
            <SettingsIcon className="h-4 w-4 mr-2" />
            Refresh Application
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-slate-700 border-slate-200 hover:bg-slate-50"
            onClick={() => window.open('/dashboard', '_blank')}
          >
            <Layout className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
