import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Mail } from 'lucide-react';

interface PassengerFormProps {
  onSubmit?: (name: string, email: string) => void;
}

export function PassengerForm({ onSubmit }: PassengerFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSubmit?.(name, email);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Passenger Details
          </CardTitle>
          <p className="text-sm text-gray-600">Enter your information to create booking</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Booking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
