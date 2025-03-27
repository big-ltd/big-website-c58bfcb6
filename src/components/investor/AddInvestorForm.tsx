
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';

interface AddInvestorFormProps {
  onAddInvestor: (investorName: string) => Promise<void>;
}

const AddInvestorForm = ({ onAddInvestor }: AddInvestorFormProps) => {
  const [newInvestorName, setNewInvestorName] = useState('');

  const handleSubmit = async () => {
    await onAddInvestor(newInvestorName);
    setNewInvestorName('');
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl text-white mb-4">Add New Investor</h2>
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Investor Name"
          value={newInvestorName}
          onChange={(e) => setNewInvestorName(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleSubmit}>
          <Plus className="h-4 w-4 mr-2" /> Generate Hash Code
        </Button>
      </div>
    </div>
  );
};

export default AddInvestorForm;
