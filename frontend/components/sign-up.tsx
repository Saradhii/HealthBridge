'use client';

import { useState } from 'react';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const signUpSchema = z.object({
  hospitalName: z.string().min(1, 'Hospital name is required'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignUpForm>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            hospitalName: '',
            adminName: '',
            adminEmail: '',
            adminPassword: '',
        },
    });

    const handleSubmit = async (data: SignUpForm) => {
        setIsLoading(true);

        try {
            await register(data);
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
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
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
                                <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        The backend is deployed on Render with a 50-second cold start delay. Please expect a delay on the first request.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="hospitalName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Hospital Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter hospital name"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="adminName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Admin Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter admin name"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="adminEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Admin Email <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter admin email"
                                                    disabled={isLoading}
                                                    autoComplete="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="adminPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Admin Password <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    placeholder="Enter password (min 8 characters)"
                                                    disabled={isLoading}
                                                    autoComplete="new-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Minimum 8 characters
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                </Form>
            </div>
        </section>
    );
}
