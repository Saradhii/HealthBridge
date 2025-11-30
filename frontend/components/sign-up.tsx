'use client';

import { useState, FormEvent } from 'react';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth';

export default function SignUpPage() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        hospitalName: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.hospitalName || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.adminPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await register(formData);
            toast.success('Hospital registered successfully!');
            router.push('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden lg:block">
                <Image
                    src="/sign-in-cover-2.svg"
                    alt="Sign up illustration"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-transparent">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-96 h-fit w-full">
                    <div className="p-6">
                    <div>
  <Link
    href="/"
    aria-label="go home"
    className="flex items-center gap-2"
  >
    <LogoIcon />
    <span>HealthBridge</span>
  </Link>

  <h1 className="mb-1 mt-4 text-xl font-semibold">Create a Hospital Account</h1>
  <p>Welcome! Register your hospital to get started</p>
</div>


                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="hospitalName"
                                    className="block text-sm">
                                    Hospital Name
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    name="hospitalName"
                                    id="hospitalName"
                                    value={formData.hospitalName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="adminName"
                                    className="block text-sm">
                                    Admin Name
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    name="adminName"
                                    id="adminName"
                                    value={formData.adminName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="adminEmail"
                                    className="block text-sm">
                                    Admin Email
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    name="adminEmail"
                                    id="adminEmail"
                                    value={formData.adminEmail}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="adminPassword"
                                    className="block text-sm">
                                    Admin Password
                                </Label>
                                <Input
                                    type="password"
                                    required
                                    name="adminPassword"
                                    id="adminPassword"
                                    value={formData.adminPassword}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 8 characters
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Continue'}
                            </Button>
                        </div>
                    </div>

                    <p className="text-accent-foreground text-center text-sm">
                        Have an account?
                        <Button
                            asChild
                            variant="link"
                            className="px-2"
                            disabled={isLoading}>
                            <Link href="/signin">Sign In</Link>
                        </Button>
                    </p>
                </form>
            </div>
        </section>
    );
}
