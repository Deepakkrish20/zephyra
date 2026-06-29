import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Truck, Plus, UserPlus } from 'lucide-react';
import adminApi from '@/services/adminApi';

// Form validation schema
const agentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const DeliveryAgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchLoading, setIsFetchLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const response = await adminApi.getDeliveryAgents();
      if (response.success && response.data) {
        setAgents(response.data.agents);
      }
    } catch (error) {
      console.error('Failed to fetch delivery agents:', error);
      toast.error('Could not load delivery agents roster.');
    } finally {
      setIsFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await adminApi.createDeliveryAgent(data);
      const createdAgent = response.data.user;

      toast.success(`Delivery Agent "${createdAgent.name}" registered successfully!`);

      setAgents((prev) => [createdAgent, ...prev]);
      reset();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || 'Failed to create delivery agent';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery Agent Dispatch Roster</h1>
        <p className="text-sm text-app-text-secondary">
          Verify, add, and monitor active dispatch agent locations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-base">Register Delivery Agent</h3>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-app-text-secondary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                      errors.name ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
                    }`}
                    placeholder="E.g., John Miller"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-danger-500 font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-app-text-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                      errors.email ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
                    }`}
                    placeholder="agent@zephyra.io"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-danger-500 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-app-text-secondary mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                      errors.password
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-app-border'
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-danger-500 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {isLoading ? 'Registering...' : 'Add Agent'}
                </button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Courier Registry List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-secondary-600" />
                <h3 className="font-bold text-base">Courier Registry</h3>
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                    <th className="px-6 py-3.5">Agent Tag</th>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Duty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {isFetchLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-app-text-secondary">
                        Loading delivery agents...
                      </td>
                    </tr>
                  ) : agents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-app-text-secondary">
                        No delivery agents registered yet.
                      </td>
                    </tr>
                  ) : (
                    agents.map((agent) => (
                      <tr
                        key={agent._id}
                        className="hover:bg-app-bg-secondary/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-primary-600">
                          #ZEP-DRV-{agent._id.substring(18).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-semibold">{agent.name}</td>
                        <td className="px-6 py-4 text-app-text-secondary">{agent.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant="success" dot>
                            Registered (Ready)
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentManagement;
