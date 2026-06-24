import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Compass, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';

export const Home = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto py-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent leading-tight">
          Smart Commerce.<br />Real-Time Delivery.
        </h1>
        <p className="text-lg text-app-text-secondary max-w-2xl mx-auto font-medium">
          Welcome to <strong className="text-app-text-primary">Zephyra</strong>, a modern, role-driven delivery and e-commerce architecture. Switch roles in the developer navigation menu to explore admin configurations, customer flows, and agent GPS maps.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/products">
            <Button size="lg" icon={ArrowRight} iconPosition="right">
              Explore Products
            </Button>
          </Link>
          <a href="file:///c:/Users/deepak/OneDrive/Desktop/zephyra/README.md" target="_blank" rel="noreferrer">
            <Button variant="outline" size="lg">
              Read Docs
            </Button>
          </a>
        </div>
      </section>

      {/* Grid of Roles */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center tracking-tight">
          Designed for Multi-User Roles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect>
            <CardBody className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">1. Customers</h3>
              <p className="text-sm text-app-text-secondary leading-relaxed">
                Order products, track live coordinates on leaflet maps, view transaction invoices, and update profile settings.
              </p>
            </CardBody>
          </Card>

          <Card hoverEffect>
            <CardBody className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-500/10 flex items-center justify-center text-secondary-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">2. Administrators</h3>
              <p className="text-sm text-app-text-secondary leading-relaxed">
                Add products, manage global inventory orders, assign delivery tasks automatically, and audit platform delivery agents.
              </p>
            </CardBody>
          </Card>

          <Card hoverEffect>
            <CardBody className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">3. Delivery Agents</h3>
              <p className="text-sm text-app-text-secondary leading-relaxed">
                Accept delivery job requests, update tracking coordinates live over websocket events, and record signatures.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};
export default Home;
