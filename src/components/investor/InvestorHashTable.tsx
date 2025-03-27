
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InvestorHash {
  id: number;
  investor_name: string;
  hash_code: string;
  redeemed: boolean;
  created_at: string;
}

interface InvestorHashTableProps {
  hashCodes: InvestorHash[];
}

const InvestorHashTable = ({ hashCodes }: InvestorHashTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Investor Name</TableHead>
            <TableHead>Hash Code</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hashCodes.length > 0 ? (
            hashCodes.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.investor_name}</TableCell>
                <TableCell>{item.hash_code}</TableCell>
                <TableCell>
                  <a 
                    href={`/invest?hash=${item.hash_code}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    /invest?hash={item.hash_code}
                  </a>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${item.redeemed ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {item.redeemed ? 'Redeemed' : 'Available'}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                No hash codes found. Add your first investor above.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvestorHashTable;
