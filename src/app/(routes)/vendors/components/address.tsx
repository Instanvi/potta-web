import Input from '@potta/components/input';

import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface AddressFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<{
    postalCode: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
  }>;
}
const Address: React.FC<AddressFormProps> = ({ register, errors }) => {
  return (
    <div>
      <Input
        label="Address"
        type="text"
        name="address.address"
        placeholder="Enter address"
        register={register}
        errors={errors?.address}
        required
      />
      <div className="w-full grid mt-4 grid-cols-2 gap-3">

      <Input
        label="Country"
        type="text"
        name="address.country"
        placeholder="Enter country"
        register={register}
        errors={errors?.country}
        required
      />
      <Input
        label="City"
        type="text"
        name="address.city"
        placeholder="Enter city"
        register={register}
        errors={errors?.city}
        required
      />
      </div>
<div className="w-full grid mt-4 grid-cols-2 gap-3">

      <Input
        label="State"
        type="text"
        name="address.state"
        placeholder="Enter state"
        register={register}
        errors={errors?.state}
      />

      <Input
        label="Postal Code"
        type="text"
        name="address.postalCode"
        placeholder="Enter postal code"
        register={register}
        errors={errors?.postalCode}
      />
</div>
    </div>
  );
};
export default Address;
