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

export default function SignInPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('Logged in successfully!');
            router.push('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="grid min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-transparent">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-92 h-fit w-full">
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
                            <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Your Account</h1>
                            <p>Welcome back! Please sign in to continue</p>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="block text-sm">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="block text-sm">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    required
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Continue'}
                            </Button>
                        </div>
                    </div>

                    <p className="text-accent-foreground text-center text-sm">
                        Don't have an account?
                        <Button
                            asChild
                            variant="link"
                            className="px-2"
                            disabled={isLoading}>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </p>
                </form>
            </div>

            <div className="relative hidden lg:block">
                <Image
                    src="/sign-in-cover.svg"
                    alt="Sign in illustration"
                    fill
                    className="object-cover"
                />
            </div>
        </section>
    );
}
