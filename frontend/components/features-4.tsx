import { Calendar, Users, Shield, Activity, FileText, Clock } from 'lucide-react'

export default function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Powerful Healthcare Features</h2>
                    <p>HealthBridge provides everything you need to manage your healthcare practice efficiently and securely.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="size-4" />
                            <h3 className="text-sm font-medium">Patient Management</h3>
                        </div>
                        <p className="text-sm">Complete patient profiles with medical history, treatments, and care records in one secure location.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <h3 className="text-sm font-medium">Smart Scheduling</h3>
                        </div>
                        <p className="text-sm">Efficient appointment booking with calendar integration and automated reminders.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Shield className="size-4" />
                            <h3 className="text-sm font-medium">Secure & Compliant</h3>
                        </div>
                        <p className="text-sm">HIPAA-compliant security measures to protect sensitive patient data.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Activity className="size-4" />
                            <h3 className="text-sm font-medium">Real-time Dashboard</h3>
                        </div>
                        <p className="text-sm">Monitor practice performance with comprehensive analytics and insights.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="size-4" />
                            <h3 className="text-sm font-medium">Digital Records</h3>
                        </div>
                        <p className="text-sm">Paperless record management with easy access and sharing capabilities.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <h3 className="text-sm font-medium">24/7 Access</h3>
                        </div>
                        <p className="text-sm">Access your practice data anytime, anywhere with our cloud-based platform.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
