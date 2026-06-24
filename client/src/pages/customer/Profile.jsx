import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { User, Mail, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Account Profile</h1>
        <p className="text-sm text-app-text-secondary">Update your credentials and contact preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-base">Account Information</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input label="Full Name" defaultValue={user?.name || 'Jane Doe'} />
          <Input label="Email Address" defaultValue={user?.email || 'jane@example.com'} icon={Mail} readOnly disabled />
          
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-yellow-800 dark:text-yellow-400">Security Credentials</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Email editing is disabled. Contact your architect regarding backend authentication integration schemas.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Reset Changes</Button>
            <Button>Save Settings</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default Profile;
