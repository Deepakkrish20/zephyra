import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Users } from 'lucide-react';

export const CustomerManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Registries</h1>
        <p className="text-sm text-app-text-secondary">View registered user accounts and auditing flags.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-base">Registered Users</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Verification Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              <tr className="hover:bg-app-bg-secondary/40 transition-colors">
                <td className="px-6 py-4 font-bold">Jane Doe</td>
                <td className="px-6 py-4 font-semibold text-app-text-secondary">jane@example.com</td>
                <td className="px-6 py-4">June 24, 2026</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};
export default CustomerManagement;
