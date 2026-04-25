import React from 'react';
import Slider from '@potta/components/slideover';
import { useGetAsset } from '../hooks/useGetAsset';

const ViewAssetModal = ({
  open,
  setOpen,
  assetId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  assetId: string;
}) => {
  const { data: asset, isLoading } = useGetAsset(assetId);
  return (
    <Slider
      open={open}
      setOpen={setOpen}
      edit={false}
      title="View Asset"
      // buttonText="assetsss"
    >
      {isLoading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : asset ? (
        <form className="relative overflow-hidden w-full max-w-4xl">
          <div className="grid grid-cols-2 min-h-full gap-4 p-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-600">Name:</div>
                <div>{asset.name}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Type:</div>
                <div>{asset.asset_type}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Status:</div>
                <div>{asset.status}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Location:</div>
                <div>{asset.location}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Description:</div>
                <div>{asset.description}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Serial Number:</div>
                <div>{asset.serial_number}</div>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-600">
                  Acquisition Date:
                </div>
                <div>{asset.acquisition_date}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">
                  Acquisition Cost:
                </div>
                <div>{asset.acquisition_cost}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Book Value:</div>
                <div>{asset.acquisition_cost ?? '-'}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">
                  Useful Life (years):
                </div>
                <div>{asset.useful_life_years}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Salvage Value:</div>
                <div>{asset.salvage_value}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">
                  Depreciation Method:
                </div>
                <div>{asset.depreciation_method}</div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-8 text-center text-red-500">Asset not found.</div>
      )}
    </Slider>
  );
};

export default ViewAssetModal;
